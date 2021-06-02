'use strict'
class RestApiPost {
  constructor () {
    this.stepNode = false
    this.workspace_component_lib = require('../../core/lib/workspace_component_lib')
    this.data2xml = require('data2xml')
    this.dataTraitment = require('../../core/dataTraitmentLibrary/index.js')
    this.json2yaml = require('json2yaml')
  }
  pull (data, flowData) {
    return new Promise((resolve, reject) => {
      // console.log('flowData',flowData);
      resolve({data:flowData[0].data})
    })
  }
}

module.exports = new RestApiPost()
