'use strict';
class PropertiesMatrix {
  constructor () {
    this.transform = require('jsonpath-object-transform')
    this.dotProp = require('dot-prop')
  }

  pull (data, flowData) {
    return new Promise((resolve, reject) => {
      let matrixResult = []

      if (Array.isArray(flowData[0].data)) {
        reject(new Error('input flow can\'t be an array'))
      } else {
        let maxLength = 0
        for (let fieldObject of data.specificData.fields) {
          let field = fieldObject.field
          maxLength = Math.max(maxLength, flowData[0].data[field].length)
        }

        for (let i = 0; i < maxLength; i++) {
          let currentOject = {}
          for (let fieldObject of data.specificData.fields) {
            let field = fieldObject.field
            currentOject[field] = flowData[0].data[field][i]
          }
          matrixResult.push(currentOject)
        }
        flowData[0].data[data.specificData.attribut] = matrixResult
      }
      resolve({
        data: flowData[0].data
      })
    })
  }
}

module.exports = new PropertiesMatrix()
