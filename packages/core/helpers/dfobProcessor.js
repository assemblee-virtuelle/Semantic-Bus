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
    continueCheckFunction,
    flowInDataProperty
  ) {
    const { pipeNb, dfobTable, keepArray, tableDepth, delayMs } = dfobOptions;
    // console.log('__rebuildData', rebuildData)
    // console.log('__dfobOptions', dfobOptions)

    const needDfob = dfobTable.length > 0 || (Array.isArray(rebuildData) && !keepArray);
    // console.log('__needDfob', needDfob)
    if (!needDfob) {
      const params = buildParamArrayCallback(rebuildData);
      rebuildData = await method.apply(module, params);
    } else {
      const dfobFlow = DfobHelper.buildDfobFlow(rebuildData, dfobTable, undefined, keepArray, tableDepth);
      // On filtre les items invalides (chemin inexistant)
      const validDfobFlow = dfobFlow.filter(
        item => item.objectToProcess !== undefined
      );
      const paramArray = validDfobFlow.map((item) => {
        let objectToProcess;
        if (item.key !== undefined) {
          objectToProcess = item.objectToProcess[item.key];
        } else {
          objectToProcess = item.objectToProcess;
        }
        return buildParamArrayCallback(objectToProcess);
      });

      const componentFlowDfob = await promiseOrchestrator.execute(
        module,
        method,
        paramArray,
        {
          beamNb: pipeNb,
          logIteration: true,
          continueCheckFunction: continueCheckFunction,
          delayMs: delayMs || 0
        },
        config
      );

      for (const [index, processedItem] of Object.entries(componentFlowDfob)) {
        // console.log('__index', index)
        // console.log('__processedItem', processedItem)
        const initialItem = validDfobFlow[index];
        // console.log('__initialItem', initialItem)
        const finalValue = flowInDataProperty ? processedItem.data : processedItem;

        if(initialItem.key !== undefined) {
          initialItem.objectToProcess[initialItem.key] = finalValue;
        } else {
          rebuildData = finalValue;
        }
      }

      // Object.entries(componentFlowDfob).forEach(([key, value]) => {
      //   try {
      //     const dfobItem = dfobFlow[key];
      //     // console.log('__dfobItem', dfobItem)
      //     // flowInDataProperty is used to know if the data is in the data property of the object
      //     // dfobItem without
      //     if (flowInDataProperty && 'data' in value) {
      //       if (dfobItem.key !== undefined) {
      //         dfobItem.objectToProcess[dfobItem.key] = value.data;
      //       } else {
      //         Object.keys(dfobItem.objectToProcess).forEach(k => {
      //           dfobItem.objectToProcess[k] = undefined;
      //         });
      //         Object.assign(dfobItem.objectToProcess, value.data);
      //       }
      //     } else if (dfobItem.objectToProcess !== undefined) {
      //       if (dfobItem.key !== undefined) {
      //         dfobItem.objectToProcess[dfobItem.key] = value;
      //       } else {
      //         Object.keys(dfobItem.objectToProcess).forEach(k => {
      //           dfobItem.objectToProcess[k] = undefined;
      //         });
      //         Object.assign(dfobItem.objectToProcess, value);
      //       }
      //     }
      //   } catch (error) {
      //     console.error('Error processing dfobFlow', error);
      //   }
      // });
    }
    // console.log('__rebuildData', rebuildData)

    return rebuildData;
  }
}

module.exports = DfobProcessor;
