'use strict';

class DfobHelper {
  // static buildDfobFlowArray(currentFlow, dfobPathTab, key, keepArray) {
  //   if (Array.isArray(currentFlow)) {
  //     let flatOut = []
  //     currentFlow.forEach((f, i) => {
  //       flatOut = flatOut.concat(this.buildDfobFlowArray(f, dfobPathTab, key, keepArray))
  //     })
  //     return flatOut
  //   } else {
  //     try {
  //       const dfobFlow = this.buildDfobFlow(currentFlow, dfobPathTab, key, keepArray);
  //       return dfobFlow;
  //     } catch (error) {
  //       console.error('error', error);
  //       return undefined;
  //     }
  //   }
  // }

  static buildDfobFlow(currentFlow, dfobPathTab, key, keepArray, tableDepthAsked, tableDepthCurrent, callerFlow) {
    // console.log('__buildDfobFlow', key,dfobPathTab)
    if (Array.isArray(currentFlow)) {
      let tableDepthNext;
      // console.log('__tableDepthAsked', tableDepthAsked)
      // console.log('__tableDepthCurrent', tableDepthCurrent)
      if (tableDepthAsked != undefined) {
        if (tableDepthCurrent != undefined) {
          tableDepthNext = tableDepthCurrent - 1;
        } else {
          tableDepthNext = tableDepthAsked - 1;
        }
      }
      // console.log('__tableDepthNext', tableDepthNext)
      if (
        dfobPathTab.length <= 0 &&
          (
            (tableDepthAsked == undefined && keepArray) ||
            (tableDepthAsked != undefined && tableDepthNext < 0)
          )
      ) {
        // if (keepArray == true) {
        return [{
          objectToProcess: callerFlow || currentFlow,
          key: key
        }];
        // }else{
        //   return currentFlow.map((r, i) => {
        //     return {
        //       objectToProcess: currentFlow,
        //       key: i
        //     }
        //   })
        // }
      } else {
        const currentdFob = dfobPathTab[0];
        let flatOut = [];

        currentFlow.forEach((f, i) => {
          flatOut = flatOut.concat(this.buildDfobFlow(f, dfobPathTab, i, keepArray, tableDepthAsked, tableDepthNext, currentFlow));
        });

        return flatOut;
      }
    } else {
      if (dfobPathTab.length <= 0) {
        return [{
          objectToProcess: callerFlow || currentFlow,
          key: key
        }];
      } else {
        const newDfobPathTab = [...dfobPathTab];
        const currentdFob = newDfobPathTab.shift();
        const propertyExist = currentFlow.hasOwnProperty(currentdFob);
        const flowOfKey = propertyExist ? currentFlow[currentdFob] : undefined;

        if (propertyExist) {
          if (newDfobPathTab.length > 0) {
            return (this.buildDfobFlow(flowOfKey, newDfobPathTab, currentdFob, keepArray, tableDepthAsked, undefined, currentFlow));
          } else {
            if (Array.isArray(flowOfKey) && keepArray != true) {
              return (this.buildDfobFlow(flowOfKey, newDfobPathTab, currentdFob, keepArray, tableDepthAsked, undefined, currentFlow));
            } else {
              return (this.buildDfobFlow(currentFlow, newDfobPathTab, currentdFob, keepArray, tableDepthAsked, undefined, currentFlow ));
            }
          }
        } else {
          return {
            objectToProcess: undefined
          };
        }
      }
    }
  }
}

module.exports = DfobHelper;
