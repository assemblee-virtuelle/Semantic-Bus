'use strict';
module.exports = {
  cacheModel: require('../models/cache_model'),
  fragment_lib: require('./fragment_lib.js'),
  PromiseOrchestrator: require('../helpers/promiseOrchestrator.js'),
  //mongoose: require('mongoose'),
  persist: async function(component, data, history) {
    let cachedData;
    let cachedDataIn = await this.cacheModel.getInstance().model.findOne({
      _id: component._id
    }).lean().exec();
    cachedData = cachedDataIn;

    if (cachedDataIn&&cachedDataIn!=null){
      if(cachedDataIn.frag){
       await this.fragment_lib.tagGarbage(cachedDataIn.frag)
      }
    } else {
      cachedData = {};
    }

    let fragment = {
      data: data
    };

    let frag = await this.fragment_lib.persist(fragment);

    cachedData.frag = frag._id;
    cachedData.date = new Date();
    if (history == true) {
      cachedData.history = cachedData.history || [];
      cachedData.history.push({
        frag: frag._id,
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
    //console.log(" ------ in cache component ------ ", component._id)
    let promiseOrchestrator = new this.PromiseOrchestrator();
    return new Promise(async (resolve, reject) => {

      let cachedData = await this.cacheModel.getInstance().model.findOne({
        _id: component._id
      })
      .lean().exec();

      let frag;

      if (cachedData != undefined) {
        if (component.specificData.historyOut != true) {
          if (cachedData.frag != undefined) {
            if (resolveFrag == true) {
              frag = await this.fragment_lib.getWithResolutionByBranch(cachedData.frag);
            } else {
              frag = await this.fragment_lib.get(cachedData.frag);
            }
          } else {
            reject(new Error("frag of cache doesn't exist"))
          }
        } else {
          let arrayParam = cachedData.history.map(r => [r.frag]);
          return await promiseOrchestrator.execute(this.fragment_lib, this.fragment_lib.getWithResolutionByBranch, arrayParam)
        }
      } else {
        resolve(undefined);// direct resolve to Empty Cache (cacheNosql.js)
      }

      if (frag != undefined) {
        if(Array.isArray(frag)){
          resolve(frag.map(f=>f.data))
        }else{
          // console.log('RESOLVE ',frag.data);
          resolve(frag.data);
        }

      } else {
        reject(new Error('corrupted cache fragmentation'))
      }

      // this.cacheModel.getInstance().model.findOne({
      //     _id: component._id
      //   })
      //   .lean()
      //   .exec()
      //   .then(async cachedData => {
      //     // console.log("cachedData",cachedData);
      //     if (cachedData != undefined) {
      //       if (component.specificData.historyOut != true) {
      //         if (cachedData.frag != undefined) {
      //           if (resolveFrag == true) {
      //             // console.log('cache_lib getWithResolution');
      //             let resolution  = this.fragment_lib.getWithResolution(cachedData.frag);
      //             // console.log('resolution',resolution);
      //             return resolution;
      //           } else {
      //             return this.fragment_lib.get(cachedData.frag);
      //           }
      //         } else {
      //           reject(new Error("frag of cache doesn't exist"))
      //         }
      //       } else {
      //         let arrayParam = cachedData.history.map(r => [r.frag]);
      //         return promiseOrchestrator.execute(this.fragment_lib, this.fragment_lib.get, arrayParam)
      //         // promiseOrchestrator.execute(this.fragment_lib, this.fragment_lib.get, arrayParam).then(arrayResult => {
      //         //   console.log("arrayResult",arrayResult);
      //         //   resolve(arrayResult);
      //         // })
      //       }
      //     } else {
      //       // console.log('ALLO');
      //       //return new Promise((resolve,reject)=>{resolve(undefined)});
      //       resolve(undefined);// direct resolve to Empty Cache (cacheNosql.js)
      //     }

      //   }).then((frag) => {
      //     // console.log('frag',frag);
      //     if (frag != undefined) {
      //       if(Array.isArray(frag)){
      //         resolve(frag.map(f=>f.data))
      //       }else{
      //         // console.log('RESOLVE ',frag.data);
      //         resolve(frag.data);
      //       }

      //     } else {
      //       reject(new Error('corrupted cache fragmentation'))
      //     }
      //   }).catch(err => {
      //     reject(err);
      //   });
    });
  }
};
