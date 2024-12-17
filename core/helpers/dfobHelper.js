'use strict'

class DfobHelper {
  static buildDfobFlowArray(currentFlow, dfobPathTab, key, keepArray) {
    if (Array.isArray(currentFlow)) {
      let flatOut = []
      currentFlow.forEach((f, i) => {
        flatOut = flatOut.concat(this.buildDfobFlowArray(f, dfobPathTab, key, keepArray))
      })
      return flatOut
    } else {
      try {
        const dfobFlow = this.buildDfobFlow(currentFlow, dfobPathTab, key, keepArray);
        return dfobFlow;
      } catch (error) {
        console.error('error', error);
        return undefined;
      }
    }
  }

  static buildDfobFlow(currentFlow, dfobPathTab, key, keepArray) {
    if (dfobPathTab.length > 0) {
      if (Array.isArray(currentFlow)) {
        let currentdFob = dfobPathTab[0]
        let flatOut = []
        currentFlow.forEach((f, i) => {
          flatOut = flatOut.concat(this.buildDfobFlowArray(f, dfobPathTab, currentdFob, keepArray))
        })
        return flatOut
      } else {
        const newDfobPathTab = [...dfobPathTab];
        const currentdFob = newDfobPathTab.shift();
        const propertyExist = currentFlow.hasOwnProperty(currentdFob)
        const flowOfKey = propertyExist ? currentFlow[currentdFob] : undefined;

        if (propertyExist) {
          if (newDfobPathTab.length > 0) {
            return (this.buildDfobFlow(flowOfKey, newDfobPathTab, currentdFob, keepArray))
          } else {
            if (Array.isArray(flowOfKey) && keepArray != true) {
              return (this.buildDfobFlow(flowOfKey, newDfobPathTab, currentdFob, keepArray))
            } else {
              return (this.buildDfobFlow(currentFlow, newDfobPathTab, currentdFob, keepArray))
            }
          }
        } else {
          return {
            objectToProcess: undefined,
          }
        }
      }
    } else {
      let out
      if (Array.isArray(currentFlow) && keepArray != true) {
        out = currentFlow.map((r, i) => {
          return {
            objectToProcess: currentFlow,
            key: i
          }
        })
      } else {
        out = [{
          objectToProcess: currentFlow,
          key: key
        }]
      }
      return out
    }
  }
}

module.exports = DfobHelper 