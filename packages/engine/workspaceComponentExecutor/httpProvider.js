'use strict'
class HttpProvider {
  constructor () {
    this.stepNode = false
    this.workspace_component_lib = require('@semantic-bus/core/lib/workspace_component_lib')
    this.data2xml = require('data2xml')
    this.dataTraitment = require('@semantic-bus/core/dataTraitmentLibrary/index.js')
  }
  pull (data, flowData, pullParams) {
    return new Promise((resolve, reject) => {
      // console.log('__flowData',flowData[0].data);
      if(flowData && flowData[0]){
        resolve({data:flowData[0].data})
      } else if (pullParams) {
        resolve({data:pullParams})
      } else {
        reject(new Error('Neither flowData nor pullParams'))
      }

    })
  }
}

module.exports = new HttpProvider()
