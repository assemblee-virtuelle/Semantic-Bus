'use strict';
module.exports = {
  cacheModel: require('../models/cache_model'),
  middle_service_workspace: require('../../../webServices/workspaceComponentPromise'),
  fragment_lib: require('./fragment_lib.js'),
  PromiseOrchestrator: require('../helpers/promiseOrchestrator.js'),
  //mongoose: require('mongoose'),
  persist: function(component, data, history) {
    //cachedData={};
    //console.log('CACHE LIB CREATE | ',data);
    return new Promise((resolve, reject) => {
      let cachedData;
      this.cacheModel.getInstance().model.findOne({
          _id: component._id
        })
        .lean()
        .exec()
        .then(cachedDataIn => {
          cachedData = cachedDataIn;
          // console.log(cachedData);
          let fragment = {
            data: data
          };
          if (cachedData != null && history != true) {
            fragment._id = cachedData.frag;
          } else if (cachedData == null) {
            cachedData = {};
          }
          return this.fragment_lib.persist(fragment)
        }).then((frag) => {
          cachedData.frag = frag._id;
          cachedData.date = new Date();
          if (history == true) {
            cachedData.history = cachedData.history || [];
            cachedData.history.push({
              frag: frag._id,
              date: new Date()
            });
          }
          return this.cacheModel.getInstance().model.findOneAndUpdate({
              _id: component._id
            },
            cachedData, {
              upsert: true,
              new: true
            }).lean().exec();
        }).then((cacheReturn) => {
          resolve(cacheReturn);
        }).catch(e => {
          reject(e);
        });
    });
  },

  get: function(component, resolveFrag) {
    //console.log(" ------ in cache component ------ ", component._id)
    let promiseOrchestrator = new this.PromiseOrchestrator();
    return new Promise((resolve, reject) => {
      this.cacheModel.getInstance().model.findOne({
          _id: component._id
        })
        .lean()
        .exec()
        .then(cachedData => {
          //console.log("cachedData",cachedData);
          if (cachedData != undefined) {
            if (component.specificData.historyOut != true) {
              if (cachedData.frag != undefined) {
                if (resolveFrag == true) {
                  return this.fragment_lib.getWithResolution(cachedData.frag);
                } else {
                  return this.fragment_lib.get(cachedData.frag);
                }
              } else {
                reject(new Error("frag of cache doesn't exist"))
              }
            } else {
              let arrayParam = cachedData.history.map(r => [r.frag]);
              return promiseOrchestrator.execute(this.fragment_lib, this.fragment_lib.get, arrayParam)
              // promiseOrchestrator.execute(this.fragment_lib, this.fragment_lib.get, arrayParam).then(arrayResult => {
              //   console.log("arrayResult",arrayResult);
              //   resolve(arrayResult);
              // })
            }
          } else {
            return new Promise(undefined);
            //resolve(undefined);
          }

        }).then((frag) => {
          //console.log('frag',frag);
          if (frag != undefined) {
            if(Array.isArray(frag)){
              resolve(frag.map(f=>f.data))
            }else{
              resolve(frag.data);
            }

          } else {
            reject(new Error('corrupted cache fragmentation'))
          }
        }).catch(err => {
          reject(err);
        });
    });
  }
};
