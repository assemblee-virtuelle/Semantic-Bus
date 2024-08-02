'use strict';

const mongoose = require('mongoose');
const { v4: uuidv4, validate : uuidValidate } = require('uuid');

module.exports = {
  fragmentModel: require('../models/fragments_model_scylla'),
  PromiseOrchestrator: require('../helpers/promiseOrchestrator.js'),
  ArraySegmentator: require('../helpers/ArraySegmentator.js'),
  ObjectID: require('bson').ObjectID,
  //promiseOrchestrator : new PromiseOrchestrator();
  objectSizeOf: require("object-sizeof"),
  isObject: require('isobject'),
  PromiseOrchestrator: require('../helpers/promiseOrchestrator.js'),

  isLiteral(data) {
    return (data == null ||
      data == undefined ||
      (typeof data) == 'function' ||
      uuidValidate(data) || data.constructor.name == 'Uuid' ||
      (data?.constructor?.name == 'Buffer') ||
      (data instanceof Date && !isNaN(data)) ||
      !(this.isObject(data))) &&
      !Array.isArray(data)
  },

  processLiteral(data) {
    if ((typeof data) == 'function' ||
      uuidValidate(data) ||
      (data?.constructor?.name == 'Buffer')) {
      return data.toString();
    } else {
      return data;
    }
  },

  testAllLiteralArray: function (arrayToTest) {
    const oneNotLiteral = arrayToTest.some(i => {
      const isNotLiteral = !this.isLiteral(i);
      return isNotLiteral
    })
    return !oneNotLiteral

  },

  testFragArray: function (arrayToTest) {
    if (arrayToTest.length <= 100) {
      return false;
    } else if (this.testAllLiteralArray(arrayToTest)) {
      return false
    } else {
      return true
    }
  },

  persist: async function (data, fragCaller, exitingFrag) {
    // console.log('____________exitingFrag',exitingFrag?.id);
    // if (exitingFrag?.id){
    //   console.trace()
    // }
    // if (this.isLiteral(data)){
    //     return this.processLiteral(data);
    // }else {
    // const fragmentModelInstance = await this.fragmentModel.getInstance();
    const model = this.fragmentModel.model;
    // console.log('_______fragmentModelInstance',model);
    let fargToPersist = exitingFrag || new model({
      rootFrag: fragCaller?.rootFrag != undefined || fragCaller?.originFrag != undefined ? undefined : uuidv4(),
      originFrag: fragCaller?.rootFrag || fragCaller?.originFrag,
    })

    if (this.isLiteral(data)) {
      fargToPersist.data = data;
      // fargToPersist.markModified('data');
      // fargToPersist.branchFrag=undefined;
      // console.log('_trace1'); // Ajouté
      return await this.fragmentModel.persistFragment(fargToPersist);
      // return await fargToPersist.save({ validateBeforeSave: false }); // Désactiver la validation
    } else if (Array.isArray(data)) {

      if (this.testFragArray(data)) {
        // console.log('FRAG ARRRAY',data)

        fargToPersist = await this.createArrayFrag(fargToPersist);
        const paramArray = data.map((item, index) => ([
          item,
          fargToPersist,
          index
        ]));
        const addToArrayOcherstrator = new this.PromiseOrchestrator()
        await addToArrayOcherstrator.execute(this, this.addDataToArrayFrag, paramArray, { beamNb: 1000 }, { quietLog: false });
        // for (let item of data){
        //   await this.addDataToArrayFrag(item,fargToPersist);
        // } 
        return fargToPersist;
      } else {
        // console.log('NOT FRAG ARRRAY',data)
        const arrayReadyToPersit = []
        for (let item of data) {
          const persistedObject = await this.persistObject(item, fargToPersist);
          if (persistedObject?.id && (uuidValidate(persistedObject.id) || persistedObject.id.constructor.name == 'Uuid')) {
            arrayReadyToPersit.push({
              _frag: persistedObject.id.toString()
            });
          } else {
            arrayReadyToPersit.push(persistedObject);
          }
        }
        // console.log('arrayReadyToPersit',arrayReadyToPersit)
        fargToPersist.data = arrayReadyToPersit;
        // fargToPersist.markModified('data');
        fargToPersist.branchFrag = undefined;
        console.log('________fargToPersist',fargToPersist.id,fargToPersist.data.length)
        // console.log('_trace1'); // Ajouté
        return await this.fragmentModel.persistFragment(fargToPersist);
        // return await fargToPersist.save({ validateBeforeSave: false }); // Désactiver la validation
      }
    } else {
      const objectData = await this.persistObject(data, fargToPersist)
      fargToPersist.data = objectData;
      // fargToPersist.markModified('data');
      fargToPersist.branchFrag = undefined;
      // console.log('_____fargToPersist',fargToPersist)
      // console.log('_trace1'); // Ajouté
      return await this.fragmentModel.persistFragment(fargToPersist);
      // return await fargToPersist.save({ validateBeforeSave: false }); // Désactiver la validation
    }
    // }
  },

  persistObject: async function (data, fragCaller, exitingFrag) {
    if (this.isLiteral(data)) {
      return this.processLiteral(data);
    } else if (Array.isArray(data) && this.testFragArray(data)) {
      // console.log(('object->frag'));
      return await this.persist(data, fragCaller, exitingFrag)
    } else {
      for (let key in data) {
        // console.log('persist key ',key)
        const persistReturn = await this.persistObject(data[key], fragCaller);
        if (persistReturn?.id && (uuidValidate(persistReturn.id) || persistReturn.id.constructor.name == 'Uuid')) {
          data[key] = {
            _frag: persistReturn.id.toString()
          }
        } else {
          data[key] = persistReturn;
        }
      }
      return data;
    }
  },

  createArrayFrag: async function (exitingFrag) {
    // console.log('createArrayFrag',exitingFrag);
    // const fragmentModelInstance = await this.fragmentModel.getInstance();
    const model = this.fragmentModel.model;
    let arrayFrag = exitingFrag || new model({
      rootFrag: uuidv4()
    });
    arrayFrag.data = [];
    // arrayFrag.markModified('data');
    arrayFrag.branchFrag = uuidv4();
    arrayFrag.maxIndex = 0;
    // console.log('_trace2'); // Ajouté
    return await this.fragmentModel.persistFragment(arrayFrag);
    // return await arrayFrag.save({ validateBeforeSave: false }); // Désactiver la validation

  },
  //call without index not support parallel calls (PromiseOrchestrator for ex)
  addFragToArrayFrag: async function (frag, arrayFrag, index) {
    // console.log('addFragToArrayFrag',frag,arrayFrag);
    const model = this.fragmentModel.model;
 
    let fragObject;
    if(!frag){
      fragObject= new model() 
    }
    else{
      const isObjectFrag = frag.id && (uuidValidate(frag.id) || frag.id.constructor.name == 'Uuid');
      // const fragmentModelInstance = await this.fragmentModel.getInstance();
      // const model = fragmentModelInstance.model;
      fragObject = isObjectFrag ? frag : await this.fragmentModel.getFragmentById(frag);
  
    }

    fragObject.branchOriginFrag = arrayFrag.branchFrag;
    fragObject.originFrag = arrayFrag.root || arrayFrag.originFrag;
    fragObject.rootFrag = undefined;
    if (index != undefined) {
      fragObject.index = index;
      // console.log('_trace3.1'); // Ajouté
      return await this.fragmentModel.persistFragment(fragObject);
      // await fragObject.save({ validateBeforeSave: false }); // Désactiver la validation
    } else {

      fragObject.index = arrayFrag.maxIndex + 1;

      arrayFrag.maxIndex = fragObject.index;
      // console.log('_trace4'); // Ajouté
      await this.fragmentModel.persistFragment(arrayFrag);

      // console.log('_trace3.2'); // Ajouté
      return  await this.fragmentModel.persistFragment(fragObject);
      // await fragObject.save({ validateBeforeSave: false }); // Désactiver la validation

      // await arrayFrag.save({ validateBeforeSave: false }); // Désactiver la validation
    }
  },
  addDataToArrayFrag: async function (data, arrayFrag, index) {
    // console.log('addDataToArrayFrag',data)
    const emptyFrag = await this.addFragToArrayFrag(undefined, arrayFrag, index)
    // emptyFrag.data=data;
    const frag = await this.persist(data, arrayFrag,emptyFrag)
    // await this.addFragToArrayFrag(frag, arrayFrag, index)

  },
  createRootArrayFragFromFrags: async function (frags) {
    // console.log('______createRootArrayFragFromFrags',frags);
    let newRootFrag = await this.createArrayFrag()
    for (let frag of frags) {
      await this.addFragToArrayFrag(frag, newRootFrag);
    }
    return newRootFrag;
  },


  get: function (id) {
    // console.log(" ------ get fragment------ ", id)
    return new Promise(async (resolve, reject) => {
      const fragmentReturn = await this.fragmentModel.getFragmentById(id);



      // const model = fragmentModelInstance.model;
      // const  fragmentReturn = await model.findOne({
      //   id: id
      // })
      // .lean()
      // .exec();

      if (fragmentReturn.branchFrag) {
        const frags = await this.fragmentModel.searchFragmentByField({
          branchOriginFrag: fragmentReturn.branchFrag
        })
        // const frags = await model.find({
        //   branchOriginFrag: fragmentReturn.branchFrag
        // }).lean().exec();
        // console.log('GET frag Array',frags)

        fragmentReturn.data = frags.map(f => {
          return {
            _frag: f.id
          }
        });
      } else {

        // fragmentReturn.data = this.replaceMongoNotSupportedKey(fragmentReturn.data, true);
      }
      resolve(fragmentReturn)
    });
  },

  getWithResolutionByBranch: async function (frag) {

    if (!frag) {
      throw new Error('frag have to be set');
    }
    // const fragmentModelInstance = await this.fragmentModel.getInstance();
    // console.log('frag',frag);
    const isObjectFrag = frag.id && (uuidValidate(frag.id) || frag.id.constructor.name == 'Uuid');
   

    // console.log('fragmentModelInstance',fragmentModelInstance);
    // const model = fragmentModelInstance.model;
    const fragToResolve = isObjectFrag ? frag : await this.fragmentModel.getFragmentById(frag);
    
    
    if (fragToResolve.branchFrag) {
      const children = await this.fragmentModel.searchFragmentByField({ branchOriginFrag: fragToResolve.branchFrag });
      // console.log('children',children)
      const childrenData = [];
      for (let child of children) {
        if (child.branchFrag) {
          const data = await this.getWithResolutionByBranch(child);
          childrenData.push(data);
        } else {
          // console.log('child',child);
          const data = await this.rebuildFragDataByBranch(child.data);
          childrenData.push(data);
        }
      }
      return childrenData.sort((a, b) => a.index < b.index);
    } else {
      return await this.rebuildFragDataByBranch(fragToResolve.data);
    }
  },

  rebuildFragDataByBranch: async function (data) {
    // console.log('data',data)
    if (data != null && data._frag) {
      return await this.getWithResolutionByBranch(data._frag);
    } else if (data == null) {
      return null;
    } else if (this.isLiteral(data)) {
      return data;
    } else if (data instanceof Object) {
      if (Array.isArray(data)) {
        let arrayDefrag = [];
        for (let item of data) {
          let itemDefrag = await this.rebuildFragDataByBranch(item,);
          itemDefrag = this.replaceMongoNotSupportedKey(itemDefrag, false);
          arrayDefrag.push(itemDefrag);
        }
        return arrayDefrag;
      } else {
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

  getWithResolution: function (id) {
    return new Promise(async (resolve, reject) => {
      try {
        let fragmentReturn;
        // const model = (await this.fragmentModel.getInstance()).model;
        fragmentReturn = await this.fragmentModel.searchFragmentById(id);
        if (fragmentReturn.rootFrag) {
          const framentParts = await this.fragmentModel.searchFragmentByField({
            originFrag: fragmentReturn.rootFrag
          });

          if (framentParts) {
            //all fragments whith originFrag (index by id)
            let partDirectory = {}
            //fragments group by originFrag (index by branchOriginFrag)
            let arrayDirectory = {}
            framentParts.forEach(frag => {
              if (frag.branchOriginFrag) {
                if (arrayDirectory[frag.branchOriginFrag]) {
                  arrayDirectory[frag.branchOriginFrag].push(frag);
                } else {
                  arrayDirectory[frag.branchOriginFrag] = [frag];
                }
              }
              partDirectory[frag.id] = frag;
            });
            let resolution = await this.rebuildFrag(fragmentReturn, partDirectory, arrayDirectory);
            fragmentReturn.data = resolution;
            resolve(fragmentReturn);
          }
        } else {
          // console.log('not fragRoot' );
          return Promise.resolve([])
        }


        model.findOne({
          id: id
        })
          .lean()
          .exec()
          .then((fragmentReturnIn) => {
            fragmentReturn = fragmentReturnIn;

            if (fragmentReturn.rootFrag) {

              return model.find({
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
                  partDirectory[frag.id] = frag;
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

  rebuildFrag: async function (frag, partDirectory, arrayDirectory, counter) {
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

  rebuildFragData: async function (object, partDirectory, arrayDirectory, counter) {
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
        uuidValidate(object) || object.constructor.name == 'Uuid' ||
        object.constructor.name == 'Buffer') {
        return object.toString();

      } else if (object instanceof Object) {
        if (Array.isArray(object)) {
          let arrayDefrag = [];
          for (let item of object) {
            let itemDefrag = await this.rebuildFragData(item, partDirectory, arrayDirectory, counter);
            // itemDefrag = this.replaceMongoNotSupportedKey(itemDefrag, false);
            arrayDefrag.push(itemDefrag);
          }
          return arrayDefrag;
        } else {
          for (let key in object) {
            object[key] = await this.rebuildFragData(object[key], partDirectory, arrayDirectory, counter);
            // object = this.replaceMongoNotSupportedKey(object, false);
          }
          return object;
        }

      } else {
        return object;
      }
    }
  },

  replaceMongoNotSupportedKey: function (object, deep) {
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
    } else if (this.isObject(object) && !this.isLiteral(object)) {
      // console.log('___replaceMongoNotSupportedKey object ',object,this.isLiteral(object))
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

  cleanFrag: async function (id) {
    const model = (await this.fragmentModel.getInstance()).model;
    model.findOne({
      id: id
    })
      .lean()
      .exec()
      .then(async frag => {
        if (frag != null) {
          if (frag.frags != undefined) {
            await model.deleteMany({
              frags: {
                $in: frag.frags
              }
            }).exec();
          }
          if (frag.rootFrag) {
            await model.deleteMany({
              originFrag: frag.rootFrag
            }).exec();
          }
          await model.deleteMany({
            id: frag.id
          }).exec();
        }
      })
  },

  tagGarbage: async function (id) {
    // console.log('tagGarbage',id)
    // const model = (await this.fragmentModel.getInstance()).model;

    if (id) {
      try{
       const frag = await this.fragmentModel.getFragmentById(id);
       if (frag != null) {
        if (frag.rootFrag) {
          await this.fragmentModel.updateMultipleFragments(
            {
              id: frag.rootFrag
            },
            {
              garbageTag: 1
            }
          );
        }
      }
      }catch(e){
        console.log('error',e)
      }

    }
  },

  // frag support fragId or frag object
  copyFragUntilPath: async function (frag, dfobTable, keepArray, relativHistoryTable = [], callerFrag = undefined) {
    // console.log('keepArray',keepArray,dfobTable);
    
    if (!frag) {
      throw new Error('frag have to be set');
    }
    // console.time('copyFragUntilPath init' + '_' + frag);
    const isObjectFrag = frag.id && (uuidValidate(frag.id) || frag.id.constructor.name == 'Uuid');
    // const fragmentModelInstance = await this.fragmentModel.getInstance();
    const model = this.fragmentModel.model;

    const fragToCopy = isObjectFrag ? frag : await this.fragmentModel.getFragmentById(frag);
    // console.timeEnd('copyFragUntilPath init' + '_' + frag);
    // console.log('fragToCopy',fragToCopy);

    // console.log('fragToCopy',fragToCopy);
    if (fragToCopy.branchFrag) {
      // console.time('copyFragUntilPath branchFrag' + '_' + frag);
      const newFrag = new model({
        id: undefined,
        data: fragToCopy.data,
        //rootfrag should be undefind if caller but not in real life :-(
        rootFrag: fragToCopy.rootFrag && !callerFrag ? uuidv4() : undefined,
        originFrag: callerFrag ? callerFrag.originFrag || callerFrag.rootFrag : undefined,
        branchFrag: fragToCopy.branchFrag ? uuidv4() : undefined,
        maxIndex: fragToCopy.maxIndex,
        index: fragToCopy.index,
        branchOriginFrag: callerFrag ? callerFrag.branchFrag : undefined,
        garbageProcess: false
      })
      // console.log('newFrag',newFrag);
      // await newFrag.save({ validateBeforeSave: false }); // Désactiver la validation
      // console.log('_trace5'); // Ajouté
      await this.fragmentModel.persistFragment(newFrag);
      // const fragleaves = await model.find({ branchOriginFrag: fragToCopy.branchFrag })
      const fragleaves = await this.fragmentModel.searchFragmentByField({ branchOriginFrag: fragToCopy.branchFrag })
      let arrayOut = [];
      let fragmentSelected = [];
      for (let record of fragleaves) {
        // console.log('copyFragUntilPath for branchFrag',record.id)
        // console.log('_____call copyFragUntilPath')
        const processedData = await this.copyFragUntilPath(record.id, dfobTable, keepArray, relativHistoryTable, newFrag);
        arrayOut.push(processedData.data);
        fragmentSelected = fragmentSelected.concat(processedData.dfobFragmentSelected);
      }
      // console.log('keepArray',keepArray,dfobTable);
      if (keepArray && dfobTable.length == 0) {
        fragmentSelected = [{
          frag: newFrag,
          //relativHistoryTable is [] cause by copyDataUntilPath call or dafault.
          relativHistoryTableSelected: relativHistoryTable,
          relativDfobTable: []
        }];
      }
      // console.timeEnd('copyFragUntilPath branchFrag' + '_' + frag);
      return {
        data: arrayOut,
        dfobFragmentSelected: fragmentSelected,
        rootFrag: newFrag.rootFrag,
        newFrag: newFrag
      };
    } else {
      // console.trace();
      // console.time('copyFragUntilPath normal 1' + '_' + frag);
      // console.log('-------------------step 0--------------');
      const newFragRaw = {
        data: fragToCopy.data,
        originFrag: callerFrag ? callerFrag.originFrag || callerFrag.rootFrag : undefined,
        branchOriginFrag: callerFrag ? callerFrag.branchFrag : undefined,
        rootFrag: fragToCopy.rootFrag ? uuidv4() : undefined,
        index: fragToCopy.index,
        branchFrag: undefined,
        garbageProcess: false
      }
      // console.log('-------------------step 1--------------');

      let newFrag = new model(newFragRaw)
      // console.log('-------------------step 2--------------');
      // await newFrag.save({ validateBeforeSave: false }); // Désactiver la validation
      // await this.fragmentModel.persistFragment(newFrag);
      // console.log('-------------------step 3--------------');
      // console.timeEnd('copyFragUntilPath normal 1' + '_' + frag);
      // console.time('copyFragUntilPath normal 2' + '_' + frag);
      const processedData = await this.copyDataUntilPath(newFrag.data, dfobTable, keepArray, relativHistoryTable, newFrag);
      // console.log('______processedData',JSON.stringify(processedData))

      newFrag.data = processedData.data;
      // newFrag.markModified('data');
      // newFrag = await newFrag.save({ validateBeforeSave: false }); // Désactiver la validation
      // console.log('_trace5'); // Ajouté
      await this.fragmentModel.persistFragment(newFrag);
      // console.timeEnd('copyFragUntilPath normal 2' + '_' + frag);
      // console.log('________newFrag',JSON.stringify(newFrag))
      // console.time('copyFragUntilPath normal 3' + '_' + frag);
      const isDfobFragmentSelected = processedData.dfobFragmentSelected && processedData.dfobFragmentSelected.length > 0;
      // console.timeEnd('copyFragUntilPath normal 3' + '_' + frag);

      // const fragVerif = await model.findOne({id: newFrag.id}).exec();
      // console.log('__copyFragUntilPath fragVerif',JSON.stringify(fragVerif))

      return {
        data: processedData.data,
        //if no processedData.dfobFragmentSelected but algo is here, that means this step create fragment
        dfobFragmentSelected: isDfobFragmentSelected ? processedData.dfobFragmentSelected : [{
          frag: newFrag,
          relativHistoryTableSelected: processedData.relativHistoryTableSelected,
          relativDfobTable: dfobTable
        }],
        rootFrag: newFrag.rootFrag,
        newFrag: newFrag
      };

    }

  },
  copyDataUntilPath: async function (data, dfobTable, keepArray, relativHistoryTable = [], callerFrag) {
    // console.log('data to copy',data)
    // if (data==undefined){
    //   throw new Error('data have to be set');
    // }
    if (data == undefined) {
      return {
        data: undefined,
        relativHistoryTable
      };
    } else if (data == null) {
      return {
        data: null,
        relativHistoryTable
      };
    } else if (this.isLiteral(data)) {
      return {
        data: this.processLiteral(data),
        relativHistoryTable
      };
    } else if (data instanceof Object) {
      if (Array.isArray(data)) {
        let arrayDefrag = [];
        let fragmentSelected = [];
        let relativHistoryTableSelected = []
        for (let item of data) {
          const processedData = await this.copyDataUntilPath(item, dfobTable, keepArray, relativHistoryTable);
          // console.log('_________processedData',processedData)
          let itemDefrag = processedData.data;
          // itemDefrag = this.replaceMongoNotSupportedKey(itemDefrag, false);
          arrayDefrag.push(itemDefrag);
          fragmentSelected = fragmentSelected.concat(fragmentSelected);
          // fragmentSelected.push(processedData.dfobFragmentSelected);
          relativHistoryTableSelected = processedData.relativHistoryTableSelected?.length > relativHistoryTableSelected ? processedData.relativHistoryTableSelected : relativHistoryTableSelected;
        }
        return {
          data: arrayDefrag,
          relativHistoryTableSelected: relativHistoryTableSelected,
          dfobFragmentSelected: fragmentSelected
        };
      } else {

        let relativHistoryTableCopy = [...relativHistoryTable]
        let fragmentSelected = [];
        let relativHistoryTableSelected = [];
        for (let key in data) {
          // console.log('______key',key)
          // console.log('______dfobTable',dfobTable)
          let dfobTableCurrent = [...dfobTable];
          let dfobTableCopy = [...dfobTable];
          let dfobMarker = false;
          if (dfobTableCurrent[0] && dfobTableCurrent[0].localeCompare(key) == 0) {
            dfobTableCopy = dfobTableCurrent.slice(1);
            dfobMarker = true;
            relativHistoryTableCopy = relativHistoryTableCopy.concat(key);
          } else {
            dfobTableCurrent = [];
          }
          // console.log('____relativHistoryTableCopy 1',relativHistoryTableCopy)
          if (data[key] && data[key] != null && data[key]._frag) {
            if (dfobTableCurrent.length > 0) {
              // console.log('_____call copyFragUntilPath 2')
              const persitedFrag = await this.copyFragUntilPath(data[key]._frag, dfobTableCopy, keepArray, [], callerFrag)
              data[key] = {
                _frag: persitedFrag.newFrag.id.toString()
              };
              if (persitedFrag.dfobFragmentSelected) {
                fragmentSelected = fragmentSelected.concat(persitedFrag.dfobFragmentSelected);
              }
            }
          } else {
            // console.log('_',key,data[key])
            const processedData = await this.copyDataUntilPath(data[key], dfobTableCopy, keepArray, relativHistoryTableCopy, callerFrag);

            data[key] = processedData.data;
            // data = this.replaceMongoNotSupportedKey(data, false);
            if (processedData.dfobFragmentSelected) {
              fragmentSelected = fragmentSelected.concat(processedData.dfobFragmentSelected)
            }
            // fragmentSelected=processedData.dfobFragmentSelected?processedData.dfobFragmentSelected:undefined;
            // console.log('__->',processedData.relativHistoryTableSelected,relativHistoryTableCopy)
            if (processedData?.relativHistoryTableSelected?.length > relativHistoryTableSelected.length) {
              relativHistoryTableSelected = processedData.relativHistoryTableSelected;
              relativHistoryTableCopy = relativHistoryTableSelected
            } else {
              // console.log('____relativHistoryTableCopy 2',relativHistoryTableCopy)
              relativHistoryTableSelected = relativHistoryTableCopy
            }
            // relativHistoryTableSelected=processedData?.relativHistoryTableSelected?.length>relativHistoryTableSelected.length?processedData.relativHistoryTableSelected:relativHistoryTableCopy;
          }
          // console.log('___________processedData',data);
        }
        // console.log('_____ return data',JSON.stringify(data));
        // console.log('_____________________________relativHistoryTableSelected',relativHistoryTableSelected)
        // console.log('_____________________________dfobTableCopy',dfobTableCopy)
        // console.log('_____________________________dfobTable',dfobTable)
        return {
          data,
          relativHistoryTableSelected: relativHistoryTableSelected,
          dfobFragmentSelected: fragmentSelected
        };
      }
    } else {
      return {
        data,
        relativHistoryTable
      };
    }
  }
};

