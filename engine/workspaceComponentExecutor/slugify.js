const slugify = require('slugify')

'use strict';
class Slugify {
  constructor () {
    this.objectTransformation = require('../utils/objectTransformationV2.js');
  }
  pull (data, flowData, pullParams) {
    return new Promise((resolve, reject) => {
      try {
        const flowDataPrimary = flowData[0].data;
        if(Array.isArray(flowDataPrimary)){
          throw new Error('input data can not be an array');
        }

        console.log('flowDataPrimary',flowDataPrimary)

        resolve({
          data: slugify(flowDataPrimary)
        })
      } catch (e) {
        reject (e)
      }
    })
  }
}
module.exports = new Slugify()
