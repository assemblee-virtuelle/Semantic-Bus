'use strict';

const objectTransformation = require('../utils/objectTransformationV2.js');
const fragment_lib = require('@semantic-bus/core/lib/fragment_lib_scylla.js');
const DfobProcessor = require('@semantic-bus/core/helpers/dfobProcessor.js');
const Loki = require('lokijs');

const db = new Loki('arraySplitByCondition', {
    verbose: true
});

class ArraySplitByCondition {
    constructor() {
    }

    pull(data, flowData, pullParams) {
        return new Promise(async (resolve, reject) => {
            try {
                let usableData = flowData[0].data;

                if (!Array.isArray(usableData)) {
                    throw new Error('input data is not an array');
                }

                if (!data.specificData.conditionString) {
                    throw new Error('condition is required');
                }

                // Parse the condition string (like filter does)
                let conditionFilter = JSON.parse(data.specificData.conditionString);

                // Transform the filter with pullParams to resolve dynamic references (like filter does)
                let filterResult = objectTransformation.execute(usableData, pullParams, conditionFilter);

                // Use splitRawItems with Loki
                const collectionName = `${data._id.toString()}-${Math.floor(Math.random() * 10000)}`;
                const result = await this.splitRawItems(usableData, filterResult, data, collectionName);

                resolve({
                    data: result
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async filterWithLoki(collection, filter, data) {
        return new Promise(async (resolve, reject) => {
            try {
                let resultData;
                if (filter.hasOwnProperty('$where')) {
                    // Check if the filter only contains the '$where' property
                    if (Object.keys(filter).length === 1) {
                        const whereCondition = filter['$where'].replace(/this/g, 'obj');
                        resultData = collection.where((obj) => {
                            const evaluation = eval(whereCondition);
                            return evaluation == true;
                        });
                    } else {
                        reject({ error: '$where have to be the only property when it is used' });
                    }
                } else {
                    resultData = collection.find(filter);
                }
                resolve(resultData);
            } catch (e) {
                reject(e);
            }
        });
    }

    async splitFromLokiCollection(collection, filterResult, data) {
        return new Promise(async (resolve, reject) => {
            try {
                // Use Loki to find items matching the condition
                let matchedItems = await this.filterWithLoki(collection, filterResult, data);

                // Extract the original indexes
                const splitIndexes = matchedItems.map(item => item.__originalIndex).sort((a, b) => a - b);

                // Split the array based on these indexes using Loki queries
                // Each sub-array STARTS with an element that matches the condition
                const result = [];

                for (let i = 0; i < splitIndexes.length; i++) {
                    const startIndex = splitIndexes[i];
                    const endIndex = i < splitIndexes.length - 1 ? splitIndexes[i + 1] : undefined;

                    if (endIndex !== undefined) {
                        // Sub-array from splitIndex (inclusive) to next splitIndex (exclusive)
                        const subArray = collection.chain()
                            .find({
                                $and: [
                                    { __originalIndex: { $gte: startIndex } },
                                    { __originalIndex: { $lt: endIndex } }
                                ]
                            })
                            .simplesort('__originalIndex')
                            .data()
                            .map(item => {
                                const cleanItem = { ...item };
                                delete cleanItem.__originalIndex;
                                delete cleanItem.$loki;
                                return cleanItem;
                            });
                        result.push(subArray);
                    } else {
                        // Last sub-array from last splitIndex to end
                        const lastSubArray = collection.chain()
                            .find({ __originalIndex: { $gte: startIndex } })
                            .simplesort('__originalIndex')
                            .data()
                            .map(item => {
                                const cleanItem = { ...item };
                                delete cleanItem.__originalIndex;
                                delete cleanItem.$loki;
                                return cleanItem;
                            });
                        if (lastSubArray.length > 0) {
                            result.push(lastSubArray);
                        }
                    }
                }

                resolve(result);
            } catch (e) {
                reject(e);
            }
        });
    }

    async splitRawItems(items, filterResult, data, collectionName) {
        return new Promise(async (resolve, reject) => {
            if (items._frag) {
                return resolve(items);
            } else {
                try {
                    // console.log('___items', items);
                    if (!Array.isArray(items)) {
                        throw new Error('input data is not an array');
                    }

                    // Create a Loki collection with the items indexed
                    let collection = db.addCollection(collectionName, { disableMeta: true });

                    // Insert items with their original index
                    for (let i = 0; i < items.length; i++) {
                        const itemWithIndex = { ...items[i], __originalIndex: i };
                        collection.insert(itemWithIndex);
                    }

                    // Use the new method to split from Loki collection
                    const result = await this.splitFromLokiCollection(collection, filterResult, data);

                    // Clean up the collection
                    db.removeCollection(collectionName);

                    resolve(result);
                } catch (e) {
                    resolve({ error: e.message });
                    // reject(e);
                }
            }
        });
    }

    async workWithFragments(data, flowData, pullParams, processId) {
        return new Promise(async (resolve, reject) => {
            try {
                // Get the input fragment and dfob
                const inputFragment = flowData[0].fragment;
                const inputDfob = flowData[0].dfob;

                const { pipeNb, dfobTable, keepArray, tableDepth, delayMs } = inputDfob;

                // Parse condition string
                let conditionString = data.specificData.conditionString;
                let condition = JSON.parse(conditionString);
                let onlyOneItem = undefined;
                if (!Array.isArray(inputFragment.data)) {
                    onlyOneItem = inputFragment.data;
                }

                // Transform the condition with pullParams
                let filterResult = objectTransformation.execute(onlyOneItem, pullParams, condition);

                let rebuildData;
                const collectionName = `${processId}-${data._id.toString()}`;

                if (inputFragment.branchFrag) {
                    // Create Loki collection and feed it directly from getWithResolutionByBranch
                    let collection = db.addCollection(collectionName, { disableMeta: true });

                    await fragment_lib.getWithResolutionByBranch(inputFragment, {
                        deeperFocusActivated: true,
                        pathTable: [...inputDfob.dfobTable],
                        callBackOnPath: async (item, index) => {
                            // console.log('___item', item.index);
                            if (item !== undefined && item !== null) {
                                const itemWithIndex = { ...item, __originalIndex: index };
                                collection.insert(itemWithIndex);
                            }
                        }
                    });

                    // Use the new method to split directly from Loki collection
                    rebuildData = await this.splitFromLokiCollection(collection, filterResult, data);

                    // Clean up the collection
                    db.removeCollection(collectionName);
                } else {
                    const inputData = inputFragment.data;
                    rebuildData = await DfobProcessor.processDfobFlow(
                        inputData,
                        {
                            pipeNb: inputDfob.pipeNb,
                            dfobTable: inputDfob.dfobTable,
                            keepArray: inputDfob.keepArray,
                            tableDepth: tableDepth,
                            delayMs: inputDfob.delayMs || 0
                        },
                        this,
                        this.splitRawItems,
                        (items) => {
                            return [items, filterResult, data, `${collectionName}-${Math.floor(Math.random() * 10000)}`];
                        },
                        async () => {
                            return true;
                        }
                    );
                }

                await fragment_lib.persist(rebuildData, undefined, inputFragment);

                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }
}

module.exports = new ArraySplitByCondition();

