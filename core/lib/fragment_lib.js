'use strict';

const mongoose = require('mongoose');

module.exports = {
  fragmentModel: require('../models/fragment_model'),
  PromiseOrchestrator: require('../helpers/promiseOrchestrator.js'),
  ArraySegmentator: require('../helpers/ArraySegmentator.js'),
  ObjectID: require('bson').ObjectID,
  //promiseOrchestrator : new PromiseOrchestrator();
  objectSizeOf: require("object-sizeof"),
  isObject: require('isobject'),


  // nuber in comment at end of lines are values when approved and well tested

  // frag: function(frag, key, counter) {
  //   ++counter;
  //   return new Promise(async (resolve, reject) => {

  //     if (!frag.rootFrag && !frag.originFrag) {
  //       frag.rootFrag = new this.ObjectID().toString();
  //     }
  //     if (Array.isArray(frag.data)) {
  //       if (this.objectSizeOf(frag.data) > 0) {//10000
  //         //Big array

  //         // const branchFrag = new this.ObjectID().toString()
  //         // frag.maxIndex =0;
  //         // frag.branchFrag=branchFrag;


  //         // for (let data of (frag.data)){
  //         //   console.trace();
  //         //   frag = await this.addDataToArrayFrag(data,frag);
  //         // }
  //         // frag.data= [];

  //         // const newBranchFrag = await frag.save();
  //         // console.log('newBrachFrag');
  //         // resolve({
  //         //   frag: newBranchFrag,
  //         //   key: key
  //         // });

  //         const branchFrag = new this.ObjectID().toString()
  //         let promiseOrchestrator = new this.PromiseOrchestrator();
  //         let arraySegmentator = new this.ArraySegmentator();

  //         let segmentation = arraySegmentator.segment(frag.data, 100) //100
  //         let paramArray = segmentation.map(s => {
  //           return [s.map(r => {
  //             return {
  //               data: r,
  //               originFrag: frag.rootFrag || frag.originFrag,
  //               branchOriginFrag: branchFrag,
  //             }
  //           }), false, counter]
  //         })

  //         const persistSegments = await promiseOrchestrator.execute(this, this.persist, paramArray, {
  //           beamNb: 10 //10
  //         })

  //         console.log('__________CREATE branche caller',frag)


  //         const persistBranch = await this.persist({
  //           data: [],
  //           rootFrag: undefined,
  //           originFrag: frag.rootFrag || frag.originFrag,
  //           branchOriginFrag: frag.branchFrag,
  //           branchFrag: branchFrag,
  //           // data:{_frag:persistBranch._id}
  //         })

  //         resolve({
  //           frag: {
  //             data: [],
  //             rootFrag: frag.rootFrag,
  //             originFrag: frag.originFrag,
  //             branchOriginFrag: frag.branchOriginFrag,
  //             branchFrag: branchFrag,
  //             _id:persistBranch._id.toString()
  //             // data:{_frag:persistBranch._id}
  //           },
  //           key: key
  //         });
  //       } else {
  //         //small array
  //         let arrayOut = [];
  //         for (let item of frag.data) {
  //           const fragReady = await this.frag({
  //             data: item,
  //             originFrag: frag.originFrag,
  //             rootFrag: frag.rootFrag,
  //             branchFrag: frag.branchFrag,
  //             branchOriginFrag: frag.branchOriginFrag,
  //           }, key, counter);
  //           arrayOut.push(fragReady.frag.data)
  //         }

  //         resolve({
  //           frag: {
  //             data: arrayOut,
  //             originFrag: frag.originFrag,
  //             rootFrag: frag.rootFrag,
  //             branchFrag: frag.branchFrag,
  //             branchOriginFrag: frag.branchOriginFrag,
  //             // frags: [],
  //             _id: frag._id
  //           },
  //           key: key
  //         });
  //       }
  //     } else if (frag.data instanceof Object) {
  //       // Object
  //       if (frag.data == null) {
  //         resolve({
  //           frag: {
  //             data: null,
  //             rootFrag: frag.rootFrag,
  //             originFrag: frag.originFrag,
  //             branchFrag: frag.branchFrag,
  //             branchOriginFrag: frag.branchOriginFrag,
  //             // frags: allFrags,
  //             _id: frag._id
  //           },
  //           key: key
  //         });
  //       } else if (
  //         (typeof frag.data) == 'function' ||
  //         (frag.data.constructor && frag.data.constructor.name == 'ObjectID') ||
  //         (frag.data.constructor && frag.data.constructor.name == 'Buffer')
  //       ) {
  //         //object to persist without framgment; it is a technic fix; In the context of normal operation, these types of objects should not exist
  //         resolve({
  //           frag: {
  //             data: frag.data.toString(),
  //             rootFrag: frag.rootFrag,
  //             originFrag: frag.originFrag,
  //             branchFrag: frag.branchFrag,
  //             branchOriginFrag: frag.branchOriginFrag,
  //             // frags: allFrags,
  //             _id: frag._id
  //           },
  //           key: key
  //         });
  //       } else {
  //         // Object
  //         let promiseStack = [];
  //         let objectOut = {};
  //         for (let key in frag.data) {
  //           let dataToPersist = frag.data[key];
  //           const fragReady = await this.frag({
  //             data: dataToPersist,
  //             rootFrag: frag.rootFrag,
  //             originFrag: frag.originFrag,
  //             branchFrag: undefined,
  //             branchOriginFrag: undefined
  //           }, key, counter);


  //           const fragKey = key.startsWith('$') ? '_' + key : key;

  //           if (fragReady.frag.branchFrag) {
  //             objectOut[fragKey] = {
  //               _frag: fragReady.frag._id
  //             }
  //           } else {
  //             objectOut[fragKey] = fragReady.frag.data;
  //           }
  //         }

  //         resolve({
  //           frag: {
  //             data: objectOut,
  //             rootFrag: frag.rootFrag,
  //             originFrag: frag.originFrag,
  //             branchFrag: frag.branchFrag,
  //             branchOriginFrag: frag.branchOriginFrag,
  //             // frags: allFrags,
  //             _id: frag._id
  //           },
  //           key: key
  //         });
  //       }
  //     } else {
  //       // primitiv - literal
  //       let dataPrimitiv = frag.data

  //       resolve({
  //         frag: {
  //           data: dataPrimitiv,
  //           rootFrag: frag.rootFrag,
  //           originFrag: frag.originFrag,
  //           branchFrag: frag.branchFrag,
  //           branchOriginFrag: frag.branchOriginFrag
  //         },
  //         key: key
  //       });
  //     }
  //   })
  //   // }

  // },
  // persist: function(datas, createOnly, counter) {
  //   console.trace();
  //   counter = counter || 0;
  //   if (counter > 1000) {
  //     throw new Eror("too many deep")
  //   }


  //   if (datas instanceof Object) {
  //     return new Promise((resolve, reject) => {
  //       let fragReadyPromises = [];
  //       let forceArray = false;
  //       if (!Array.isArray(datas)) {
  //         datas = [datas];
  //         forceArray = true;
  //       }
  //       fragReadyPromises = datas.map(data => {

  //         if (createOnly == true || data._id == undefined) {
  //           return new Promise((resolve, reject) => {
  //             resolve(data)
  //           })
  //         } else {
  //           return new Promise((resolve, reject) => {
  //             this.fragmentModel.getInstance().model.findOne({
  //               _id: data._id
  //             }).exec().then(fragment => {
  //               if (fragment != null) {
  //                 // console.log('REMOVE!!! ');
  //                 // this.fragmentModel.getInstance().model.remove({
  //                 //   originFrag: fragment.rootFrag
  //                 // }).exec();

  //                 fragment.data = data.data;
  //               } else {
  //                 fragment = data
  //               }
  //               resolve(fragment);
  //             });
  //           });
  //         }
  //       });
  //       Promise.all(fragReadyPromises).then(fragReadyFargs => {
  //         let persistReadyPromises = fragReadyFargs.map(f => {
  //           return this.frag(f, undefined, counter);
  //         });
  //         return Promise.all(persistReadyPromises);

  //       }).then(persistReadyFargs => {

  //         let createReadyFrags = [];
  //         let updateReadyFrags = [];
  //         let unpersistReadyFrags = [];
  //         if (persistReadyFargs == undefined) {
  //           console.log('persistReadyFargs undefined');
  //         }
  //         persistReadyFargs = persistReadyFargs.forEach(persistReadyFarg => {
  //           if (persistReadyFarg.frag._id == undefined) {
  //             const fragmentModelInstance = this.fragmentModel.getInstance().model;
  //             createReadyFrags.push(new fragmentModelInstance(persistReadyFarg.frag));
  //           } else {
  //             updateReadyFrags.push(persistReadyFarg.frag);
  //           }
  //         })

  //         let insertPromiseStack = this.fragmentModel.getInstance().model.insertMany(createReadyFrags, {
  //           new: true
  //         });
  //         let updatePromisesStack = updateReadyFrags.map(f => {
  //           console.warn(`ALERT fragment udating, this case shouldn't exist`)
  //           // console.trace();
  //           return this.fragmentModel.getInstance().model.findOneAndUpdate({
  //             _id: f._id
  //           }, f, {
  //             upsert: true,
  //             new: true
  //           }).exec();
  //         })

  //         return Promise.all([insertPromiseStack, updatePromisesStack, ]);
  //       }).then(insertedAndUpdatedFrags => {

  //         let out = insertedAndUpdatedFrags[0].concat(insertedAndUpdatedFrags[1]);
  //         if (forceArray) {
  //           out = out[0];
  //         }
  //         resolve(out);
  //       }).catch(e => {
  //         console.log('persist error', e);
  //         reject(e);
  //       });
  //     });

  //   } else {
  //     console.log('NO PERSIST BECAUSE NO OBJECT');
  //     return new Promise((resolve, reject) => {
  //       resolve(datas);
  //     })
  //   }
  // },

  isLiteral (data){
    return (data==null ||
    data==undefined ||
    (typeof data) == 'function' ||
    (data?.constructor?.name == 'ObjectID') ||
    (data?.constructor?.name == 'Buffer')||
    !(this.isObject(data)))&&
    !Array.isArray(data) 
  },

  processLiteral (data){
    if((typeof data) == 'function' ||
    (data?.constructor?.name == 'ObjectID') ||
    (data?.constructor?.name == 'Buffer')){
      return data.toString();
    }else{
      return data;
    }
  },

  testAllLiteralArray: function (arrayToTest){
    const allLiteral = arrayToTest.every(i=>{
      const isLiteral = this.isLiteral(i);
      // console.log('is literal',i,isLiteral)
      return isLiteral
    })
    return allLiteral
    
  },

  testFragArray: function (arrayToTest){
    if (arrayToTest.length<=1000){
      return false; 
    }else if (this.testAllLiteralArray(arrayToTest)){
      return false
    } else {
      return true
    }
  },

  persist : async function(data,fragCaller,exitingFrag) {
    // console.log('____________persistNew',data,exitingFrag);
    // if (this.isLiteral(data)){
    //     return this.processLiteral(data);
    // }else {
      const fragmentModelInstance = this.fragmentModel.getInstance().model;
      let fargToPersist = exitingFrag || new fragmentModelInstance({
        rootFrag : fragCaller?.rootFrag!=undefined||fragCaller?.originFrag!=undefined ? undefined : new this.ObjectID(),
        originFrag : fragCaller?.rootFrag|| fragCaller?.originFrag,
      })
      
      if(this.isLiteral(data)){
        fargToPersist.data=data;
        fargToPersist.markModified('data');
        fargToPersist.branchFrag=undefined;
        return await fargToPersist.save();
      }else if (Array.isArray(data)){

        if(this.testFragArray(data)){
          // console.log('FAG ARRRAY',data)
        // if(false){
          fargToPersist = await this.createArrayFrag(fargToPersist);
          for (let item of data){
            await this.addDataToArrayFrag(item,fargToPersist);
          } 
          return  fargToPersist;
        }else{
          const arrayReadyToPersit = []
          for (let item of data){
            const persistedObject = await this.persistObject(item,fargToPersist);
            if (persistedObject._id){
              arrayReadyToPersit.push({
                _frag : persistedObject._id.toString()
              });
            }else{
              arrayReadyToPersit.push(persistedObject);
            }
          }
          fargToPersist.data=arrayReadyToPersit;
          fargToPersist.markModified('data');
          fargToPersist.branchFrag=undefined;
          return await fargToPersist.save();
        }
      }else{
        const objectData = await this.persistObject(data,fargToPersist)
        fargToPersist.data=objectData;
        fargToPersist.markModified('data');
        fargToPersist.branchFrag=undefined;
        return await fargToPersist.save();
      }
    // }
  },

  persistObject : async function(data,fragCaller,exitingFrag) {
    if (this.isLiteral(data)){
      return this.processLiteral(data);
    } else if (Array.isArray(data) && this.testFragArray(data)){
      // console.log(('object->frag'));
      return await this.persist (data,fragCaller,exitingFrag) 
    } else {
      for (let key in data) {
        const persistReturn = await this.persistObject(data[key],fragCaller);
        if (persistReturn?._id){
          data[key] = {
            _frag : persistReturn._id.toString()
          }
        } else {
          data[key] = persistReturn;
        }
      }
      return data;
    }
  },

  createArrayFrag: async function(exitingFrag) {
    // console.log('createArrayFrag',exitingFrag);
    const fragmentModelInstance = this.fragmentModel.getInstance().model;
    let arrayFrag= exitingFrag ||  new fragmentModelInstance({
      rootFrag :  new this.ObjectID()
    });
    arrayFrag.data=[];
    arrayFrag.markModified('data');
    arrayFrag.branchFrag = new this.ObjectID();
    arrayFrag.maxIndex=0;
    arrayFrag = await arrayFrag.save();
    return arrayFrag;
  
  },
  addFragToArrayFrag: async function(frag, arrayFrag) {
    // console.log('addFragToArrayFrag',frag,arrayFrag);
    const isObjectFrag =  frag._id && ! frag instanceof mongoose.Types.ObjectId;
    const fragmentModelInstance = this.fragmentModel.getInstance().model;
    const fragObject = isObjectFrag?frag:await fragmentModelInstance.findOne({_id: frag}).exec();

    fragObject.branchOriginFrag = arrayFrag.branchFrag;
    fragObject.originFrag=arrayFrag.root||arrayFrag.originFrag;
    fragObject.rootFrag=undefined;
    fragObject.index = arrayFrag.maxIndex+1;
    await fragObject.save();
    arrayFrag.maxIndex=fragObject.index;
    return await arrayFrag.save();
  
  },
  addDataToArrayFrag: async function(data, arrayFrag) {
    // console.log('addDataToArrayFrag',data)
    const frag = await this.persist(data,arrayFrag) 
    await this.addFragToArrayFrag(frag,arrayFrag)
  
  },
  createRootArrayFragFromFrags: async function(frags) {
    // console.log('______createRootArrayFragFromFrags',frags);
    let newRootFrag =  await this.createArrayFrag()
    for (let frag of frags){
      await this.addFragToArrayFrag(frag,newRootFrag);
    }
    return newRootFrag;
  },


  get: function(id) {
    // console.log(" ------ get fragment------ ", id)
    return new Promise(async (resolve, reject) => {
      const  fragmentReturn = await this.fragmentModel.getInstance().model.findOne({
        _id: id
      })
      .lean()
      .exec()
      .then();
      // console.log('frag',fragmentReturn)
      if (fragmentReturn.branchFrag) {
        const frags = await this.fragmentModel.getInstance().model.find({
          branchOriginFrag: fragmentReturn.branchFrag
        }).lean().exec();
        // console.log('GET frag Array',frags)

        fragmentReturn.data = frags.map(f => {
          return {
            _frag: f._id
          }
        });
      } else {
        fragmentReturn.data = this.replaceMongoNotSupportedKey(fragmentReturn.data, true);
      }
      resolve(fragmentReturn)
    });
  },

  getWithResolutionByBranch: async function(frag) {

    if (!frag){
      throw new Error('frag have to be set');
    }
    // console.log('frag',frag);
    const isObjectFrag =  frag._id && ! frag instanceof mongoose.Types.ObjectId;
    const fragmentModelInstance = this.fragmentModel.getInstance().model;
    const fragToResolve = isObjectFrag?frag:await fragmentModelInstance.findOne({_id: frag}).exec();
    if(fragToResolve.branchFrag){
      const children= await fragmentModelInstance.find({branchOriginFrag: fragToResolve.branchFrag}).exec();
      const childrenData=[];
      for (let child of children) {
        if(child.branchFrag){
          const data = await this.getWithResolutionByBranch(child);
          childrenData.push(data);
        }else{
          // console.log('child',child);
          const data = await this.rebuildFragDataByBranch(child.data);
          childrenData.push(data);
        }
      }
      return childrenData.sort((a,b)=>a.index<b.index);
    }else{
      return await this.rebuildFragDataByBranch(fragToResolve.data);
    }
  },

  rebuildFragDataByBranch: async function(data){
    // console.log('data',data)
    if (data != null && data._frag) {
      return await this.getWithResolutionByBranch(data._frag);
    } else if(data == null){
      return null;
    } else if (this.isLiteral(data)){
      return data;
    } else if (data instanceof Object) {
      if( Array.isArray(data)){
        let arrayDefrag =[];
        for (let item of data) {
          let itemDefrag = await this.rebuildFragDataByBranch(item,);
          itemDefrag = this.replaceMongoNotSupportedKey(itemDefrag, false);
          arrayDefrag.push(itemDefrag);
        }
        return arrayDefrag;
      }else{
        for (let key in data) {
          data[key] = await this.rebuildFragDataByBranch(data[key]);
          data = this.replaceMongoNotSupportedKey(data, false);
        }
        return data;
      }

    } else {
      return data;
    }
  },

  getWithResolution: function(id) {
    return new Promise((resolve, reject) => {
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
              //all fragments whith originFrag (index by id)
              let partDirectory = {}
              //fragments group by originFrag (index by branchOriginFrag)
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
              let resolution = await this.rebuildFrag(fragmentReturn, partDirectory, arrayDirectory);
              fragmentReturn.data = resolution;
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
    counter = counter || 0;
    counter++;
    let result;
    if (frag.branchFrag) {
      const records = arrayDirectory[frag.branchFrag] || [];
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
    counter = counter || 0;
    counter++;

    if (object != null && object._frag) {

      let persitedFrag = partDirectory[object._frag];
      if (!persitedFrag) {
        console.log('frag not in partDirectory');
        persitedFrag = await this.get(object._frag);
        const {
          data,
          ...rest
        } = persitedFrag;
      }

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
            object = this.replaceMongoNotSupportedKey(object, false);
          }
          return object;
        }

      } else {
        return object;
      }
    }
  },

  replaceMongoNotSupportedKey: function(object, deep) {
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
    this.fragmentModel.getInstance().model.findOne({
        _id: id
      })
      .lean()
      .exec()
      .then(async frag => {
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
      this.fragmentModel.getInstance().model.findOne({
        _id: id
      })
      .lean()
      .exec()
      .then(async frag => {
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
  },

  // frag support fragId or frag object
  copyFragUntilPath : async function(frag,dfobTable,keepArray, relativHistoryTable=[], callerFrag=undefined){
    // console.log('keepArray',keepArray,dfobTable);
    if (!frag){
      throw new Error('frag have to be set');
    }
    const isObjectFrag =  frag._id && ! frag instanceof mongoose.Types.ObjectId;
    const fragmentModelInstance = this.fragmentModel.getInstance().model;
    const fragToCopy = isObjectFrag?frag:await fragmentModelInstance.findOne({_id: frag}).exec();
    // console.log('fragToCopy',fragToCopy);
    if (fragToCopy.branchFrag) {
      const newFrag = new fragmentModelInstance({
        _id:undefined,
        data : fragToCopy.data,
        //rootfrag should be undefind if caller but not in real life :-(
        rootFrag: fragToCopy.rootFrag&&!callerFrag?new this.ObjectID().toString():undefined,
        originFrag : callerFrag?callerFrag.originFrag||callerFrag.rootFrag:undefined,
        branchFrag : fragToCopy.branchFrag?new this.ObjectID().toString():undefined,
        maxIndex : fragToCopy.maxIndex,
        index : fragToCopy.index,
        branchOriginFrag : callerFrag?callerFrag.branchFrag:undefined,
        garbageProcess:false
      })
      await newFrag.save();
      const fragleaves = await fragmentModelInstance.find({branchOriginFrag: fragToCopy.branchFrag})
      let arrayOut = [];
      let fragmentSelected=[];
      for (let record of fragleaves) {
        const processedData =await this.copyFragUntilPath(record._id,dfobTable,keepArray, relativHistoryTable,newFrag);
        arrayOut.push(processedData.data);
        fragmentSelected=fragmentSelected.concat(processedData.dfobFragmentSelected);
      }
      // console.log('keepArray',keepArray,dfobTable);
      if(keepArray && dfobTable.length==0){
        fragmentSelected = [{
          frag : newFrag,
          relativHistoryTableSelected: relativHistoryTable
        }];
      }

      return {
        data : arrayOut,
        dfobFragmentSelected: fragmentSelected,
        rootFrag:newFrag.rootFrag,
        newFrag:newFrag
      };
    } else {

      const newFragRaw= {
        data : fragToCopy.data,
        originFrag : callerFrag?callerFrag.originFrag||callerFrag.rootFrag:undefined,
        branchOriginFrag : callerFrag?callerFrag.branchFrag:undefined,
        rootFrag: fragToCopy.rootFrag?new this.ObjectID().toString():undefined,
        index : fragToCopy.index,
        branchFrag : undefined,
        garbageProcess:false
      }

      let newFrag = new fragmentModelInstance(newFragRaw)
      await newFrag.save();
      
      const processedData = await this.copyDataUntilPath(newFrag.data,dfobTable,keepArray, relativHistoryTable,newFrag);
      // console.log('______processedData',JSON.stringify(processedData))

      newFrag.data= processedData.data;
      newFrag.markModified('data');
      newFrag = await newFrag.save();
      // console.log('________newFrag',JSON.stringify(newFrag))

      const isDfobFragmentSelected =  processedData.dfobFragmentSelected&&processedData.dfobFragmentSelected.length>0;


      const fragVerif = await fragmentModelInstance.findOne({_id: newFrag.id}).exec();
      // console.log('__copyFragUntilPath fragVerif',JSON.stringify(fragVerif))

      return {
        data : processedData.data,
        dfobFragmentSelected:isDfobFragmentSelected ? processedData.dfobFragmentSelected : {
          frag : newFrag,
          relativHistoryTableSelected: processedData.relativHistoryTableSelected
        },
        rootFrag :newFrag.rootFrag,
        newFrag :newFrag
      };
    }
  },
  copyDataUntilPath : async function(data,dfobTable, keepArray, relativHistoryTable=[], callerFrag){
    // console.log('data to copy',data)
    // if (data==undefined){
    //   throw new Error('data have to be set');
    // }
    if (data==undefined){
      return {
        data :undefined,
        relativHistoryTable
      };
    } else  if (data == null) {
      return {
        data :null,
        relativHistoryTable
      };
    } else if ( this.isLiteral(data)){
      return {
        data :this.processLiteral(data),
        relativHistoryTable
      };
    } else if (data instanceof Object) {
      if( Array.isArray(data)){
        let arrayDefrag =[];
        let fragmentSelected=[];
        let relativHistoryTableSelected=[]
        for (let item of data) {
          const processedData = await this.copyDataUntilPath(item,dfobTable, keepArray, relativHistoryTable);
          // console.log('_________processedData',processedData)
          let itemDefrag = processedData.data;
          itemDefrag = this.replaceMongoNotSupportedKey(itemDefrag, false);
          arrayDefrag.push(itemDefrag);
          fragmentSelected = fragmentSelected.concat(fragmentSelected);
          // fragmentSelected.push(processedData.dfobFragmentSelected);
          relativHistoryTableSelected=processedData.relativHistoryTableSelected?.length>relativHistoryTableSelected?processedData.relativHistoryTableSelected:relativHistoryTableSelected;
        }
        return {
          data : arrayDefrag,
          relativHistoryTableSelected:relativHistoryTableSelected,
          dfobFragmentSelected: fragmentSelected
        };
      }else{

        let relativHistoryTableCopy =[...relativHistoryTable]
        let fragmentSelected;
        let relativHistoryTableSelected=[];
        for (let key in data) {
          // console.log('___0.1',key,data)
          let dfobTableCurrent = [...dfobTable];
          let dfobTableCopy = [...dfobTable];
          let dfobMarker = false;
          if (dfobTableCurrent[0] && dfobTableCurrent[0].localeCompare(key)==0){
            dfobTableCopy=dfobTableCurrent.slice(1);
            dfobMarker=true;
            relativHistoryTableCopy=relativHistoryTableCopy.concat(key);
          }else{
            dfobTableCurrent=[];
          }
          if (data[key] && data[key] != null && data[key]._frag) {
            if(dfobTableCurrent.length>0){
              const persitedFrag = await this.copyFragUntilPath(data[key]._frag, dfobTableCopy, keepArray, [], callerFrag)
              data[key] = {
                _frag:persitedFrag.newFrag._id.toString()
              };
              fragmentSelected=persitedFrag.dfobFragmentSelected;
            }
          } else {
            // console.log('_',key,data[key])
            const processedData = await this.copyDataUntilPath(data[key], dfobTableCopy, keepArray, relativHistoryTableCopy,callerFrag);

            data[key] = processedData.data;
            data = this.replaceMongoNotSupportedKey(data, false);
            fragmentSelected=processedData.dfobFragmentSelected?processedData.dfobFragmentSelected:undefined;
            // console.log('__->',processedData.relativHistoryTableSelected,relativHistoryTableCopy)
            if (processedData?.relativHistoryTableSelected?.length>relativHistoryTableSelected.length){
              relativHistoryTableSelected=processedData.relativHistoryTableSelected;
              relativHistoryTableCopy = relativHistoryTableSelected
            }else{
              relativHistoryTableSelected = relativHistoryTableCopy
            }
            // relativHistoryTableSelected=processedData?.relativHistoryTableSelected?.length>relativHistoryTableSelected.length?processedData.relativHistoryTableSelected:relativHistoryTableCopy;
          }
          // console.log('___________processedData',data);
        }
        // console.log('_____ return data',JSON.stringify(data));
        // console.log('_____________________________relativHistoryTableSelected',relativHistoryTableSelected)
        return {
          data,
          relativHistoryTableSelected:relativHistoryTableSelected,
          dfobFragmentSelected:fragmentSelected
        };
      }
    } else {
      console.log('AAAAALLLLLLOOO')
      return {
        data,
        relativHistoryTable
      };
    }
  }
};
