'use strict';
class RestGetJson {
  constructor () {
    this.stepNode = false
  }
  pull (data, flowData) {
    return new Promise((resolve, reject) => {
      if (flowData != undefined) {
        resolve({
          data: flowData[0].data
        })
      } else {
        reject(new Error('composant finale : ne peux etre branché comme source'))
      }
    })
  }
}

module.exports = new RestGetJson()
