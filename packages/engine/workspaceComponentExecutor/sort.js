'use strict'

// Move all requires before the class definition
const fragment_lib = require('@semantic-bus/core/lib/fragment_lib_scylla.js');
const DfobProcessor = require('@semantic-bus/core/helpers/dfobProcessor.js');
const Loki = require('lokijs');

const stringReplacer = require('../utils/stringReplacer.js');
const objectTransformation = require('../utils/objectTransformationV2.js');

const db = new Loki('sort', {
  verbose: true
});

class Sort {
  constructor() {
  }

  pull(data, flowData, pullParams) {
    return new Promise((resolve, reject) => {
      try {
        let usableData = flowData[0].data
        if (!Array.isArray(usableData)) {
          throw new Error('input data is not an array')
        }

        let sortString = data.specificData.sortString;
        let sortConfig = JSON.parse(sortString);
        let sortResult = objectTransformation.execute(usableData, pullParams, sortConfig);
        
        var resultData = this.sortArray(usableData, sortResult);
        resolve({
          data: resultData
        })
      } catch (e) {
        reject(e)
      } finally {
      }
    })
  }

  /**
   * Sort an array using MongoDB-like syntax
   * Example: { "fieldName": 1 } for ascending, { "fieldName": -1 } for descending
   * Multiple fields: { "field1": 1, "field2": -1 }
   */
  sortArray(items, sortConfig) {
    if (!items || items.length === 0) {
      return items;
    }

    const sortFields = Object.keys(sortConfig);
    
    return [...items].sort((a, b) => {
      for (const field of sortFields) {
        const direction = sortConfig[field];
        const valueA = this.getNestedValue(a, field);
        const valueB = this.getNestedValue(b, field);
        
        let comparison = 0;
        
        if (valueA === null || valueA === undefined) {
          comparison = valueB === null || valueB === undefined ? 0 : -1;
        } else if (valueB === null || valueB === undefined) {
          comparison = 1;
        } else if (typeof valueA === 'string' && typeof valueB === 'string') {
          comparison = valueA.localeCompare(valueB);
        } else if (valueA instanceof Date && valueB instanceof Date) {
          comparison = valueA.getTime() - valueB.getTime();
        } else {
          comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        }
        
        if (comparison !== 0) {
          return direction === -1 ? -comparison : comparison;
        }
      }
      return 0;
    });
  }

  /**
   * Get nested value from object using dot notation
   * Example: getNestedValue({a: {b: 1}}, "a.b") returns 1
   */
  getNestedValue(obj, path) {
    if (!obj || !path) return undefined;
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      if (value === null || value === undefined) return undefined;
      value = value[key];
    }
    return value;
  }

  async sortRawItems(items, sortConfig, data) {
    return new Promise(async (resolve, reject) => {
      try {
        const collectionName = `${data._id.toString()}-${Math.floor(Math.random() * 10000)}`;
        let collection = db.addCollection(collectionName, { disableMeta: true });
        try {
          collection.insert(items)
        } catch (e) {
          throw new Error('Error inserting items into collection for sort');
        }

        let resultSorted = await this.sort(collection, sortConfig, data);

        if (!Array.isArray(items)) {
          if(resultSorted.length === 1) {
            resultSorted = resultSorted[0]
          } else {
            resultSorted = undefined;
          }
        }
        db.removeCollection(collectionName);
        resolve(resultSorted);
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * Convert MongoDB-like sort syntax to Loki sort syntax
   * MongoDB: { field: 1 } or { field: -1 }
   * Loki: [['field', false]] (false = ascending) or [['field', true]] (true = descending)
   */
  convertToLokiSort(sortConfig) {
    const lokiSort = [];
    for (const field in sortConfig) {
      const direction = sortConfig[field];
      // Loki uses true for descending, false for ascending
      lokiSort.push([field, direction === -1]);
    }
    return lokiSort;
  }

  async sort(collection, sortConfig, data) {
    return new Promise(async (resolve, reject) => {
      try {
        let resultData;
        const lokiSort = this.convertToLokiSort(sortConfig);
        
        // Use Loki's chain to apply sorting
        resultData = collection.chain()
          .simplesort(lokiSort[0][0], { desc: lokiSort[0][1] })
          .data();

        // If multiple sort fields, use compoundsort
        if (lokiSort.length > 1) {
          resultData = collection.chain()
            .compoundsort(lokiSort)
            .data();
        }

        resultData = resultData.map(r => { delete r['$loki']; return r });
        resolve(resultData);
      } catch (e) {
        reject(e)
      }
    })
  } 

  async workWithFragments(data, flowData, pullParams, processId) {
    return new Promise(async (resolve, reject) => {
      try {
        // Get the input fragment and dfob
        const inputFragment = flowData[0].fragment;
        const inputDfob = flowData[0].dfob;
        const pathTable = [...inputDfob.dfobTable];

        // Parse sort string
        let sortString = data.specificData.sortString;
        let sortConfig = JSON.parse(sortString);
        let onlyOneItem = undefined;
        if (!Array.isArray(inputFragment.data)) {
          onlyOneItem = inputFragment.data;
        }
        // Case when onlyOneItem is not clear - when a property has to be compared with another
        let sortResult = objectTransformation.execute(onlyOneItem, pullParams, sortConfig);

        let rebuildData;
        if (inputFragment.branchFrag) {
          const collectionName = `${processId}-${data._id.toString()}`;
          let collection = db.addCollection(collectionName, { disableMeta: true });
          await fragment_lib.getWithResolutionByBranch(inputFragment, {
            deeperFocusActivated: true,
            pathTable: pathTable,
            callBackOnPath: async (item) => {
              if (item !== undefined && item !== null) {
                delete item['$loki'];
              }
              if (item !== undefined) {
                collection.insert(item);
              }
            }
          });
          rebuildData = await this.sort(collection, sortResult, data);
          db.removeCollection(collectionName);
        } else {
          const inputData = inputFragment.data;
          rebuildData = await DfobProcessor.processDfobFlow(
            inputData,
            { pipeNb: inputDfob.pipeNb, dfobTable: inputDfob.dfobTable, keepArray: inputDfob.keepArray, delayMs: inputDfob.delayMs || 0 },
            this,
            this.sortRawItems,
            (items) => {
              return [items, sortResult, data]
            },
            async () => {
              return true;
            }
          )
        }

        await fragment_lib.persist(rebuildData, undefined, inputFragment);
        
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }
}

module.exports = new Sort()

