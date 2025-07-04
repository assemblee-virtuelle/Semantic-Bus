'use strict';
class JsEvaluation {
  constructor () {
    this.objectTransformation = require('../utils/objectTransformationV2.js');
  }
  pull (data, flowData, pullParams) {
    return new Promise((resolve, reject) => {
      try {
        var result = []
        // Data on which the code will be used
        let usableData = flowData[0].data
        // JS code to execute
        let jsString = `=${data.specificData.jsString}`
        // console.log('usableData',usableData);
        let jsResult = this.objectTransformation.execute(usableData,pullParams,jsString);

        result = jsResult

        resolve({
          data: result
        })
      } catch (e) {
        reject (e)
      }
    })
  }
}
module.exports = new JsEvaluation()
