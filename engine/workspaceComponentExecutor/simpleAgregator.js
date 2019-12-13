'use strict';
class SimpleAgregator {
  constructor () {
    this.transform = require('jsonpath-object-transform')
  }
  pull (data, flowData) {
    return new Promise((resolve, reject) => {
      var resultFlow = []
      for (let flow of flowData) {
        if (!Array.isArray(flow.data)) {
          resultFlow.push(flow.data)
        } else {
          for (let record of flow.data) {
            resultFlow.push(record)
          }
        }
      }
      resolve({
        data: resultFlow
      })
    })
  }
}
module.exports = new SimpleAgregator()
