'use strict';
class KeyToArray {
  transform (source, specificData, pullParams) {
    let out = []
    for (let firstKey in source) {
      let item = { key: firstKey }
      for (let secondKey in source[firstKey]) {
        item[secondKey] = source[firstKey][secondKey]
      }
      out.push(item)
    }
    return out
  }

  pull (data, flowData, pullParams) {
    return new Promise((resolve, reject) => {
      try {
        if (flowData != undefined) {
          resolve({
            data: this.transform(flowData[0].data, data.specificData, pullParams)
          })
        } else {
          resolve({
            data: {}
          })
        }
      } catch (e) {
        reject(e)
      } finally {

      }
    })
  }
}
module.exports = new KeyToArray()
