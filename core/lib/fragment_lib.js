'use strict';
module.exports = {
  fragmentModel: require('../models/fragment_model'),
  PromiseOrchestrator: require('../helpers/promiseOrchestrator.js'),
  ArraySegmentator: require('../helpers/ArraySegmentator.js'),
  ObjectID: require('bson').ObjectID,
  //promiseOrchestrator : new PromiseOrchestrator();
  objectSizeOf: require("object-sizeof"),
  isObject: require('isobject'),

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
    // console.log('--FRAG ',frag);
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
      if  (!frag.rootFrag && ! frag.originFrag){
        frag.rootFrag = new this.ObjectID().toString();
      }
      if (Array.isArray(frag.data)) {
        if (this.objectSizeOf(frag.data) > 1000) { //1000
          // console.log('frag.branchFrag',frag.branchFrag);
          if (!frag.branchFrag) {
            // console.log('frag persist root of array',frag);
            const newArrayFrag={
              rootFrag: frag.rootFrag,
              originFrag: frag.originFrag,
              branchFrag: new this.ObjectID().toString(),
              data: frag.data,
              _id: frag._id
            }
            this.persist(newArrayFrag, false, counter).then(persistArray => {
              // console.log('persistArray',persistArray);
              resolve({
                frag: {
                  data: {
                    _frag:persistArray._id
                  },
                  originFrag: newArrayFrag.originFrag,
                  rootFrag: newArrayFrag.rootFrag,
                  branchFrag: newArrayFrag.branchFrag,
                  branchOriginFrag : newArrayFrag.branchOriginFrag,
                  // branchFrag: frag.branchFrag,
                  // frags: allFrags,
                  _id: frag._id
                },
                key: key
              });
            })
          } else {
            // console.log('ARRAY BIG', frag);
            let promiseOrchestrator = new this.PromiseOrchestrator();
            let arraySegmentator = new this.ArraySegmentator();

            let segmentation = arraySegmentator.segment(frag.data, 100) //100
            let paramArray = segmentation.map(s => {
              return [s.map(r => {
                return {
                  data: r,
                  originFrag: frag.rootFrag || frag.originFrag,
                  rootFrag: undefined,
                  branchOriginFrag: frag.branchFrag || frag.branchOriginFrag,
                  branchFrag : undefined
                }
              }),false,counter]
            })
            // console.log('paramArray', JSON.stringify(paramArray));
            promiseOrchestrator.execute(this, this.persist, paramArray, {
              beamNb: 10 //10
            }).then(persistSegments => {
              resolve({
                frag: {
                  data: [],
                  originFrag: frag.originFrag,
                  rootFrag: frag.rootFrag,
                  branchFrag: frag.branchFrag,
                  branchOriginFrag : frag.branchOriginFrag,
                  // frags: allFrags,
                  _id: frag._id
                },
                key: key
              });
            })
          }
        } else {
          // console.log('ARRAY SMALL', key);
          //console.log('NO PERSIST');
          resolve({
            frag: {
              data: frag.data,
              originFrag: frag.originFrag,
              rootFrag: frag.rootFrag,
              branchFrag: frag.branchFrag,
              branchOriginFrag : frag.branchOriginFrag,
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
            rootFrag: frag.rootFrag,
            originFrag: frag.originFrag,
            branchFrag: frag.branchFrag,
            branchOriginFrag : frag.branchOriginFrag
          }, key, counter));
        }
        Promise.all(promiseStack).then(frags => {

          frags.forEach(fragAndKey => {
            objectOut[fragAndKey.key] = fragAndKey.frag.data;

          });

          resolve({
            frag: {
              data: objectOut,
              rootFrag: frag.rootFrag,
              originFrag: frag.originFrag,
              branchFrag: frag.branchFrag,
              branchOriginFrag : frag.branchOriginFrag,
              // frags: allFrags,
              _id: frag._id
            },
            key: key
          });
        }).catch(e => {
          reject(e);
        });
      } else {
        // console.log('PRIMITIV', key,frag );
        resolve({
          frag: {
            data: frag.data,
            rootFrag: frag.rootFrag,
            originFrag: frag.originFrag,
            branchFrag: frag.branchFrag,
            branchOriginFrag : frag.branchOriginFrag,
            _id: frag._id
          },
          key: key
        });
      }
    })
    // }

  },
  persist: function(datas, createOnly, counter) {
    // console.log('--PERSIST',datas);
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
            // console.log('New frag from data',data);
            return new Promise((resolve, reject) => {
              resolve(data)
            })
          } else {
            return new Promise((resolve, reject) => {
              this.fragmentModel.getInstance().model.findOne({
                _id: data._id
              }).lean().exec().then(fragment => {
                if (fragment != null) {
                  // console.log('EXISTING frag',fragment);

                  this.fragmentModel.getInstance().model.remove({
                    originFrag: fragment.rootFrag
                  }).exec();
                  fragment.data = data.data;
                } else {
                  fragment = data
                }
                resolve(fragment);
              });
            });
          }
        });
        Promise.all(fragReadyPromises).then(fragReadyFargs => {
          // console.log('fragReadyFargs',fragReadyFargs);
          let persistReadyPromises = fragReadyFargs.map(f => {

            return this.frag(f, undefined, counter);
            // console.log('# frag end');
          });
          return Promise.all(persistReadyPromises);

        }).then(persistReadyFargs => {
          // console.log('persistReadyFargs',JSON.stringify(persistReadyFargs));
          // console.log('persistReadyFargs',persistReadyFargs);
          let createReadyFrags = [];
          let updateReadyFrags = [];
          let unpersistReadyFrags = [];
          if (persistReadyFargs == undefined) {
            console.log('persistReadyFargs undefined');
          }
          persistReadyFargs = persistReadyFargs.forEach(persistReadyFarg => {
            if (!(persistReadyFarg.frag.data instanceof Object) && !persistReadyFarg.frag.branchOriginFrag) {
              // console.log('UNPERSIST',persistReadyFarg.frag.data);
              unpersistReadyFrags.push(persistReadyFarg.frag);
            } else {
              if (persistReadyFarg.frag._id == undefined) {
                const fragmentModelInstance = this.fragmentModel.getInstance().model;
                // console.log('-- after frag',persistReadyFarg.frag.rootFrag,'-',persistReadyFarg.frag.originFrag);
                // console.log('createReadyFrag',persistReadyFarg.frag);
                createReadyFrags.push(new fragmentModelInstance(persistReadyFarg.frag));
              } else {
                updateReadyFrags.push(persistReadyFarg.frag);
              }
            }

          })

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
          // console.log('out',out);
          resolve(out);
        }).catch(e => {
          console.log('persist error',e);
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
        .then(async (fragmentReturn) => {
          // console.log('fragmentReturn',fragmentReturn);
          if(fragmentReturn.branchFrag){
            const frags =  await  this.fragmentModel.getInstance().model.find({
              branchOriginFrag: fragmentReturn.branchFrag
            }).lean().exec();
            // console.log('frags',frags);
            fragmentReturn.data=frags.map(f=>f.data);
          }
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

            if (fragmentReturn.rootFrag) {

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
              let arrayDirectory = {}
              if (framentParts) {
                let partBinding = framentParts.forEach(frag => {
                  if(frag.branchOriginFrag){
                    if(arrayDirectory[frag.branchOriginFrag]){
                      arrayDirectory[frag.branchOriginFrag].push(frag);
                    }else{
                      arrayDirectory[frag.branchOriginFrag]=[frag];
                    }
                  }
                  partDirectory[frag._id] = frag;
                });
              }

              let resolution = await this.rebuildFrag(fragmentReturn, partDirectory,arrayDirectory);
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
  rebuildFrag: async function(frag, partDirectory,arrayDirectory,counter) {
    // console.log('rebuildFrag',frag);
    counter=counter||0;
    counter++;
    let result;
    // console.log(" ".repeat(counter),'rebuildFrag',object);
    if(frag.branchFrag){
      const records = arrayDirectory[frag.branchFrag]||[];
      // console.log('records',records?records.map(r=>r._id):undefined);
      let arrayOut = [];
      for (let record of records){
        arrayOut.push(await this.rebuildFragData(record.data,partDirectory,arrayDirectory,counter))
      }
      return arrayOut;
    } else {
      return await this.rebuildFragData(frag.data,partDirectory,arrayDirectory,counter)
    }

  },

  rebuildFragData: async function(object, partDirectory,arrayDirectory,counter) {
    // console.log('rebuildFragData',object);
    counter=counter||0;
    counter++;
    // console.log(" ".repeat(counter),'rebuildFrag',object);
    // console.log('object',object);

    if (object!=null && object._frag){

        return await this.rebuildFrag(partDirectory[object._frag],partDirectory,arrayDirectory,counter)

    } else {
      if (object instanceof Object && object != null && object != undefined) {
        for (let key in object) {
          object[key] = await this.rebuildFragData(object[key], partDirectory,arrayDirectory,counter);
        }
        return object;
      }
      else{
        // console.log('object',object);
        return object;
      }
    }


  },
  cleanFrag: function(id) {
    // console.log('cleanFrag', id);
    this.fragmentModel.getInstance().model.findOne({
        _id: id
      })
      .lean()
      .exec()
      .then(async frag => {

        //console.log(frag);

        if (frag != null) {
          await this.fragmentModel.getInstance().model.remove({
            originFrag: frag.rootFrag
          }).exec();
          await this.fragmentModel.getInstance().model.remove({
            _id: frag._id
          }).exec();
        }
      })
  }

};
