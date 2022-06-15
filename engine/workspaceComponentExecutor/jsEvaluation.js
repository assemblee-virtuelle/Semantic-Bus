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
        let jsString = data.specificData.jsString
        let jsResult = this.objectTransformation.execute(usableData,pullParams,jsString);
        if(jsResult === undefined){
          throw new Error(`No result needs to be displayed, does the code start by '=' ?`);
        }
        // Used for tests. When the JS code entered returns a single element
        // Example : =2+2 should return 4
        else if(!Array.isArray(jsResult)){
          console.log('dans le isarray')
          result = [ jsResult ];
        }
        else {
          result = jsResult
        }        
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
