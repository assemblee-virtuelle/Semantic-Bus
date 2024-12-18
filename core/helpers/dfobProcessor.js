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
    if (!needDfob) {
      const params = buildParamArrayCallback(rebuildData)
      rebuildData = await method.apply(module, params)
    } else {
      const dfobFlow = DfobHelper.buildDfobFlow(rebuildData, dfobTable, undefined, keepArray);
      const paramArray = dfobFlow.map((item) => {
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


      Object.entries(componentFlowDfob).forEach(([key, value]) => {
        try {
          const dfobItem = dfobFlow[key];
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
              Object.keys(dfobItem.objectToProcess).forEach(k => {
                dfobItem.objectToProcess[k] = undefined;
              });
              Object.assign(dfobItem.objectToProcess, value);
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