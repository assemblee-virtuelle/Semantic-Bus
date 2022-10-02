'use strict';
module.exports = {
  fragmentModel: require('../models/fragment_model'),
  PromiseOrchestrator: require('../helpers/promiseOrchestrator.js'),
  ArraySegmentator: require('../helpers/ArraySegmentator.js'),
  ObjectID : require('bson').ObjectID,
  //promiseOrchestrator : new PromiseOrchestrator();
  objectSizeOf: require("object-sizeof"),
  isObject: require ('isobject'),

  // sequencePromises: async function(promises) {
  //   return new Promise(async (resolve, reject) => {
  //     let result = [];
  //     try {
  //       for (let promise of promises) {
  //         result.push(await promise);
  //       }
  //       resolve(result);
  //     } catch (e) {
  //       reject ('one cath in sequencePromises')
  //     }
  //
  //   })
  //
  // },

  // persistOnlyObject: function(datas, createOnly, counter) {
  //   if(this.isObject(datas) || Array?isArray(datas)){
  //     return this.persist(datas, createOnly, counter);
  //   }else{
  //     return Promise.resolve({
  //       data:datas
  //     })
  //   }
  // },

  //mongoose: require('mongoose'),
  frag: function(frag, key, counter) {
    // console.log('key',key);
    // for (let c=0;c<counter;c++){
    //   process.stdout.write(" ");
    // }
    // if(key!=undefined){
    //   console.log('- frag key',counter,this.objectSizeOf(frag.data),key,this.objectSizeOf(frag.data)<100?frag.data:'-');
    // }else{
    //   console.log('frag init',counter,this.objectSizeOf(frag.data));
    // }
    ++counter;
    return new Promise((resolve, reject) => {
      if (Array.isArray(frag.data)) {
        if (this.objectSizeOf(frag.data) > 0) {
          // console.log('ARRAY BIG', frag);
          let promiseOrchestrator = new this.PromiseOrchestrator();
          let arraySegmentator = new this.ArraySegmentator();

          let segmentation = arraySegmentator.segment(frag.data, 100) //100
          //console.log('segment',segmentation.length);
          // console.log('root-origin:',frag.rootFrag,'-',frag.originFrag);
          // console.log();
          let paramArray = segmentation.map(s => {
            return [s.map(r => {
              return {
                data: r,
                createOnly: false,
                counter: counter,
                originFrag: frag.rootFrag||frag.originFrag,
              }
            }), true]
          })
          // console.log('paramArray', JSON.stringify(paramArray));
          promiseOrchestrator.execute(this, this.persist, paramArray, {
            beamNb: 10 //10
          }).then(persistSegments => {
            let arrayOut = [];
            // let allFrags = [];
            //if(persistSegments==undefined){
            //console.log('persistSegments',persistSegments);
            //}
            persistSegments.forEach((persistSegment, index) => {
              if (persistSegment == undefined) {
                //console.log('persistSegment undefined',key,index,paramArray[index],paramArray.length,persistSegments.length);
              } else {
                //console.log('persistSegment typeof',typeof persistSegment);
                if (persistSegment.error != undefined) {
                  arrayOut.push(persistSegment);
                } else {
                  persistSegment.forEach(persistRecord => {
                    //console.log('persistRecord',JSON.stringify(persistRecord));
                    if (persistRecord._id != undefined) {
                      //console.log("_id",persistRecord._id);
                      arrayOut.push({
                        _frag: persistRecord._id
                      });
                      // allFrags = allFrags.concat([persistRecord._id]);
                    } else {
                      //persistRecord don't have _id = persistRecord isn not persisted
                      arrayOut.push(persistRecord.data);
                    }
                    // if (persistRecord.frags != undefined) {
                    //   allFrags = allFrags.concat(persistRecord.frags);
                    // }
                  });
                }
              }
            });
            //console.log('ALLO?');
            resolve({
              frag: {
                data: arrayOut,
                originFrag: frag.originFrag,
                rootFrag:frag.rootFrag,
                // frags: allFrags,
                _id: frag._id
              },
              key: key
            });
          })
        } else {
          // console.log('ARRAY SMALL', key);
          //console.log('NO PERSIST');
          resolve({
            frag: {
              data: frag.data,
              originFrag: frag.originFrag,
              rootFrag: frag.rootFrag,
              // frags: [],
              _id: frag._id
            },
            key: key
          });
        }
      } else if (frag.data instanceof Object && key != '_id' && key != '_frag') {
        //console.log('OBJECT', key);
        let promiseStack = [];
        let objectOut = {};
        for (let key in frag.data) {
          //console.log('frag key', key);
          promiseStack.push(this.frag({
            data: frag.data[key],
            rootFrag : frag.rootFrag,
            originFrag : frag.originFrag,
          }, key, counter));
        }
        Promise.all(promiseStack).then(frags => {
          // let allFrags = [];
          //console.log('AFTER OBJECT key frags',frags);
          //let out={data:data};
          // if (frags == undefined) {
          //   console.log('frags undefined');
          // }
          frags.forEach(fragAndKey => {
            objectOut[fragAndKey.key] = fragAndKey.frag.data;
            // if (fragAndKey.frag.frags != undefined) {
            //   allFrags = allFrags.concat(fragAndKey.frag.frags);
            // }
          });
          //out.frags = allFrags;
          resolve({
            frag: {
              data: objectOut,
              rootFrag : frag.rootFrag,
              originFrag : frag.originFrag,
              // frags: allFrags,
              _id: frag._id
            },
            key: key
          });
        }).catch(e => {
          reject(e);
        });
      } else {
        //console.log('PRIMITIV', key);
        resolve({
          frag: {
            data: frag.data,
            rootFrag : frag.rootFrag,
            originFrag : frag.originFrag,
            _id: frag._id
          },
          key: key
        });
      }
    })
    // }

  },
  persist: function(datas, createOnly, counter) {
    counter = counter || 0;
    // console.log('# persist data frag',counter);

    //  console.log('persist data frag', this.objectSizeOf(datas));
    // console.log('persist data frag',createOnly,counter,datas);

    if (datas instanceof Object) {
      return new Promise((resolve, reject) => {
        let fragReadyPromises = [];
        let forceArray = false;
        //datas is often object if called by externat and array if called bay frag function to obtain one frag by record of array
        if (!Array.isArray(datas)) {
          datas = [datas];
          forceArray = true;
        }
        fragReadyPromises = datas.map(data => {
          // console.log('data',data);
          if (createOnly == true || data._id == undefined) {
            // console.log('RESOLVE Simple',data.data);
            return new Promise((resolve, reject) => {
              resolve({
                rootFrag: data.originFrag?undefined:new this.ObjectID().toString(),
                originFrag : data.originFrag,
                data: data.data
              })
            })
          } else {
            return new Promise((resolve, reject) => {
              this.fragmentModel.getInstance().model.findOne({
                _id: data._id
              }).lean().exec().then(fragment => {
                if (fragment != null) {
                  //console.log('EXISTING frag',fragment.frags);
                  //TODO refactor with originFrag
                  this.fragmentModel.getInstance().model.remove({
                    _id: {
                      $in: fragment.frags
                    }
                  }).exec();
                  fragment.data = data.data;
                } else {
                  fragment = {
                    data: data.data,
                    rootFrag: new this.ObjectID().toString(),
                    originFrag : data.originFrag
                  }
                }
                resolve(fragment);
              });
            });
          }
        });
        Promise.all(fragReadyPromises).then(fragReadyFargs => {
          // console.log('fragReadyFargs',fragReadyFargs);
          let persistReadyPromises = fragReadyFargs.map(f => {
            // if(this.isObject(f.data)||Array.isArray(f.data)){
            //     // console.log('# frag',f);
            //     // console.log('before frag',f.rootFrag,'-',f.originFrag);
            // }

            return this.frag(f, undefined, counter);
            // console.log('# frag end');
          });
          return Promise.all(persistReadyPromises);

        }).then(persistReadyFargs => {
          // console.log('persistReadyFargs',JSON.stringify(persistReadyFargs));
          // console.log('persistReadyFargs');
          let createReadyFrags = [];
          let updateReadyFrags = [];
          let unpersistReadyFrags = [];
          if (persistReadyFargs == undefined) {
            console.log('persistReadyFargs undefined');
          }
          persistReadyFargs = persistReadyFargs.forEach(persistReadyFarg => {
            if (!(persistReadyFarg.frag.data instanceof Object)) {
              unpersistReadyFrags.push(persistReadyFarg.frag);
            } else {
              if (persistReadyFarg.frag._id == undefined) {
                const fragmentModelInstance = this.fragmentModel.getInstance().model;
                // console.log('-- after frag',persistReadyFarg.frag.rootFrag,'-',persistReadyFarg.frag.originFrag);
                createReadyFrags.push(new fragmentModelInstance(persistReadyFarg.frag));
              } else {
                updateReadyFrags.push(persistReadyFarg.frag);
              }
            }

          })
          // createReadyFrags.forEach((item, i) => {
          //   console.log('createReadyFrags',JSON.stringify(item));
          // });


          let insertPromiseStack = this.fragmentModel.getInstance().model.insertMany(createReadyFrags, {
            new: true
          });
          let updatePromisesStack = updateReadyFrags.map(f => {
            // console.log('updateReadyFrags',updateReadyFrags);
            return this.fragmentModel.getInstance().model.findOneAndUpdate({
              _id: f._id
            }, f, {
              upsert: true,
              new: true
            }).lean().exec();
          })
          let unpersistPromiseStack = new Promise((resolve, reject) => {
            resolve(unpersistReadyFrags)
          })
          // console.log('# persist final frags');
          return Promise.all([insertPromiseStack, updatePromisesStack, unpersistPromiseStack]);
        }).then(insertedAndUpdatedFrags => {
          // console.log('# build out');
          let out = insertedAndUpdatedFrags[0].concat(insertedAndUpdatedFrags[1]).concat(insertedAndUpdatedFrags[2]);
          // console.log('out',JSON.stringify(out));
          if (forceArray) {
            out = out[0];
          }
          console.log('out',out);
          resolve(out);
        }).catch(e => {
          reject(e);
        });
      });

    } else {
      console.log('NO PERSIST BECAUSE NO OBJECT');
      return new Promise((resolve, reject) => {
        resolve(datas);
      })
    }
  },
  get: function(id) {
    //console.log(" ------ in fragment component ------ ", id)
    return new Promise((resolve, reject) => {
      this.fragmentModel.getInstance().model.findOne({
          _id: id
        })
        .lean()
        .exec()
        .then((fragmentReturn) => {
          // console.log('fragmentReturn',fragmentReturn);
          resolve(fragmentReturn)
        }).catch(err => {
          console.log('-------- FAGMENT LIB ERROR -------| ', err);
          reject(err);
        });
    });
  },
  getWithResolution: function(id) {
    // console.log(" ------ in fragment component ------ ", id)
    return new Promise((resolve, reject) => {
      //console.log('cache', component);
      try {
        let fragmentReturn;
        this.fragmentModel.getInstance().model.findOne({
            _id: id
          })
          .lean()
          .exec()
          .then((fragmentReturnIn) => {
            fragmentReturn = fragmentReturnIn;

              // console.log('* find fragments');
              // return this.fragmentModel.getInstance().model.find({
              //   _id: {
              //     $in: fragmentReturn.frags
              //   }
              // }).lean().exec();
              if(fragmentReturn.rootFrag){
                // console.log('fing root',fragmentReturn.rootFrag);
                return this.fragmentModel.getInstance().model.find({
                  originFrag: fragmentReturn.rootFrag
                }).lean().exec();
              } else {
                // console.log('not fragRoot' );
                return Promise.resolve([])
              }
          }).then(async framentParts => {
            try {
              let partDirectory = {}
              if(framentParts){
                // console.log('* create directory fragments : ',framentParts.length);
                let partBinding = framentParts.forEach(frag => {
                  partDirectory[frag._id] = frag.data;
                });
              }
              // console.log('* rebuildFrag');
              let resolution = await this.rebuildFrag(fragmentReturn.data, partDirectory);
              fragmentReturn.data = resolution;
              // console.log('* resolve' ,fragmentReturn);
              resolve(fragmentReturn);
            } catch (e) {
              reject(e);
            }
          }).catch(err => {
            reject(err);
            console.log('-------- FAGMENT LIB ERROR -------| ', err);
          });
      } catch (e) {
        reject(e);
      }
    });
  },
  rebuildFrag: async function(object, partDirectory) {
    if (object instanceof Object && object != null && object != undefined) {
      for (let key in object) {
        if (key != '_id') {
          if (object[key] != null && object[key] != undefined && object[key]['_frag'] != undefined) {
            let partDirectoryFrag = partDirectory[object[key]['_frag']];
            if (partDirectoryFrag){
              object[key] = await this.rebuildFrag(partDirectoryFrag, partDirectory);
            }else{
              // console.log('NO frag in partDirectoryFrag');
              const persitFrag= await this.fragmentModel.getInstance().model.findOne({
                  _id: object[key]['_frag']
                }).lean().exec()
                // console.log('persitFrag',persitFrag);
              object[key] = await this.rebuildFrag(persitFrag.data, partDirectory);
            }
          } else {
            object[key] = await this.rebuildFrag(object[key], partDirectory);
          }
        }
      }
    }
    // console.log('object',object);
    return object;
  },
  cleanFrag: function(id) {
    //console.log('cleanFrag', id);
    this.fragmentModel.getInstance().model.findOne({
        _id: id
      })
      .lean()
      .exec()
      .then(frag => {
        //console.log(frag);
        if (frag != null) {
          let fragsToDelete = frag.frags;
          fragsToDelete.push(frag._id);
          this.fragmentModel.getInstance().model.remove({
            _id: {
              $in: fragsToDelete
            }
          }).exec();
        }
      })
  }

};
