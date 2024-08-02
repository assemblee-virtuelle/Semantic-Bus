'use strict';
module.exports = {
  cacheModel: require('../models/cache_model'),
  fragment_lib: require('./fragment_lib_scylla.js'),
  PromiseOrchestrator: require('../helpers/promiseOrchestrator.js'),
  persist: async function(component, data, history) {
    let cachedData;
    let cachedDataIn = await this.cacheModel.getInstance().model.findOne({
      _id: component._id
    }).lean().exec();
    cachedData = cachedDataIn;

    // console.log('allo1')

    if (cachedDataIn&&cachedDataIn!=null){
      if(cachedDataIn.frag){
       await this.fragment_lib.tagGarbage(cachedDataIn.frag)
      }
    } else {
      cachedData = {};
    }

    // console.log('allo2')

    let frag = await this.fragment_lib.persist(data);

    // console.log('allo3')

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

  get: function(component, resolveFrag) {
    let promiseOrchestrator = new this.PromiseOrchestrator();
    return new Promise(async (resolve, reject) => {
      let cachedData = await this.cacheModel.getInstance().model.findOne({
        _id: component._id
      }).lean().exec();

      let dataDefraged;

      if (cachedData != undefined) {
        if (component.specificData.historyOut != true) {
          if (cachedData.frag != undefined) {
            if (resolveFrag == true) {
              dataDefraged = await this.fragment_lib.getWithResolutionByBranch(cachedData.frag);
            } else {
              dataDefraged = await this.fragment_lib.get(cachedData.frag);
            }
          } else {
            reject(new Error("frag of cache doesn't exist"));
          }
        } else {
          let arrayParam = cachedData.history.map(r => [r.frag]);
          return await promiseOrchestrator.execute(this.fragment_lib, this.fragment_lib.getWithResolutionByBranch, arrayParam)
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
  }
};
