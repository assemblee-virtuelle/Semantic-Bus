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
    // console.log('frag counter ',counter);

    // console.log('--FRAG ', frag.data);
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
    return new Promise(async (resolve, reject) => {

      if (!frag.rootFrag && !frag.originFrag) {
        frag.rootFrag = new this.ObjectID().toString();
      }
      if (Array.isArray(frag.data)) {
        if (this.objectSizeOf(frag.data) > 1000) { //1000
          // console.log('ARRAY BIG', key);

          const branchFrag = new this.ObjectID().toString()

          // console.log('ARRAY BIG', frag);
          let promiseOrchestrator = new this.PromiseOrchestrator();
          let arraySegmentator = new this.ArraySegmentator();

          let segmentation = arraySegmentator.segment(frag.data, 100) //100
          let paramArray = segmentation.map(s => {
            return [s.map(r => {
              // console.log("data of segment",r);
              return {
                data: r,
                originFrag: frag.rootFrag || frag.originFrag,
                branchOriginFrag: branchFrag,
              }
            }), false, counter]
          })

          const persistSegments = await promiseOrchestrator.execute(this, this.persist, paramArray, {
            beamNb: 10 //10
          })

          const persistBranch = await this.persist({
            data: [],
            rootFrag: frag.rootFrag,
            originFrag: frag.originFrag,
            branchOriginFrag: frag.branchOriginFrag,
            branchFrag: branchFrag,
            // data:{_frag:persistBranch._id}
          })

          resolve({
            frag: {
              data: [],
              rootFrag: frag.rootFrag,
              originFrag: frag.originFrag,
              branchOriginFrag: frag.branchOriginFrag,
              branchFrag: branchFrag,
              _id:persistBranch._id.toString()
              // data:{_frag:persistBranch._id}
            },
            key: key
          });
          // }
        } else {
          // console.log('ARRAY SMALL', key,frag.data);
          //console.log('NO PERSIST');
          let arrayOut = [];
          for (let item of frag.data) {
            const fragReady = await this.frag({
              data: item,
              originFrag: frag.originFrag,
              rootFrag: frag.rootFrag,
              branchFrag: frag.branchFrag,
              branchOriginFrag: frag.branchOriginFrag,
            }, key, counter);
            arrayOut.push(fragReady.frag.data)
          }

          resolve({
            frag: {
              data: arrayOut,
              originFrag: frag.originFrag,
              rootFrag: frag.rootFrag,
              branchFrag: frag.branchFrag,
              branchOriginFrag: frag.branchOriginFrag,
              // frags: [],
              _id: frag._id
            },
            key: key
          });
        }
      } else if (frag.data instanceof Object) {
        // console.log('OBJECT', typeof frag.data,frag.data.constructor.name);

        // let dataEscaped = frag.data;
        if (frag.data == null) {
          resolve({
            frag: {
              data: null,
              rootFrag: frag.rootFrag,
              originFrag: frag.originFrag,
              branchFrag: frag.branchFrag,
              branchOriginFrag: frag.branchOriginFrag,
              // frags: allFrags,
              _id: frag._id
            },
            key: key
          });
        } else if (
          (typeof frag.data) == 'function' ||
          (frag.data.constructor && frag.data.constructor.name == 'ObjectID') ||
          (frag.data.constructor && frag.data.constructor.name == 'Buffer')
        ) {
          // console.log('frag simplification',key,typeof dataToPersist,frag.data.constructor.name);
          // dataEscaped = dataEscaped.toString();
          resolve({
            frag: {
              data: frag.data.toString(),
              rootFrag: frag.rootFrag,
              originFrag: frag.originFrag,
              branchFrag: frag.branchFrag,
              branchOriginFrag: frag.branchOriginFrag,
              // frags: allFrags,
              _id: frag._id
            },
            key: key
          });
        } else {
          let promiseStack = [];
          let objectOut = {};
          for (let key in frag.data) {
            // console.log('frag key', key);
            // console.log("persist Call");
            let dataToPersist = frag.data[key];


            const fragReady = await this.frag({
              data: dataToPersist,
              rootFrag: frag.rootFrag,
              originFrag: frag.originFrag,
              branchFrag: undefined,
              branchOriginFrag: undefined
            }, key, counter);


            const fragKey = key.startsWith('$') ? '_' + key : key;

            if (fragReady.frag.branchFrag) {
              // console.log('+++ fragAndKey',key,fragReady.frag._id,fragReady);
              objectOut[fragKey] = {
                _frag: fragReady.frag._id
              }
            } else {
              objectOut[fragKey] = fragReady.frag.data;
            }
          }

          // console.log('objectOut',objectOut);
          resolve({
            frag: {
              data: objectOut,
              rootFrag: frag.rootFrag,
              originFrag: frag.originFrag,
              branchFrag: frag.branchFrag,
              branchOriginFrag: frag.branchOriginFrag,
              // frags: allFrags,
              _id: frag._id
            },
            key: key
          });
        }
      } else {
        // console.log('--primitiv',frag);
        let dataPrimitiv = frag.data

        resolve({
          frag: {
            data: dataPrimitiv,
            rootFrag: frag.rootFrag,
            originFrag: frag.originFrag,
            branchFrag: frag.branchFrag,
            branchOriginFrag: frag.branchOriginFrag
          },
          key: key
        });
      }
    })
    // }

  },
  persist: function(datas, createOnly, counter) {

    counter = counter || 0;
    if (counter > 1000) {
      throw new Eror("too many deep")
    }
    // console.log('# persist data frag',counter,datas);

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

          // const noData ={
          //   originFrag: data.originFrag,
          //   rootFrag: data.rootFrag,
          //   branchFrag: data.branchFrag,
          //   branchOriginFrag : data.branchOriginFrag,
          // };
          // if (data.rootFrag||data.originFrag) {
          //   // console.log('--PERSIST',noData);
          //   // console.log('ARRAY',datas.data.length);
          // }

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
                  console.log('REMOVE!!! ');

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
          // console.log('===> fragReadyFargs',JSON.stringify(fragReadyFargs));
          let persistReadyPromises = fragReadyFargs.map(f => {
            // console.log('===> persist call frag',f);
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
            // if (!(persistReadyFarg.frag.data instanceof Object)) {
            //   // console.log('XXXXXXXXXX persistReadyFarg UNPERSIST',persistReadyFarg.frag);
            //   unpersistReadyFrags.push(persistReadyFarg.frag);
            // } else {
              if (persistReadyFarg.frag._id == undefined) {

                const fragmentModelInstance = this.fragmentModel.getInstance().model;
                // console.log('-- after frag',persistReadyFarg.frag.rootFrag,'-',persistReadyFarg.frag.originFrag);
                // console.log('createReadyFrag',persistReadyFarg.frag);
                // console.log('XXXXXXXXXX persistReadyFarg CREATE',JSON.stringify(persistReadyFarg.frag));
                createReadyFrags.push(new fragmentModelInstance(persistReadyFarg.frag));
              } else {
                // console.log('XXXXXXXXXX persistReadyFarg UPDATE',persistReadyFarg.frag);
                updateReadyFrags.push(persistReadyFarg.frag);
              }
            // }

          })

          // console.log('createReadyFrags',createReadyFrags);
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
          // let unpersistPromiseStack = new Promise((resolve, reject) => {
          //   resolve(unpersistReadyFrags)
          // })
          // console.log('# persist final frags');
          return Promise.all([insertPromiseStack, updatePromisesStack, ]);
        }).then(insertedAndUpdatedFrags => {
          // console.log('# build out');
          let out = insertedAndUpdatedFrags[0].concat(insertedAndUpdatedFrags[1]);
          // console.log('out',JSON.stringify(out));
          if (forceArray) {
            out = out[0];
          }
          // if(!Array.isArray(out)){
          //             console.log('out',out);
          // }

          resolve(out);
        }).catch(e => {
          console.log('persist error', e);
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
    console.log(" ------ get fragment------ ", id)
    return new Promise((resolve, reject) => {
      this.fragmentModel.getInstance().model.findOne({
          _id: id
        })
        .lean()
        .exec()
        .then(async (fragmentReturn) => {
          // console.log('fragmentReturn',fragmentReturn);
          if (fragmentReturn.branchFrag) {
            const frags = await this.fragmentModel.getInstance().model.find({
              branchOriginFrag: fragmentReturn.branchFrag
            }).lean().exec();
            // console.log('frags',frags);
            fragmentReturn.data = frags.map(f => {
              if (f.branchFrag) {
                return {
                  _frag: f._id
                }
              } else {
                // console.log('before replace',f.data);
                return this.replaceMongoNotSupportedKey(f.data, true);
              }
            });
          } else {
            fragmentReturn.data = this.replaceMongoNotSupportedKey(fragmentReturn.data, true);
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
                  if (frag.branchOriginFrag) {
                    if (arrayDirectory[frag.branchOriginFrag]) {
                      arrayDirectory[frag.branchOriginFrag].push(frag);
                    } else {
                      arrayDirectory[frag.branchOriginFrag] = [frag];
                    }
                  }
                  partDirectory[frag._id] = frag;
                });
              }
              // console.log('partDirectory',partDirectory);
              let resolution = await this.rebuildFrag(fragmentReturn, partDirectory, arrayDirectory);
              fragmentReturn.data = resolution;
              // console.log('* resolve' ,JSON.stringify(fragmentReturn));
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

  rebuildFrag: async function(frag, partDirectory, arrayDirectory, counter) {
    // console.log('rebuildFrag',frag);
    counter = counter || 0;
    counter++;
    let result;
    // console.log(" ".repeat(counter),'rebuildFrag',frag);
    if (frag.branchFrag) {
      const records = arrayDirectory[frag.branchFrag] || [];
      // console.log('records',records?records.map(r=>r._id):undefined);
      let arrayOut = [];
      for (let record of records) {
        if (record.branchFrag) {
          arrayOut.push(await this.rebuildFrag(record, partDirectory, arrayDirectory, counter))
        } else {
          arrayOut.push(await this.rebuildFragData(record.data, partDirectory, arrayDirectory, counter))
        }
      }
      return arrayOut;
    } else {
      return await this.rebuildFragData(frag.data, partDirectory, arrayDirectory, counter)
    }

  },

  rebuildFragData: async function(object, partDirectory, arrayDirectory, counter) {
    // console.log('rebuildFragData',object);
    counter = counter || 0;
    counter++;
    // console.log(" ".repeat(counter),'rebuildFrag',object);
    // console.log('object',object);

    if (object != null && object._frag) {
      // console.log('find partDirectory of',object._frag);
      // console.log('partDirectory[object._frag]',object._frag,partDirectory[object._frag]);
      let persitedFrag = partDirectory[object._frag];
      if (!persitedFrag) {
        console.log('frag not in partDirectory');
        persitedFrag = await this.get(object._frag);
        const {
          data,
          ...rest
        } = persitedFrag;
        // console.log('frag obtain from database',rest);
      }
      // console.log('+++ rebuildFrag');
      return await this.rebuildFrag(persitedFrag, partDirectory, arrayDirectory, counter)

    } else {
      if (object == null) {
        return null;
      } else if (
        (typeof object) == 'function' ||
        object.constructor.name == 'ObjectID' ||
        object.constructor.name == 'Buffer') {
        return object.toString();

      } else if (object instanceof Object) {
        // console.log('*** object',object);
        if( Array.isArray(object)){
          let arrayDefrag =[];
          for (let item of object) {
            let itemDefrag = await this.rebuildFragData(item, partDirectory, arrayDirectory, counter);
            itemDefrag = this.replaceMongoNotSupportedKey(itemDefrag, false);
            arrayDefrag.push(itemDefrag);
          }
          return arrayDefrag;
        }else{
          for (let key in object) {

            object[key] = await this.rebuildFragData(object[key], partDirectory, arrayDirectory, counter);
            // console.log('- rebuildFragData',key,object[key] );
            object = this.replaceMongoNotSupportedKey(object, false);
          }
          return object;
        }

      } else {
        // console.log('object',object);
        return object;
      }
    }
  },

  replaceMongoNotSupportedKey: function(object, deep) {
    // console.log('replaceMongoNotSupportedKey',object);
    if (Array.isArray(object)) {
      let out = [];
      for (let item of object) {
        if (deep == true) {
          out.push(this.replaceMongoNotSupportedKey(item, true));
        } else {
          out.push(item);
        }
      }
      return out;
    }
    if (object instanceof Object) {
      let out = {};
      for (let key in object) {
        let realKey = key;
        if (key.includes('_$')) {
          realKey = key.substring(1);
        }
        if (deep == true) {
          out[realKey] = this.replaceMongoNotSupportedKey(object[key], true);
        } else {
          out[realKey] = object[key];
        }
      }
      return out;
    } else {
      return object;
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
          if (frag.frags != undefined) {
            await this.fragmentModel.getInstance().model.deleteMany({
              frags: {
                $in: frag.frags
              }
            }).exec();
          }
          if (frag.rootFrag) {
            await this.fragmentModel.getInstance().model.deleteMany({
              originFrag: frag.rootFrag
            }).exec();
          }
          await this.fragmentModel.getInstance().model.deleteMany({
            _id: frag._id
          }).exec();
        }
      })
  },

  tagGarbage: function(id) {

    if(id){
      console.log('tagGarbage', id);
      this.fragmentModel.getInstance().model.findOne({
        _id: id
      })
      .lean()
      .exec()
      .then(async frag => {

        console.log('tagGarbage',frag);

        if (frag != null) {
          if (frag.frags != undefined) {
            this.fragmentModel.getInstance().model.updateMany({
              _id: {
                $in: frag.frags
              }
            },
            {
              garbageTag : 1
            }).exec();
          }


          if (frag.rootFrag) {
           this.fragmentModel.getInstance().model.updateMany({
              originFrag: frag.rootFrag
            },
            {
              garbageTag : 1
            }).exec();
          }
          this.fragmentModel.getInstance().model.updateMany({
            _id: frag._id
          },
          {
            garbageTag : 1
          }).exec();
        }
      })
    }
   
  }

};
