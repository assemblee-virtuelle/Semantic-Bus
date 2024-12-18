'use strict';

const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const { isLiteral, processLiteral, testAllLiteralArray } = require('../helpers/literalHelpers');


module.exports = {
    fragmentModel: require('../models/fragments_model_scylla'),
    PromiseOrchestrator: require('../helpers/promiseOrchestrator.js'),
    ArraySegmentator: require('../helpers/ArraySegmentator.js'),
    ObjectID: require('bson').ObjectID,
    objectSizeOf: require("object-sizeof"),
    isObject: require('isobject'),
    PromiseOrchestrator: require('../helpers/promiseOrchestrator.js'),

    // isLiteral,

    // processLiteral,

    // testAllLiteralArray,

    testFragArray: function (arrayToTest) {
        if (arrayToTest.length <= 100) {
            return false;
        } else if (testAllLiteralArray(arrayToTest)) {
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
        if (isLiteral(data)) {
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
        if (isLiteral(data)) {
            return processLiteral(data);
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
        const result = await this.fragmentModel.persistFragment(arrayFrag);
        return result;
    },
    //call without index not support parallel calls (PromiseOrchestrator for ex)
    addFragToArrayFrag: async function (frag, arrayFrag, index) {
        const model = this.fragmentModel.model;
        let fragObject;
        if (!frag) {
            fragObject = new model()
        } else {
            const isObjectFrag = frag instanceof this.fragmentModel.model;
            fragObject = isObjectFrag ? frag : await this.fragmentModel.getFragmentById(frag);

        }

        fragObject.branchOriginFrag = arrayFrag.branchFrag;
        fragObject.originFrag = arrayFrag.rootFrag || arrayFrag.originFrag;
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
        let index = 1;
        for (let frag of frags) {
            await this.addFragToArrayFrag(frag, newRootFrag, index);
            index++;
        }
        return newRootFrag;
    },


    get: function (id) {
        return new Promise(async (resolve, reject) => {
            const fragmentReturn = await this.fragmentModel.getFragmentById(id);

            if (fragmentReturn.branchFrag) {
                const frags = await this.fragmentModel.searchFragmentByField({
                    branchOriginFrag: fragmentReturn.branchFrag
                }, {
                    index: 'ASC'
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
    getWithResolutionByBranch: async function (frag, options = { pathTable: undefined, deeperFocusActivated: false, callBackOnPath: undefined }) {

        if (!frag) {
            throw new Error('frag have to be set');
        }
        const isObjectFrag = frag instanceof this.fragmentModel.model;
        const fragToResolve = isObjectFrag ? frag : await this.fragmentModel.getFragmentById(frag);

        if (fragToResolve.branchFrag) {
            if (options.callBackOnPath && options.pathTable && options.pathTable.length == 0 && options.deeperFocusActivated) {
                await this.fragmentModel.searchFragmentByField({
                    branchOriginFrag: fragToResolve.branchFrag
                }, undefined, undefined, undefined, async (fragments) => {
                    fragments.forEach(async (fragment) => { 
                        await options.callBackOnPath(fragment.data);
                    });
                });
            } else {
                let children = await this.fragmentModel.searchFragmentByField({
                    branchOriginFrag: fragToResolve.branchFrag
                }, {
                    index: 'ASC'
                });
                const childrenData = [];
                for (let child of children) {
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
            return await this.rebuildFragDataByBranch(fragToResolve.data, options);
        }
    },

    rebuildFragDataByBranch: async function (data, options = { pathTable: undefined, callBackOnPath: undefined, deeperFocusActivated: false }) {
        if (options.callBackOnPath && Array.isArray(options.pathTable) && options.pathTable.length == 0) {
            if (options.deeperFocusActivated) { 
                for (let item of data) {
                    await options.callBackOnPath(item);
                }
            } else {
                await options.callBackOnPath(data);
            }
        }
        else {
            if (data != null && data._frag) {
                if (options.pathTable && options.pathTable.length == 0) {
                    return data;
                } else {
                    return await this.getWithResolutionByBranch(data._frag, options);
                }
            } else if (data == null) {
                return null;
            } else if (isLiteral(data)) {
                return data;
            } else if (data instanceof Object) {
                if (Array.isArray(data)) {
                    let arrayDefrag = [];
                    for (let item of data) {
                        let itemDefrag = await this.rebuildFragDataByBranch(item, options);
                        // itemDefrag = this.replaceMongoNotSupportedKey(itemDefrag, false);
                        arrayDefrag.push(itemDefrag);
                    }
                    return arrayDefrag;
                } else {
                    for (let key in data) {

                        if (options.pathTable) {
                            if (options.pathTable.length > 0) {
                                const firstPath = options.pathTable[0];
                                if (firstPath && firstPath.includes(key)) {
                                    options.pathTable.shift();
                                } else {
                                    options.pathTable = [];
                                    options.callBackOnPath = undefined;
                                }
                            }
                        }
                        const valueOfkey = await this.rebuildFragDataByBranch(data[key], options);
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
        } else if (this.isObject(object) && !isLiteral(object)) {
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
        if (uuidValidate(id)) {
            const targetFrag = await this.fragmentModel.getFragmentById(id);
            await this.fragmentModel.deleteMany({
                originFrag: targetFrag.rootFrag
            });
            await this.fragmentModel.deleteMany({
                id: id
            });
        }
    },

    tagGarbage: async function (id) {
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

            let newFrag = new model(newFragRaw);
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
        } else if (isLiteral(data)) {
            return {
                data: processLiteral(data),
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