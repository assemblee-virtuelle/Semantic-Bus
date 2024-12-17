'use strict';
const config = require('../getConfiguration.js')(); // Loading configuration
const PromiseOrchestrator = require('./promiseOrchestrator.js');
const DfobHelper = require('./dfobHelper.js');
const promiseOrchestrator = new PromiseOrchestrator();

class DfobProcessor {
  static async processDfobFlow(
    rebuildData,
    dfobOptions,
    module,
    method,
    buildParamArrayCallback,
    continueCheckFunction
  ) {
    const { pipeNb, dfobTable, keepArray } = dfobOptions;

    const needDfob = dfobTable.length > 0 || (Array.isArray(rebuildData) && !keepArray);
    // console.log('_____ needDfob',needDfob);
    if (!needDfob) {
      const params = buildParamArrayCallback(rebuildData)
      rebuildData = await method.apply(module, params)
    } else {
      // console.log('_____rebuildData', rebuildData);
      const dfobFlow = DfobHelper.buildDfobFlow(rebuildData, dfobTable, undefined, keepArray);

      // console.log('_____dfobFlow', dfobFlow);
      const paramArray = dfobFlow.map((item) => {
        // console.log('_____ item', item);
        let objectToProcess;
        if (item.key !== undefined) {
          objectToProcess = item.objectToProcess[item.key];
        } else {
          objectToProcess = item.objectToProcess;
        }
        return buildParamArrayCallback(objectToProcess)
      });

      const componentFlowDfob = await promiseOrchestrator.execute(
        module,
        method,
        paramArray,
        {
          beamNb: pipeNb,
          logIteration: true,
          continueCheckFunction: continueCheckFunction
        },
        config
      );

      // console.log('__________componentFlowDfob', componentFlowDfob);

      Object.entries(componentFlowDfob).forEach(([key, value]) => {
        // console.log('__ POST processDfobFlow', key, value);
        try {
          const dfobItem = dfobFlow[key];
          // console.log('__________dfobItem', dfobItem);
          // console.log('__________value', value);
          if ('data' in value) {
            if (dfobItem.key !== undefined) {
              dfobItem.objectToProcess[dfobItem.key] = value.data;
            } else {
              Object.keys(dfobItem.objectToProcess).forEach(k => {
                dfobItem.objectToProcess[k] = undefined;
              });
              Object.assign(dfobItem.objectToProcess, value.data);
            }
          } else if (dfobItem.objectToProcess !== undefined) {
            if (dfobItem.key !== undefined) {
              dfobItem.objectToProcess[dfobItem.key] = value;
            } else {
              // console.log('__________ replace all properties');
              Object.keys(dfobItem.objectToProcess).forEach(k => {
                dfobItem.objectToProcess[k] = undefined;
              });
              Object.assign(dfobItem.objectToProcess, value);
              // console.log('__________ result of replace all properties', dfobItem.objectToProcess);
            }
          }
        } catch (error) {
          console.error('Error processing dfobFlow', error);
        }
      });
    }
    
    return rebuildData;
  }
}

module.exports = DfobProcessor; 