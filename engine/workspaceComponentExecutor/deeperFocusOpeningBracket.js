'use strict';
class DeeperFocusOpeningBracket {
  pull (data, flowData) {
    return new Promise((resolve, reject) => {
      const dfob = flowData[0].dfob == undefined ? [] : flowData.dfob
      let dfobPath = data.specificData.dfobPath == undefined ? '' : data.specificData.dfobPath
      dfob.push({ path: dfobPath, keepArray: data.specificData.keepArray })
      resolve({ data: flowData[0].data, dfob: dfob })
    })
  }
}
module.exports = new DeeperFocusOpeningBracket()
