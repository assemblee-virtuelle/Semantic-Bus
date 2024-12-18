'use strict'

// Move all requires before the class definition
const fragment_lib = require('../../core/lib/fragment_lib_scylla.js');
const DfobProcessor = require('../../core/helpers/dfobProcessor.js');
const sift = require('sift').default;
const Loki = require('lokijs');

const stringReplacer = require('../utils/stringReplacer.js');
const objectTransformation = require('../utils/objectTransformationV2.js');
let collections = {}
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

  async workWithFragments(data, flowData, pullParams, processId) {
    return new Promise(async (resolve, reject) => {
      try {
        // Get the input fragment and dfob
        const inputFragment = flowData[0].fragment;
        const inputDfob = flowData[0].dfob;


        const collectionName = `${processId}-${data._id.toString()}`;
        // console.log('collectionName',collectionName);

        let collection = db.addCollection(collectionName, {disableMeta:true});
        await fragment_lib.getWithResolutionByBranch(inputFragment, {
          deeperFocusActivated: true,
          pathTable: [],
          callBackOnPath: async (item) => {
            delete item['$loki'];
            collection.insert(item);
          }
        });
        // Parse filter string
        let filterString = data.specificData.filterString;
        let filter = JSON.parse(filterString);
        let onlyOneItem = undefined;
        if (collection.count() == 1) {  
          onlyOneItem = collection.findOne();
        }
        let filterResult = objectTransformation.execute(onlyOneItem, pullParams, filter);
        console.log('filterResult',filterResult);
        let resultData = collection.find(filterResult);
        resultData = resultData.map(r=>{delete r['$loki']; return r})
        await fragment_lib.persist(resultData, undefined, inputFragment);
        db.removeCollection(collectionName);
        resolve();
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }
}

module.exports = new Filter()
