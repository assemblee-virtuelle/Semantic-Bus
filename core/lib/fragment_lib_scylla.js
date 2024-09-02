'use strict';

const { v4: uuidv4, validate: uuidValidate } = require('uuid');

module.exports = {
  fragmentModel: require('../models/fragments_model_scylla'),
  PromiseOrchestrator: require('../helpers/promiseOrchestrator.js'),
  ArraySegmentator: require('../helpers/ArraySegmentator.js'),
  ObjectID: require('bson').ObjectID,
  objectSizeOf: require("object-sizeof"),
  isObject: require('isobject'),
  PromiseOrchestrator: require('../helpers/promiseOrchestrator.js'),

  isLiteral(data) {
    return (data == null ||
      data == undefined ||
      (typeof data) == 'function' ||
      uuidValidate(data) ||
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

    const model = this.fragmentModel.model;
    let fargToPersist = exitingFrag || new model({
      rootFrag: fragCaller?.rootFrag != undefined || fragCaller?.originFrag != undefined ? undefined : uuidv4(),
      originFrag: fragCaller?.rootFrag || fragCaller?.originFrag,
    })
    if (this.isLiteral(data)) {
      fargToPersist.data = data;
      return await this.fragmentModel.persistFragment(fargToPersist);
    } else if (Array.isArray(data)) {

      if (this.testFragArray(data)) {
        fargToPersist = await this.createArrayFrag(fargToPersist);
        const paramArray = data.map((item, index) => ([
          item,
          fargToPersist,
          index
        ]));
        const addToArrayOcherstrator = new this.PromiseOrchestrator()
        await addToArrayOcherstrator.execute(this, this.addDataToArrayFrag, paramArray, { beamNb: 1000 }, { quietLog: false });
        return fargToPersist;
      } else {
        const arrayReadyToPersit = []
        for (let item of data) {
          const persistedObject = await this.persistObject(item, fargToPersist);
          if (persistedObject instanceof this.fragmentModel.model) {
            arrayReadyToPersit.push({
              _frag: persistedObject.id.toString()
            });
          } else {
            arrayReadyToPersit.push(persistedObject);
          }
        }
        fargToPersist.data = arrayReadyToPersit;
        fargToPersist.branchFrag = undefined;
        return await this.fragmentModel.persistFragment(fargToPersist);
      }
    } else {
      const objectData = await this.persistObject(data, fargToPersist)
      fargToPersist.data = objectData;
      fargToPersist.branchFrag = undefined;
      return await this.fragmentModel.persistFragment(fargToPersist);
    }
  },

  persistObject: async function (data, fragCaller, exitingFrag) {
    if (this.isLiteral(data)) {
      return this.processLiteral(data);
    } else if (Array.isArray(data) && this.testFragArray(data)) {
      return await this.persist(data, fragCaller, exitingFrag)
    } else {
      for (let key in data) {
        const persistReturn = await this.persistObject(data[key], fragCaller);
        if (persistReturn instanceof this.fragmentModel.model) {
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
    const model = this.fragmentModel.model;
    let arrayFrag = exitingFrag || new model({
      rootFrag: uuidv4()
    });
    arrayFrag.data = [];
    arrayFrag.branchFrag = uuidv4();
    arrayFrag.maxIndex = 0;
    return await this.fragmentModel.persistFragment(arrayFrag);
  },
  //call without index not support parallel calls (PromiseOrchestrator for ex)
  addFragToArrayFrag: async function (frag, arrayFrag, index) {
    const model = this.fragmentModel.model;
    let fragObject;
    if (!frag) {
      fragObject = new model()
    }
    else {
      const isObjectFrag = frag instanceof this.fragmentModel.model;
      fragObject = isObjectFrag ? frag : await this.fragmentModel.getFragmentById(frag);

    }

    fragObject.branchOriginFrag = arrayFrag.branchFrag;
    fragObject.originFrag = arrayFrag.root || arrayFrag.originFrag;
    fragObject.rootFrag = undefined;
    if (index != undefined) {
      fragObject.index = index;
      return await this.fragmentModel.persistFragment(fragObject);
    } else {
      fragObject.index = arrayFrag.maxIndex + 1;
      arrayFrag.maxIndex = fragObject.index;
      await this.fragmentModel.persistFragment(arrayFrag);
      return await this.fragmentModel.persistFragment(fragObject);
    }
  },
  addDataToArrayFrag: async function (data, arrayFrag, index) {
    const emptyFrag = await this.addFragToArrayFrag(undefined, arrayFrag, index)
    const frag = await this.persist(data, arrayFrag, emptyFrag)

  },
  createRootArrayFragFromFrags: async function (frags) {
    let newRootFrag = await this.createArrayFrag()
    for (let frag of frags) {
      await this.addFragToArrayFrag(frag, newRootFrag);
    }
    return newRootFrag;
  },


  get: function (id) {
    return new Promise(async (resolve, reject) => {
      const fragmentReturn = await this.fragmentModel.getFragmentById(id);

      if (fragmentReturn.branchFrag) {
        const frags = await this.fragmentModel.searchFragmentByField({
          branchOriginFrag: fragmentReturn.branchFrag
        })

        fragmentReturn.data = frags.map(f => {
          return {
            _frag: f.id
          }
        });
      } else {
        // keep fragmentReturn as is
      }
      resolve(fragmentReturn)
    });
  },

  getWithResolutionByBranch: async function (frag) {

    if (!frag) {
      throw new Error('frag have to be set');
    }
    const isObjectFrag = frag instanceof this.fragmentModel.model;

    const fragToResolve = isObjectFrag ? frag : await this.fragmentModel.getFragmentById(frag);


    if (fragToResolve.branchFrag) {
      const children = await this.fragmentModel.searchFragmentByField({ branchOriginFrag: fragToResolve.branchFrag });

      const childrenData = [];
      for (let child of children) {
        if (child.branchFrag) {
          const data = await this.getWithResolutionByBranch(child);
          childrenData.push(data);
        } else {

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
        object instanceof this.fragmentModel.model ||
        object.constructor.name == 'Buffer') {
        return object.toString();

      } else if (object instanceof Object) {
        if (Array.isArray(object)) {
          let arrayDefrag = [];
          for (let item of object) {
            let itemDefrag = await this.rebuildFragData(item, partDirectory, arrayDirectory, counter);
            arrayDefrag.push(itemDefrag);
          }
          return arrayDefrag;
        } else {
          for (let key in object) {
            object[key] = await this.rebuildFragData(object[key], partDirectory, arrayDirectory, counter);
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
    if (id) {
      try {
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
      } catch (e) {
        console.log('error', e)
      }

    }
  },

  // frag support fragId or frag object
  copyFragUntilPath: async function (frag, dfobTable, keepArray, relativHistoryTable = [], callerFrag = undefined) {
    if (!frag) {
      throw new Error('frag have to be set');
    }
    const isObjectFrag = frag instanceof this.fragmentModel.model;
    const model = this.fragmentModel.model;
    const fragToCopy = isObjectFrag ? frag : await this.fragmentModel.getFragmentById(frag);

    if (fragToCopy.branchFrag) {
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
      await this.fragmentModel.persistFragment(newFrag);
      const fragleaves = await this.fragmentModel.searchFragmentByField({ branchOriginFrag: fragToCopy.branchFrag })
      let arrayOut = [];
      let fragmentSelected = [];
      for (let record of fragleaves) {
        const processedData = await this.copyFragUntilPath(record.id, dfobTable, keepArray, relativHistoryTable, newFrag);
        arrayOut.push(processedData.data);
        fragmentSelected = fragmentSelected.concat(processedData.dfobFragmentSelected);
      }
      if (keepArray && dfobTable.length == 0) {
        fragmentSelected = [{
          frag: newFrag,
          //relativHistoryTable is [] cause by copyDataUntilPath call or dafault.
          relativHistoryTableSelected: relativHistoryTable,
          relativDfobTable: []
        }];
      }
      return {
        data: arrayOut,
        dfobFragmentSelected: fragmentSelected,
        rootFrag: newFrag.rootFrag,
        newFrag: newFrag
      };
    } else {
      const newFragRaw = {
        data: fragToCopy.data,
        originFrag: callerFrag ? callerFrag.originFrag || callerFrag.rootFrag : undefined,
        branchOriginFrag: callerFrag ? callerFrag.branchFrag : undefined,
        rootFrag: fragToCopy.rootFrag ? uuidv4() : undefined,
        index: fragToCopy.index,
        branchFrag: undefined,
        garbageProcess: false
      }

      let newFrag = new model(newFragRaw)
      const processedData = await this.copyDataUntilPath(newFrag.data, dfobTable, keepArray, relativHistoryTable, newFrag);
      newFrag.data = processedData.data;
      await this.fragmentModel.persistFragment(newFrag);
      const isDfobFragmentSelected = processedData.dfobFragmentSelected && processedData.dfobFragmentSelected.length > 0;

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
          let itemDefrag = processedData.data;
          arrayDefrag.push(itemDefrag);
          fragmentSelected = fragmentSelected.concat(fragmentSelected);
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
          if (data[key] && data[key] != null && data[key]._frag) {
            if (dfobTableCurrent.length > 0) {
              const persitedFrag = await this.copyFragUntilPath(data[key]._frag, dfobTableCopy, keepArray, [], callerFrag)
              data[key] = {
                _frag: persitedFrag.newFrag.id.toString()
              };
              if (persitedFrag.dfobFragmentSelected) {
                fragmentSelected = fragmentSelected.concat(persitedFrag.dfobFragmentSelected);
              }
            }
          } else {
            const processedData = await this.copyDataUntilPath(data[key], dfobTableCopy, keepArray, relativHistoryTableCopy, callerFrag);
            data[key] = processedData.data;
            if (processedData.dfobFragmentSelected) {
              fragmentSelected = fragmentSelected.concat(processedData.dfobFragmentSelected)
            }
            if (processedData?.relativHistoryTableSelected?.length > relativHistoryTableSelected.length) {
              relativHistoryTableSelected = processedData.relativHistoryTableSelected;
              relativHistoryTableCopy = relativHistoryTableSelected
            } else {
              relativHistoryTableSelected = relativHistoryTableCopy
            }
          }
        }
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

