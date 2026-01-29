'use strict';
const fragment_lib = require('@semantic-bus/core/lib/fragment_lib_scylla.js');
const Loki = require('lokijs');
const db = new Loki('joinByField', {
  verbose: true
});
const sift = require('sift').default;
const PromiseOrchestrator = require('@semantic-bus/core/helpers/promiseOrchestrator.js');
const DfobProcessor = require('@semantic-bus/core/helpers/dfobProcessor.js');
const { isLiteral } = require('@semantic-bus/core/helpers/literalHelpers');
const collections = {};
let cleanupIntervalId = null;

function startCollectionCleanup() {
  // eslint-disable-next-line no-undef
  cleanupIntervalId = setInterval(() => {
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

function stopCollectionCleanup() {
  if (cleanupIntervalId !== null) {
    // eslint-disable-next-line no-undef
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }
}

class JoinByField {
  constructor() {
    // Le constructeur reste vide
  }

  async getPrimaryFlow(data, flowData) {
    const secondaryFlowByConnection = flowData.find(f => f.targetInput === 'second');
    if (secondaryFlowByConnection) {
      const primaryFlow = flowData.find(f => f.componentId !== secondaryFlowByConnection.componentId);
      return primaryFlow;
    } else if (data.specificData.primaryComponentId) {
      const primaryFlow = flowData.find(f => f.componentId === data.specificData.primaryComponentId);
      return primaryFlow;
    } else {
      throw new Error('Primary Flow could not be identified');
    }
  }
  async join(primaryRecord, secondaryFlowData, data) {
    try {
      const filter = {};
      let result = [];
      const valueToJoin = primaryRecord[data.specificData.primaryFlowFKId];
      if (!valueToJoin) {
        result = [];
      } else {
        if (Array.isArray(valueToJoin)) {
          const paramArray = valueToJoin.map(v => [secondaryFlowData, filter, v, data]);
          const promiseOrchestrator = new PromiseOrchestrator();
          result = await promiseOrchestrator.execute(this, this.createFilterAndGetResult, paramArray, {
            beamNb: 10
          }, this.config);
        } else {
          result = this.createFilterAndGetResult(secondaryFlowData, filter, valueToJoin, data);
        }
      }

      // Verify that primaryRecord is an object before assigning property
      if (typeof primaryRecord !== 'object' || primaryRecord === null) {
        primaryRecord = {
          error: `Cannot join: primary record is not an object, it is a ${typeof primaryRecord} (${JSON.stringify(primaryRecord)})`
        };
      } else {
        primaryRecord[data.specificData.primaryFlowFKName] = result;
      }
      return primaryRecord;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  createFilterAndGetResult(secondaryFlowData, filter, valueToJoin, data) {
    // Check if valueToJoin is a literal (string, number, etc.) and secondaryFlowData is an array
    if (!Array.isArray(secondaryFlowData)) {
      return {
        error: `Secondary flow data must be an array, received ${typeof secondaryFlowData}`
      };
    }

    if (typeof valueToJoin !== 'string' && typeof valueToJoin !== 'number' && typeof valueToJoin !== 'boolean') {
      return {
        error: `Join key must be a literal value (string, number, boolean), received ${typeof valueToJoin}`
      };
    }

    filter[data.specificData.secondaryFlowId] = valueToJoin;
    let result = secondaryFlowData.filter(sift(filter));

    if (!data.specificData.multipleJoin === true) {
      result = result[0];
    }
    return result;
  }

  async joinWithLoki(item, collection, data) {
    // console.log('joining with loki', item, collection, data)
    try {
      if (item[data.specificData.primaryFlowFKId] === undefined) {
        item[data.specificData.primaryFlowFKName] = undefined;
        return item;
      } else {
        // if (isLiteral(item[data.specificData.primaryFlowFKId])) {
        const primaryValue = item[data.specificData.primaryFlowFKId];

        if (Array.isArray(primaryValue)) {
          // Handle array of values
          let results = primaryValue.map(value => {
            if (!isLiteral(value)) {
              return { error: 'join can only process literal' };
            } else {
              const filter = {
                [data.specificData.secondaryFlowId]: value
              };
              return collection.find(filter);
            }
          }).flat();
          results = results.map(r => { delete r.$loki; return r; });
          item[data.specificData.primaryFlowFKName] = results;
        } else {
          if (!isLiteral(primaryValue)) {
            item[data.specificData.primaryFlowFKName] = { error: 'join can only process literal' };
          } else {
            const filter = {
              [data.specificData.secondaryFlowId]: primaryValue
            };
            // console.log('filter', filter)
            let results = collection.find(filter);
            // console.log('results', results)
            results = results.map(r => { delete r.$loki; return r; });
            item[data.specificData.primaryFlowFKName] = data.specificData.multipleJoin ? results : results[0];
          }
        }
        return item;
        // } else {
        //   throw (new Error('join can only process literal'))
        // }
      }
    } catch (e) {
      item[data.specificData.primaryFlowFKName] = {
        error: e.message
      };
      return item;
    }
  }

  async joinWithLokiSupportingArray(item, collection, data) {
    if (Array.isArray(item)) {
      const resultArray = [];
      for (let i = 0; i < item.length; i++) {
        resultArray.push(await this.joinWithLoki(item[i], collection, data));
      }
      return resultArray;
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

  async cleanup() {
    stopCollectionCleanup();
  }

  async workWithFragments(data, flowData, pullParams, processId) {
    try {
      const secondaryFlowByConnection = flowData.find(f => f.targetInput === 'second');
      // console.log('____secondaryFlowByConnection', secondaryFlowByConnection)
      let secondaryFlowFragment;
      let primaryFlowFragment;
      let primaryFlowDfob;
      if (secondaryFlowByConnection) {
        secondaryFlowFragment = secondaryFlowByConnection.fragment;
        primaryFlowFragment = flowData.find(f => f.targetInput === undefined)?.fragment;
        primaryFlowDfob = flowData.find(f => f.targetInput === undefined)?.dfob;
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
        collection = db.addCollection(collectionName, { indices: [data.specificData.secondaryFlowId], disableMeta: true });
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

      const rebuildDataRaw = await fragment_lib.getWithResolutionByBranch(primaryFlowFragment.id, {
        pathTable: primaryFlowDfob.dfobTable
      });
      // console.log('rebuilding data', rebuildDataRaw)
      const rebuildData = await DfobProcessor.processDfobFlow(
        rebuildDataRaw,
        { pipeNb: primaryFlowDfob.pipeNb, dfobTable: primaryFlowDfob.dfobTable, keepArray: primaryFlowDfob.keepArray, delayMs: primaryFlowDfob.delayMs || 0 },
        this,
        this.joinWithLokiSupportingArray,
        (item) => {
          return [item, collection, data];
        },
        async () => {
          return true;
        }
      );

      await fragment_lib.persist(rebuildData, undefined, primaryFlowFragment);
      // resolve(rebuildData);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async pull(data, flowData) {
    try {
      const secondaryFlowByConnection = flowData.find(f => f.targetInput === 'second');
      let secondaryFlowData;
      let primaryFlowData;

      if (secondaryFlowByConnection) {
        secondaryFlowData = secondaryFlowByConnection.data;
        primaryFlowData = flowData.find(f => f.targetInput === undefined)?.data;
      } else {
        secondaryFlowData = flowData.filter(sift({
          componentId: data.specificData.secondaryComponentId
        }))[0].data;
        primaryFlowData = flowData.filter(sift({
          componentId: data.specificData.primaryComponentId
        }))[0].data;
      }

      if (!Array.isArray(secondaryFlowData)) {
        return {
          data: {
            error: 'Secondary Flow have to be an array'
          }
        };
      } else if (primaryFlowData === undefined) {
        return {
          data: {
            error: 'Primary Flow is undefined'
          }
        };
      } else if (primaryFlowData.length === 0) {
        return {
          data: []
        };
      } else {
        let forcedArray = false;
        if (!Array.isArray(primaryFlowData)) {
          forcedArray = true;
          primaryFlowData = [primaryFlowData];
        }
        secondaryFlowData = JSON.parse(JSON.stringify(secondaryFlowData));
        const paramArray = primaryFlowData.map(r => {
          return [r, secondaryFlowData, data];
        });

        const promiseOrchestrator = new PromiseOrchestrator();
        const primaryFlowCompleted = await promiseOrchestrator.execute(this, this.join, paramArray, {
          beamNb: 10
        }, this.config);

        if (forcedArray === true) {
          return {
            data: primaryFlowCompleted[0]
          };
        } else {
          return {
            data: primaryFlowCompleted
          };
        }
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

startCollectionCleanup();

module.exports = new JoinByField();
