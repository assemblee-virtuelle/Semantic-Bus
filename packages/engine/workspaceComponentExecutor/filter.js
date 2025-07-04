'use strict'

// Move all requires before the class definition
const fragment_lib = require('@semantic-bus/core/lib/fragment_lib_scylla.js');
const DfobProcessor = require('@semantic-bus/core/helpers/dfobProcessor.js');
const sift = require('sift').default;
const Loki = require('lokijs');

const stringReplacer = require('../utils/stringReplacer.js');
const objectTransformation = require('../utils/objectTransformationV2.js');

const db = new Loki('filter', {
  verbose: true
});

class Filter {
  constructor() {
  }



  pull(data, flowData, pullParams) {
    return new Promise((resolve, reject) => {
      try {
        let usableData = flowData[0].data
        if (!Array.isArray(usableData)) {
          throw new Error('input data is not an array')
        }

        let filterString = data.specificData.filterString
        let filter = JSON.parse(filterString)
        let filterResult = objectTransformation.execute(usableData, pullParams, filter);
        var resultData = usableData.filter(sift(filterResult));
        resolve({
          data: resultData
        })
      } catch (e) {
        reject(e)
      } finally {
      }
    })
  }

  async filterRawItems(items , filter, data) {
    // console.log('___filterRawItItems', items, filter, data);
    return new Promise(async (resolve, reject) => {
      try {
        const collectionName = `${data._id.toString()}-${Math.floor(Math.random() * 10000)}`;
        let collection = db.addCollection(collectionName, { disableMeta: true });
        try {
          collection.insert(items)
        } catch (e) {
          throw new Error('Error inserting items into collection for filter');
        }

        let resultFiltered = await this.filter(collection, filter, data);

        if (!Array.isArray(items)) {
          if(resultFiltered.length === 1) {
            resultFiltered = resultFiltered[0]
          } else {
            resultFiltered=undefined;
          }
        }
        // console.log('___resultData', resultFiltered);
        db.removeCollection(collectionName);
        resolve(resultFiltered);
      } catch (e) {
        reject(e)
      }
    })
  }

  async filter(collection  , filter, data) {
    return new Promise(async (resolve, reject) => {
      try {
        let resultData;
        if (filter.hasOwnProperty('$where')) {
          // Check if the filterResult only contains the '$where' property
          if (Object.keys(filter).length === 1) {
            const whereCondition = filter['$where'].replace(/this/g, 'obj');
            resultData = collection.where((obj) => {
              const evaluation =eval(whereCondition)
              // console.log('___evaluation', evaluation);
              return evaluation == true
            });
          } else {
            reject({ error: '$where have to be the only property when it is used' })
          }
        } else {
          resultData = collection.find(filter);
        }
        resultData = resultData.map(r => { delete r['$loki']; return r })
        resolve(resultData);
      } catch (e) {
        reject(e)
      }
    })
  } 

  async workWithFragments(data, flowData, pullParams, processId) {
    // console.log('___workWithFragments', data, flowData, pullParams, processId);
    return new Promise(async (resolve, reject) => {
      try {
        // Get the input fragment and dfob
        const inputFragment = flowData[0].fragment;
        const inputDfob = flowData[0].dfob;
        const pathTable = [...inputDfob.dfobTable];

        // Parse filter string
        let filterString = data.specificData.filterString;
        let filter = JSON.parse(filterString);
        let onlyOneItem = undefined;
        if (! Array.isArray(inputFragment.data) ) {
          onlyOneItem = inputFragment.data;
        }
        //case when onlyOneItem is no clear. when a property have to be compare whith an other.
        let filterResult = objectTransformation.execute(onlyOneItem, pullParams, filter);

        let rebuildData;
        if (inputFragment.branchFrag) {
          const collectionName = `${processId}-${data._id.toString()}`;
          let collection = db.addCollection(collectionName, { disableMeta: true });
          await fragment_lib.getWithResolutionByBranch(inputFragment, {
            deeperFocusActivated: true,
            pathTable: pathTable,
            callBackOnPath: async (item) => {
              // console.log('___item', item);
              delete item['$loki'];
              collection.insert(item);
            }
          });
          rebuildData = await this.filter(collection, filterResult, data);
          db.removeCollection(collectionName);
          // console.log('___out', out);
        } else {
          const inputData = inputFragment.data
          rebuildData = await DfobProcessor.processDfobFlow(
            inputData,
            { pipeNb: inputDfob.pipeNb, dfobTable: inputDfob.dfobTable, keepArray: inputDfob.keepArray, delayMs: inputDfob.delayMs || 0 },
            this,
            this.filterRawItems,
            (items) => {
              return [items, filterResult, data]
            },
            async () => {
              return true;
            }
          )
          // console.log('___rebuildData', rebuildData);
        }


        // resultData = resultData.map(r => { delete r['$loki']; return r })

        await fragment_lib.persist(rebuildData, undefined, inputFragment);
        
        resolve();
      } catch (e) {
        // console.error(e);
        reject(e);
      }
    });
  }
}

module.exports = new Filter()
