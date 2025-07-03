'use strict';

const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const { isLiteral, processLiteral, testAllLiteralArray } = require('../helpers/literalHelpers');


module.exports = {
  fragmentModel: require('../models/fragments_model_scylla'),
  PromiseOrchestrator: require('../helpers/promiseOrchestrator.js'),
  ArraySegmentator: require('../helpers/ArraySegmentator.js'),
  ObjectID: require('bson').ObjectID,
  objectSizeOf: require('object-sizeof'),
  isObject: require('isobject'),

  // isLiteral,

  // processLiteral,

  // testAllLiteralArray,

  testFragArray: function(arrayToTest) {
    if (arrayToTest.length <= 100) {
      return false;
    } else if (testAllLiteralArray(arrayToTest)) {
      return false;
    } else {
      return true;
    }

    // if (testAllLiteralArray(arrayToTest)) {
    //     return false
    // } else {
    //     return true
    // }

    // return true
  },

  persist: async function(data, fragCaller, exitingFrag) {
    // if (!fragCaller){
    //     console.log('____persist____',fragCaller,exitingFrag)
    //     console.log('____persist data____',JSON.stringify(data))
    // }

    const model = this.fragmentModel.model;
    let fargToPersist = exitingFrag || new model({
      rootFrag: fragCaller?.rootFrag != undefined || fragCaller?.originFrag != undefined ? undefined : uuidv4(),
      originFrag: fragCaller?.rootFrag || fragCaller?.originFrag
    });

    if (isLiteral(data)) {
      fargToPersist.data = data;
      if(exitingFrag) {
        return await this.fragmentModel.updateFragment(fargToPersist);
      } else {
        return await this.fragmentModel.insertFragment(fargToPersist);
      }
    } else if (Array.isArray(data)) {
      if (this.testFragArray(data)) {
        fargToPersist = await this.createArrayFrag(fargToPersist);
        const paramArray = data.map((item, index) => ([
          item,
          fargToPersist,
          index + 1
        ]));
        const addToArrayOcherstrator = new this.PromiseOrchestrator();
        await addToArrayOcherstrator.execute(this, this.addDataToArrayFrag, paramArray, { beamNb: 1000 }, { quietLog: false });
        return fargToPersist;
      } else {
        const arrayReadyToPersit = [];
        for (const item of data) {
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
        if(exitingFrag) {
          return await this.fragmentModel.updateFragment(fargToPersist);
        } else {
          return await this.fragmentModel.insertFragment(fargToPersist);
        }
      }
    } else {
      const objectData = await this.persistObject(data, fargToPersist);
      fargToPersist.data = objectData;
      fargToPersist.branchFrag = undefined;
      if(exitingFrag) {
        return await this.fragmentModel.updateFragment(fargToPersist);
      } else {
        return await this.fragmentModel.insertFragment(fargToPersist);
      }
    }
  },

  persistObject: async function(data, fragCaller, exitingFrag) {
    if (isLiteral(data)) {
      return processLiteral(data);
    } else if (Array.isArray(data) && this.testFragArray(data)) {
      const fragment = await this.persist(data, fragCaller, exitingFrag);
      return fragment;
    } else {
      for (const key in data) {
        const persistReturn = await this.persistObject(data[key], fragCaller);
        if (persistReturn instanceof this.fragmentModel.model) {
          data[key] = {
            _frag: persistReturn.id.toString()
          };
        } else {
          data[key] = persistReturn;
        }
      }
      return data;
    }
  },

  createArrayFrag: async function(exitingFrag, omitPersist) {
    const model = this.fragmentModel.model;
    const arrayFrag = exitingFrag || new model({
      rootFrag: uuidv4()
    });
    arrayFrag.data = [];
    arrayFrag.branchFrag = uuidv4();
    arrayFrag.maxIndex = 0;
    if (!omitPersist) {
      let result;


      result = await this.fragmentModel.insertFragment(arrayFrag);

      return result;
    } else {
      return arrayFrag;
    }
  },
  // call without index not support parallel calls (PromiseOrchestrator for ex)
  addFragToArrayFrag: async function(frag, arrayFrag, index, callbackBeforePersist = null) {
    const model = this.fragmentModel.model;
    let fragObject;
    if (!frag) {
      fragObject = new model();
    } else {
      const isObjectFrag = frag instanceof this.fragmentModel.model;
      fragObject = isObjectFrag ? frag : await this.fragmentModel.getFragmentById(frag);
    }

    fragObject.branchOriginFrag = arrayFrag.branchFrag;
    fragObject.originFrag = arrayFrag.rootFrag || arrayFrag.originFrag;
    if (index != undefined) {
      // console.log('___addFragToArrayFrag index', index)
      fragObject.index = index;
      if (callbackBeforePersist) {
        fragObject = await callbackBeforePersist(arrayFrag, fragObject);
      }
      if(!frag) {
        return await this.fragmentModel.insertFragment(fragObject);
      } else {
        return await this.fragmentModel.updateFragment(fragObject);
      }
    } else {
      fragObject.index = arrayFrag.maxIndex + 1;
      arrayFrag.maxIndex = fragObject.index;
      await this.fragmentModel.updateFragment(arrayFrag);
      if (callbackBeforePersist) {
        fragObject = await callbackBeforePersist(arrayFrag, fragObject);
      }
      if(!frag) {
        return await this.fragmentModel.insertFragment(fragObject);
      } else {
        return await this.fragmentModel.updateFragment(fragObject);
      }
    }
  },


  addDataToArrayFrag: async function(data, arrayFrag, index) {
    // console.log('addDataToArrayFrag', data, arrayFrag, index)
    const emptyFrag = await this.addFragToArrayFrag(undefined, arrayFrag, index, async(arrayFrag, readyToPersistFrag) => {
      const persistedObject = await this.persistObject(data, readyToPersistFrag);

      if (persistedObject instanceof this.fragmentModel.model) {
        readyToPersistFrag.branchFrag = persistedObject.branchFrag;
        readyToPersistFrag.data = persistedObject.data;
      } else {
        readyToPersistFrag.data = persistedObject;
      }
      return readyToPersistFrag;
    });
    // const frag = await this.persist(data, arrayFrag, emptyFrag)
  },
  createRootArrayFragFromFrags: async function(frags) {
    const newRootFrag = await this.createArrayFrag();
    let index = 1;
    for (const frag of frags) {
      await this.addFragToArrayFrag(frag, newRootFrag, index);
      index++;
    }
    return newRootFrag;
  },


  get: function(id) {
    return new Promise(async(resolve, reject) => {
      try {
        const fragmentReturn = await this.fragmentModel.getFragmentById(id);

        if (fragmentReturn.branchFrag) {
          const frags = await this.fragmentModel.searchFragmentByField({
            branchOriginFrag: fragmentReturn.branchFrag
          }, {
            index: 'ASC'
          }, {
            index: 1,
            id: 1
          });
          // console.log('___frags', frags.map(f => f.index))
          fragmentReturn.data = frags.map(f => {
            return {
              _frag: f.id
            };
          });
        } else {
          // keep fragmentReturn as is
        }
        resolve(fragmentReturn);
      } catch (e) {
        reject(e);
      }
    });
  },

  /**
     * Retrieves data with resolution by branch.or execute callBackOnPath if set
     *
     * @param {Object} frag - The fragment to resolve.
     * @param {Object} options - The options for resolution.
     * @param {Array} [options.pathTable] - An array of paths. If set, the function will return data defraged until the path and not after.
     * @param {boolean} [options.deeperFocusActivated=false] - If true, activates deeper focus.
     * @param {Function} [options.callBackOnPath] - If set, the function will call the callback instead of returning data.
     * If callBackOnPath is set and deeperFocusActivated is true, and pathTable is [] (path is resolved), callback is called with all data of the array instead of the raw array.
     *
     * @returns {Promise<Object>} - The resolved data.
     *
     * @throws {Error} - If the fragment is not set.
     */
  getWithResolutionByBranch: async function(frag, options = { pathTable: undefined, deeperFocusActivated: false, callBackOnPath: undefined }) {
    if (!frag) {
      throw new Error('frag have to be set');
    }
    const isObjectFrag = frag instanceof this.fragmentModel.model;
    const fragToResolve = isObjectFrag ? frag : await this.fragmentModel.getFragmentById(frag);

    if (fragToResolve.branchFrag) {
      // console.log('___fragToResolve.branchFrag', fragToResolve.branchFrag);
      if (options.callBackOnPath && options.pathTable && options.pathTable.length == 0 && options.deeperFocusActivated) {
        await this.fragmentModel.searchFragmentByField({
          branchOriginFrag: fragToResolve.branchFrag
        }, undefined, undefined, undefined, async(fragments) => {
          fragments.forEach(async(fragment) => {
            await options.callBackOnPath(fragment.data);
          });
        });
      } else {
        const children = await this.fragmentModel.searchFragmentByField({
          branchOriginFrag: fragToResolve.branchFrag
        }, {
          index: 'ASC'
        });

        const childrenData = [];
        for (const child of children) {
          if (child.branchFrag) {
            const data = await this.getWithResolutionByBranch(child, options);
            childrenData.push(data);
          } else {
            const data = await this.rebuildFragDataByBranch(child.data, options);
            childrenData.push(data);
          }
        }
        if (options.callBackOnPath && options.pathTable && options.pathTable.length == 0 && !options.deeperFocusActivated) {
          await options.callBackOnPath(childrenData);
        } else {
          return childrenData;
        }
      }
    } else {
      const data = await this.rebuildFragDataByBranch(fragToResolve.data, options);
      return data;
    }
  },

  /**
     * This function retrieves and data throw properties
     * If a property is a fragment, getWithResolutionByBranch is called
     * The function also supports callback functions to be executed on the resolved path.
     *
     * @param {Object|string} frag - The fragment to resolve. It can be an object or a fragment ID.
     * @param {Object} [options] - The options for resolving the fragment.
     * @param {Array} [options.pathTable] - The path table to be used during resolution.
     */

  rebuildFragDataByBranch: async function(data, options = { pathTable: undefined, callBackOnPath: undefined, deeperFocusActivated: false }) {
    if (options.callBackOnPath && Array.isArray(options.pathTable) && options.pathTable.length == 0) {
      if (options.deeperFocusActivated && Array.isArray(data)) {
        for (const item of data) {
          await options.callBackOnPath(item);
        }
      } else {
        await options.callBackOnPath(data);
      }
    }
    else {
      if (isLiteral(data)) {
        return data;
      } else if (data instanceof Object) {
        if (Array.isArray(data)) {
          const arrayDefrag = [];
          for (const item of data) {
            let itemDefrag;
            if (item?._frag) {
              itemDefrag = await this.getWithResolutionByBranch(item._frag, options);
            } else {
              itemDefrag = await this.rebuildFragDataByBranch(item, options);
            }
            arrayDefrag.push(itemDefrag);
          }
          return arrayDefrag;
        } else {
          for (const key in data) {
            // console.log('_____ key', key)
            const callOptions = { ...options, pathTable: [options.pathTable] };
            const firstPath = callOptions.pathTable?.[0];
            let continueFragByPath = false;
            if (firstPath && firstPath.includes(key)) {
              callOptions.pathTable.shift();
              continueFragByPath = true;
            } else {
              callOptions.pathTable = undefined;
              callOptions.deeperFocusActivated = false;
            }
            const continueFrag = !options.pathTable || continueFragByPath;
            // console.log('___continueFrag', key, continueFrag)

            let valueOfkey;
            // console.log('___data[key]',data,key, data[key]);
            if (data[key]?._frag && continueFrag) {
              // console.log('_____ continue defrag', key, data[key]._frag)
              valueOfkey = await this.getWithResolutionByBranch(data[key]._frag, callOptions);
            } else {
              valueOfkey = await this.rebuildFragDataByBranch(data[key], callOptions);
            }

            if (valueOfkey) {
              data[key] = valueOfkey;
            }

            // data = this.replaceMongoNotSupportedKey(data, false);
          }
          return data;
        }
      } else {
        return data;
      }
    }
  },

  getWithResolution: function(id) {
    return new Promise(async(resolve, reject) => {
      try {
        let fragmentReturn;
        fragmentReturn = await this.fragmentModel.searchFragmentById(id);
        if (fragmentReturn.rootFrag) {
          const framentParts = await this.fragmentModel.searchFragmentByField({
            originFrag: fragmentReturn.rootFrag
          });

          if (framentParts) {
            // all fragments whith originFrag (index by id)
            const partDirectory = {};
            // fragments group by originFrag (index by branchOriginFrag)
            const arrayDirectory = {};
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
            const resolution = await this.rebuildFrag(fragmentReturn, partDirectory, arrayDirectory);
            fragmentReturn.data = resolution;
            resolve(fragmentReturn);
          }
        } else {
          return Promise.resolve([]);
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
              return Promise.resolve([]);
            }
          }).then(async framentParts => {
            try {
              // all fragments whith originFrag (index by id)
              const partDirectory = {};
              // fragments group by originFrag (index by branchOriginFrag)
              const arrayDirectory = {};
              if (framentParts) {
                const partBinding = framentParts.forEach(frag => {
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
              const resolution = await this.rebuildFrag(fragmentReturn, partDirectory, arrayDirectory);
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
      const arrayOut = [];
      for (const record of records) {
        if (record.branchFrag) {
          arrayOut.push(await this.rebuildFrag(record, partDirectory, arrayDirectory, counter));
        } else {
          arrayOut.push(await this.rebuildFragData(record.data, partDirectory, arrayDirectory, counter));
        }
      }
      return arrayOut;
    } else {
      return await this.rebuildFragData(frag.data, partDirectory, arrayDirectory, counter);
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

      return await this.rebuildFrag(persitedFrag, partDirectory, arrayDirectory, counter);
    } else {
      if (object == null) {
        return null;
      } else if (
        (typeof object) === 'function' ||
                object instanceof this.fragmentModel.model ||
                object.constructor.name == 'Buffer') {
        return object.toString();
      } else if (object instanceof Object) {
        if (Array.isArray(object)) {
          const arrayDefrag = [];
          for (const item of object) {
            const itemDefrag = await this.rebuildFragData(item, partDirectory, arrayDirectory, counter);
            arrayDefrag.push(itemDefrag);
          }
          return arrayDefrag;
        } else {
          for (const key in object) {
            object[key] = await this.rebuildFragData(object[key], partDirectory, arrayDirectory, counter);
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
      const out = [];
      for (const item of object) {
        if (deep == true) {
          out.push(this.replaceMongoNotSupportedKey(item, true));
        } else {
          out.push(item);
        }
      }
      return out;
    } else if (this.isObject(object) && !isLiteral(object)) {
      const out = {};
      for (const key in object) {
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

  cleanFrag: async function(id) {
    if (uuidValidate(id)) {
      const targetFrag = await this.fragmentModel.getFragmentById(id);
      // const children = await this.fragmentModel.searchFragmentByField({
      //     originFrag: targetFrag.rootFrag
      // });
      // console.table(children.map(c=>{
      //     return {
      //         id: c.id,
      //         branchFrag: c.branchFrag,
      //         branchOriginFrag: c.branchOriginFrag,
      //         originFrag: c.originFrag,
      //         rootFrag: c.rootFrag
      //     }
      // }))

      await this.fragmentModel.deleteMany({
        originFrag: targetFrag.rootFrag
      });
      await this.fragmentModel.deleteMany({
        id: id
      });
    }
  },

  tagGarbage: async function(id) {
    if (uuidValidate(id)) {
      const targetFrag = await this.fragmentModel.getFragmentById(id);
      if (targetFrag.rootFrag) {
        await this.fragmentModel.updateMultipleFragments({
          originFrag: targetFrag.rootFrag
        }, {
          garbageTag: 1
        });
      }

      await this.fragmentModel.updateMultipleFragments({
        id: id
      }, {
        garbageTag: 1
      });
    }
  },

  // frag support fragId or frag object
  copyFragUntilPath: async function(frag, dfobOptions = { dfobTable: [], keepArray: false, tableDepth: Infinity }, relativHistoryTable = [], callerFrag = undefined, tableDepthHistory = 0) {
    if (!frag) {
      throw new Error('frag have to be set');
    }
    const isObjectFrag = frag instanceof this.fragmentModel.model;
    const model = this.fragmentModel.model;
    const fragToCopy = isObjectFrag ? frag : await this.fragmentModel.getFragmentById(frag);

    // Extract options
    const dfobTable = dfobOptions.dfobTable || [];
    const keepArray = dfobOptions.keepArray || false;
    const tableDepth = dfobOptions.tableDepth || Infinity;

    if (fragToCopy.branchFrag) {
      const newFrag = new model({
        id: undefined,
        data: fragToCopy.data,
        // rootfrag should be undefind if caller but not in real life :-(
        rootFrag: fragToCopy.rootFrag && !callerFrag ? uuidv4() : undefined,
        originFrag: callerFrag ? callerFrag.originFrag || callerFrag.rootFrag : undefined,
        branchFrag: fragToCopy.branchFrag ? uuidv4() : undefined,
        maxIndex: fragToCopy.maxIndex,
        index: fragToCopy.index,
        branchOriginFrag: callerFrag ? callerFrag.branchFrag : undefined,
        garbageProcess: false
      });
      await this.fragmentModel.insertFragment(newFrag);

      // console.log('__________');
      // console.log('_____fragToCopy_____', fragToCopy);
      // console.log('_____callerFrag_____', callerFrag);
      // console.log('_____newFrag_____', newFrag);


      const fragleaves = await this.fragmentModel.searchFragmentByField({ branchOriginFrag: fragToCopy.branchFrag });
      const arrayOut = [];
      let fragmentSelected = [];


      for (const record of fragleaves) {
        const processedData = await this.copyFragUntilPath(record.id, dfobOptions, relativHistoryTable, newFrag, tableDepthHistory + 1);
        arrayOut.push(processedData.data);
        fragmentSelected = fragmentSelected.concat(processedData.dfobFragmentSelected);
      }
      if (keepArray && dfobTable.length == 0) {
        fragmentSelected = [{
          frag: newFrag,
          // relativHistoryTable is [] cause by copyDataUntilPath call or dafault.
          relativHistoryTableSelected: relativHistoryTable,
          relativDfobTable: [],
          tableDepth: tableDepth - tableDepthHistory
        }];
      }
      if (tableDepthHistory == tableDepth && dfobTable.length == 0) {
        fragmentSelected = [{
          frag: newFrag,
          relativHistoryTableSelected: [],
          relativDfobTable: [],
          tableDepth: tableDepth - tableDepthHistory
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
      };

      const newFrag = new model(newFragRaw);
      const processedData = await this.copyDataUntilPath(newFrag.data, dfobOptions, relativHistoryTable, newFrag);
      newFrag.data = processedData.data;
      await this.fragmentModel.insertFragment(newFrag);
      // await this.displayFragTree(newFrag.id)
      // await new Promise(resolve => setTimeout(resolve, 100));
      const isDfobFragmentSelected = processedData.dfobFragmentSelected && processedData.dfobFragmentSelected.length > 0;

      return {
        data: processedData.data,
        // if no processedData.dfobFragmentSelected but algo is here, that means this step create fragment
        dfobFragmentSelected: isDfobFragmentSelected ? processedData.dfobFragmentSelected : [{
          frag: newFrag,
          relativHistoryTableSelected: processedData.relativHistoryTableSelected,
          relativDfobTable: dfobTable,
          tableDepth: tableDepth - tableDepthHistory
        }],
        rootFrag: newFrag.rootFrag,
        newFrag: newFrag
      };
    }
  },

  copyDataUntilPath: async function(data, dfobOptions = { dfobTable: [], keepArray: false }, relativHistoryTable = [], callerFrag) {
    // Extract options
    const dfobTable = dfobOptions.dfobTable || [];
    const keepArray = dfobOptions.keepArray || false;

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
    } else if (isLiteral(data)) {
      return {
        data: processLiteral(data),
        relativHistoryTable
      };
    } else if (data instanceof Object) {
      if (Array.isArray(data)) {
        const arrayDefrag = [];
        let fragmentSelected = [];
        let relativHistoryTableSelected = [];
        for (const item of data) {
          const processedData = await this.copyDataUntilPath(item, dfobOptions, relativHistoryTable);
          const itemDefrag = processedData.data;
          arrayDefrag.push(itemDefrag);
          if(dfobTable.length > 0 && processedData.dfobFragmentSelected) {
            fragmentSelected = fragmentSelected.concat(processedData.dfobFragmentSelected);
          }
          relativHistoryTableSelected = processedData.relativHistoryTableSelected?.length > relativHistoryTableSelected ? processedData.relativHistoryTableSelected : relativHistoryTableSelected;
        }
        return {
          data: arrayDefrag,
          relativHistoryTableSelected: relativHistoryTableSelected,
          dfobFragmentSelected: fragmentSelected
        };
      } else {
        let relativHistoryTableCopy = [...relativHistoryTable];
        let fragmentSelected = [];
        let relativHistoryTableSelected = [];
        for (const key in data) {
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
            const newDfobOptions = { dfobTable: dfobTableCopy, keepArray };
            const persitedFrag = await this.copyFragUntilPath(data[key]._frag, newDfobOptions, [], callerFrag);

            data[key] = {
              _frag: persitedFrag.newFrag.id.toString()
            };
            if (dfobTableCurrent.length > 0) {
              if (persitedFrag.dfobFragmentSelected) {
                fragmentSelected = fragmentSelected.concat(persitedFrag.dfobFragmentSelected);
              }
            }
          } else {
            const newDfobOptions = { dfobTable: dfobTableCopy, keepArray };
            const processedData = await this.copyDataUntilPath(data[key], newDfobOptions, relativHistoryTableCopy, callerFrag);
            data[key] = processedData.data;
            if (processedData.dfobFragmentSelected) {
              // console.log('____processedData.dfobFragmentSelected', key, data[key], processedData.dfobFragmentSelected)
              fragmentSelected = fragmentSelected.concat(processedData.dfobFragmentSelected);
            }
            if (processedData?.relativHistoryTableSelected?.length > relativHistoryTableSelected.length) {
              relativHistoryTableSelected = processedData.relativHistoryTableSelected;
              relativHistoryTableCopy = relativHistoryTableSelected;
            } else {
              relativHistoryTableSelected = relativHistoryTableCopy;
            }
          }

          // console.log('_____ data_____', data)
        }
        // console.log('____fragmentSelected in copyDataUntilPath', fragmentSelected)
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
  },

  displayFragTree: async function(id, depth = 0, key) {
    const frag = await this.fragmentModel.getFragmentById(id);
    const indent = ' '.repeat(depth * 4);
    if (frag.branchFrag) {
      const children = await this.fragmentModel.searchFragmentByField({
        branchOriginFrag: frag.branchFrag
      });
      for (const index in children) {
        // console.log(`${indent} ${child.id}`);
        await this.displayFragTree(children[index].id, depth + 1, index);
      }
    } else {
      // console.log('frag',frag)
      await this.displayDataTree(frag.data, depth + 1, key);
    }
  },

  displayDataTree: async function(data, depth = 0, key) {
    const indent = ' '.repeat(depth * 4);
    if (Array.isArray(data)) {
      for (const index in data) {
        await this.displayDataTree(data[index], depth + 1, index);
      }
    } else if (data instanceof Object) {
      for (const key in data) {
        if (data[key]._frag) {
          await this.displayFragTree(data[key]._frag, depth + 1, key);
        } else {
          await this.displayDataTree(data[key], depth + 1, key);
        }
      }
    }
  }
};
