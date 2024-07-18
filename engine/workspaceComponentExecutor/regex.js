'use strict';
class Regex {
  constructor () {
    this.objectTransformation = require('../utils/objectTransformationV2.js');
  }
  pull (data, flowData, pullParams) {
    return new Promise((resolve, reject) => {
      try {
        const flowDataPrimary = flowData[0].data;
        console.log('flowDataPrimary',flowDataPrimary);
        if(Array.isArray(flowDataPrimary)){
          throw new Error('input data can not be an array');
        }
        const builtRegex = new RegExp(data.specificData.regex, 'gm')
        let result = [...flowDataPrimary.matchAll(builtRegex)]
        
        result = result.map(r=>r.splice(1));
        // result = result.flat();
        resolve({
          data: result
        })
      } catch (e) {
        reject (e)
      }
    })
  }
}
module.exports = new Regex()
