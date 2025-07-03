'use strict';
module.exports = {
  cacheModel: require('../models/cache_model'),
  fragment_lib: require('./fragment_lib_scylla.js'),
  file_lib: require('./file_lib_scylla.js'),
  PromiseOrchestrator: require('../helpers/promiseOrchestrator.js'),
  persist: async function(component, data, history, processId) {
    // console.log('__persisting cache', data)
    let cachedData;
    const cachedDataIn = await this.cacheModel.getInstance().model.findOne({
      _id: component._id
    }).lean().exec();
    cachedData = cachedDataIn;


    if (cachedDataIn && cachedDataIn != null) {
      if(cachedDataIn.frag) {
        try{
          await this.fragment_lib.cleanFrag(cachedDataIn.frag);
        }catch(e) {
          console.warn('cache not cleaned', cachedDataIn.frag);
        }
      }
    } else {
      cachedData = {};
    }

    // console.log('start deleteManyFile cache : ',processId)
    await this.file_lib.deleteMany({
      cacheId: component._id.toString()
    });

    // console.log('data before', data);
    await this.duplicateFile(data, null, component._id);
    // console.log('data after',data);

    const frag = await this.fragment_lib.persist(data);

    // await this.fragment_lib.displayFragTree(frag.id)
    // await new Promise(resolve => setTimeout(resolve, 1000));

    cachedData.frag = frag.id.toString();
    cachedData.date = new Date();
    if (history == true) {
      cachedData.history = cachedData.history || [];
      cachedData.history.push({
        frag: frag.id.toString(),
        date: new Date()
      });
    }

    return await this.cacheModel.getInstance().model.findOneAndUpdate({
      _id: component._id
    },
    cachedData, {
      upsert: true,
      new: true
    }).lean().exec();
  },

  get: function(component, resolveFrag, processId) {
    // console.log('CACHE processId', processId);
    const promiseOrchestrator = new this.PromiseOrchestrator();
    return new Promise(async(resolve, reject) => {
      const cachedData = await this.cacheModel.getInstance().model.findOne({
        _id: component._id
      }).lean().exec();

      let dataDefraged;

      if (cachedData != undefined) {
        if (component.specificData.historyOut != true) {
          if (cachedData.frag != undefined) {
            if (resolveFrag == true) {
              // console.log('_____resolveFrag_____', cachedData.frag)
              // this.fragment_lib.displayFragTree(cachedData.frag)
              // await new Promise(resolve => setTimeout(resolve, 1000));
              try{
                dataDefraged = await this.fragment_lib.getWithResolutionByBranch(cachedData.frag);
              }catch(e) {
                console.log('reding cache', e);
              }
              // console.log('___dataDefraged', dataDefraged[0])
              // console.log('CACHE processId', processId);
              await this.duplicateFile(dataDefraged, processId, null);
            } else {
              dataDefraged = await this.fragment_lib.get(cachedData.frag);
            }
          } else {
            reject(new Error('frag of cache doesn\'t exist'));
          }
        } else {
          const arrayParam = cachedData.history.map(r => [r.frag]);
          return await promiseOrchestrator.execute(this.fragment_lib, this.fragment_lib.getWithResolutionByBranch, arrayParam);
        }
      } else {
        resolve(undefined);
      }
      if (dataDefraged != undefined) {
        if (Array.isArray(dataDefraged)) {
          resolve(dataDefraged.map(f => f));
        } else {
          resolve(dataDefraged);
        }
      } else {
        reject(new Error('corrupted cache fragmentation'));
      }
    });
  },

  duplicateFile: async function(data, processId, cacheId) {
    // console.log('CACHE 2 processId', processId);
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (key === '_file') {
          // console.log(`Property _file found: ${data[key]}`);
          const file = await this.file_lib.get(data[key]);
          // console.log('file', file);
          const newFile = await this.file_lib.duplicate(file, {
            processId: processId,
            cacheId: cacheId
          });
          // console.log('newFile', newFile);
          data[key] = newFile.id;
        }
        if (typeof data[key] === 'object' && data[key] !== null) {
          await this.duplicateFile(data[key], processId, cacheId);
        }
      }
    }
  }
};
