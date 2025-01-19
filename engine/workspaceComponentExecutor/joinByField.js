'use strict';
const fragment_lib = require('../../core/lib/fragment_lib_scylla.js');
const Loki = require('lokijs');
const db = new Loki('joinByField', {
  verbose: true
});
const sift = require('sift').default;
const PromiseOrchestrator = require('../../core/helpers/promiseOrchestrator.js');
const lo = require('dayjs/locale/lo.js');
const DfobProcessor = require('../../core/helpers/dfobProcessor.js');
const { isLiteral, processLiteral, testAllLiteralArray } = require('../../core/helpers/literalHelpers');
let collections = {}

function startCollectionCleanup() {
  setInterval(() => {
    const hoursAgo = 1; // nombre d'heures
    const oneHourAgo = new Date(Date.now() - hoursAgo * 3600000); // heures en millisecondes
    for (const [name, { createdAt }] of Object.entries(collections)) {
      if (createdAt < oneHourAgo) {
        db.removeCollection(name);
        delete collections[name];
      }
    }
  }, 1000);
}

class JoinByField {
  constructor() {
    // Le constructeur reste vide
  }

  async getPrimaryFlow(data, flowData) {
    let secondaryFlowByConnection = flowData.find(f => f.targetInput == 'second');
    if (secondaryFlowByConnection) {
      let primaryFlow = flowData.find(f => f.componentId != secondaryFlowByConnection.componentId);
      return primaryFlow;
    } else if (data.specificData.primaryComponentId) {
      let primaryFlow = flowData.find(f => f.componentId == data.specificData.primaryComponentId);
      return primaryFlow;
    } else {
      throw new Error('Primary Flow could not be identified');
    }
  }
  join(primaryRecord, secondaryFlowData, data) {
    return new Promise(async (resolve, reject) => {
      try {
        let filter = {};
        let result = [];
        const valueToJoin = primaryRecord[data.specificData.primaryFlowFKId];
        if (!valueToJoin) {
          result = [];
        } else {
          if (Array.isArray(valueToJoin)) {
            let paramArray = valueToJoin.map(v => [secondaryFlowData, filter, v, data]);
            let promiseOrchestrator = new PromiseOrchestrator();
            result = await promiseOrchestrator.execute(this, this.createFilterAndGetResult, paramArray, {
              beamNb: 10
            }, this.config);
          } else {
            result = this.createFilterAndGetResult(secondaryFlowData, filter, valueToJoin, data);
          }
        }

        primaryRecord[data.specificData.primaryFlowFKName] = result;
        resolve(primaryRecord);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  createFilterAndGetResult(secondaryFlowData, filter, valueToJoin, data) {
    filter[data.specificData.secondaryFlowId] = valueToJoin;
    let result = secondaryFlowData.filter(sift(filter));

    if (!data.specificData.multipleJoin == true) {
      result = result[0];
    }
    return result;
  }

  joinWithLoki(item, collection, data) {
    console.log('____item',item);
    console.log('____data',data);
    return new Promise(async (resolve, reject) => {
      try {
        if (item[data.specificData.primaryFlowFKId] == undefined) {
          item[data.specificData.primaryFlowFKName] = undefined;
          resolve(item);
        } else {
          // if (isLiteral(item[data.specificData.primaryFlowFKId])) {
            const primaryValue = item[data.specificData.primaryFlowFKId];
            
            if (Array.isArray(primaryValue)) {
              // Handle array of values
              const results = primaryValue.map(value => {
                if(!isLiteral(value)){
                  return {error: 'join can only process literal'};
                }else{
                  const filter = {
                    [data.specificData.secondaryFlowId]: value
                  };
                  return collection.find(filter);
                }
              }).flat();
              results = results.map(r=>{delete r.$loki; return r})
              item[data.specificData.primaryFlowFKName] = results;
            } else {
              if(!isLiteral(primaryValue)){
                item[data.specificData.primaryFlowFKName]= {error: 'join can only process literal'};
              } else{
                let filter = {
                  [data.specificData.secondaryFlowId]: primaryValue
                };
                let results = collection.find(filter);
                results = results.map(r=>{delete r.$loki; return r})
                item[data.specificData.primaryFlowFKName] = data.specificData.multipleJoin ? results : results[0];
              }
            }
            resolve(item);
          // } else {
          //   throw (new Error('join can only process literal'))
          // }
        }
      } catch (e) {
        item[data.specificData.primaryFlowFKName] = {
          error: e.message
        }
        resolve(item);
      }
    });
  }

  joinWithLokiSupportingArray(item, collection, data,) {
    if (Array.isArray(item)) {
      return item.map(i => this.joinWithLoki(i, collection, data));
    } else {
      return this.joinWithLoki(item, collection, data);
    }
  }

  async endWork(data, processId) {
    // console.log('_data',data)
    const collectionName = `${processId}-${data._id.toString()}`;
    await db.removeCollection(collectionName);
    delete collections[collectionName];
  }

  workWithFragments(data, flowData, pullParams, processId) {
    return new Promise(async (resolve, reject) => {
      try {
        lo
        const secondaryFlowByConnection = flowData.find(f => f.targetInput == 'second');
        let secondaryFlowFragment;
        let primaryFlowFragment;
        let primaryFlowDfob;
        if (secondaryFlowByConnection) {
          secondaryFlowFragment = secondaryFlowByConnection.fragment;
          primaryFlowFragment = flowData.find(f => f.targetInput == undefined)?.fragment;
          primaryFlowDfob = flowData.find(f => f.targetInput == undefined)?.dfob;
        } else {
          secondaryFlowFragment = flowData.filter(sift({
            componentId: data.specificData.secondaryComponentId
          }))[0].fragment;
          primaryFlowFragment = flowData.filter(sift({
            componentId: data.specificData.primaryComponentId
          }))[0].fragment;
          primaryFlowDfob = flowData.filter(sift({
            componentId: data.specificData.primaryComponentId
          }))[0].dfob;
        }

        const collectionName = `${processId}-${data._id.toString()}`;
        let collection = db.getCollection(collectionName);

        if (!collection) {
          collection = db.addCollection(collectionName, { indices: [data.specificData.secondaryFlowId] , disableMeta:true});

          await fragment_lib.getWithResolutionByBranch(secondaryFlowFragment, {
            deeperFocusActivated: true,
            pathTable: [],
            callBackOnPath: async (item) => {
              collection.insert(item);
            }
          });

          collections[collectionName] = {
            createdAt: new Date()
          };
        }

        let rebuildDataRaw = await fragment_lib.getWithResolutionByBranch(primaryFlowFragment.id, {
          pathTable: primaryFlowDfob.dfobTable
        });

        const rebuildData = await DfobProcessor.processDfobFlow(
          rebuildDataRaw,
          { pipeNb: primaryFlowDfob.pipeNb, dfobTable: primaryFlowDfob.dfobTable, keepArray: primaryFlowDfob.keepArray },
          this,
          this.joinWithLokiSupportingArray,
          (item) => {
            return [item, collection, data]
          },
          async () => {
            return true;
          }
        )

        await fragment_lib.persist(rebuildData, undefined, primaryFlowFragment);
        resolve();
        // resolve(rebuildData);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  pull(data, flowData) {
    return new Promise((resolve, reject) => {
      try {
        const secondaryFlowByConnection = flowData.find(f => f.targetInput == 'second');
        let secondaryFlowData;
        let primaryFlowData;

        if (secondaryFlowByConnection) {
          secondaryFlowData = secondaryFlowByConnection.data;
          primaryFlowData = flowData.find(f => f.targetInput == undefined)?.data;
        } else {
          secondaryFlowData = flowData.filter(sift({
            componentId: data.specificData.secondaryComponentId
          }))[0].data;
          primaryFlowData = flowData.filter(sift({
            componentId: data.specificData.primaryComponentId
          }))[0].data;
        }

        if (!Array.isArray(secondaryFlowData)) {
          resolve({
            data: {
              error: 'Secondary Flow have to be an array'
            }
          })
        } else if (primaryFlowData == undefined) {
          resolve({
            data: {
              error: 'Primary Flow is undefined'
            }
          })
        } else if (primaryFlowData.length == 0) {
          resolve({
            data: []
          })
        } else {
          let forcedArray = false;
          if (!Array.isArray(primaryFlowData)) {
            forcedArray = true;
            primaryFlowData = [primaryFlowData];
          }
          secondaryFlowData = JSON.parse(JSON.stringify(secondaryFlowData))
          let paramArray = primaryFlowData.map(r => {
            return [r, secondaryFlowData, data]
          })

          let promiseOrchestrator = new PromiseOrchestrator()
          promiseOrchestrator.execute(this, this.join, paramArray, {
            beamNb: 10
          }, this.config).then(primaryFlowCompleted => {
            if (forcedArray == true) {
              resolve({
                data: primaryFlowCompleted[0]
              })
            } else {
              resolve({
                data: primaryFlowCompleted
              })
            }
          })
        }
      } catch (e) {
        console.error(e);
        reject(e)
      }
    })
  }
}

startCollectionCleanup();

module.exports = new JoinByField()
