'use strict'

class Upload {
  constructor () {
    this.workspace_component_lib = require('../../core/lib/workspace_component_lib')
    this.busboy = require('busboy')
    this.dataTraitment = require('../../core/dataTraitmentLibrary/index.js')
    this.propertyNormalizer = require('../utils/propertyNormalizer.js')
    this.readable = require('stream').Readable
    this.configuration = require('../configuration.js')
    this.stepNode = false
  }

  pull (data, flowData, pullParams) {
    // console.log('data',data);
    // console.log('upload',pullParams.upload);
    return new Promise((resolve, reject) => {
      resolve({
        data: pullParams.upload
      })
    })
  }
}

module.exports = new Upload()
