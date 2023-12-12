'use strict'
class HttpProvider {
  constructor () {
    this.stepNode = false
    this.workspace_component_lib = require('../../core/lib/workspace_component_lib.js')
    this.data2xml = require('data2xml')
    this.dataTraitment = require('../../core/dataTraitmentLibrary/index.js')
    this.json2yaml = require('json2yaml')
  }
  pull (data, flowData, pullParams) {
    return new Promise((resolve, reject) => {
      // console.log('flowData',flowData);
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
