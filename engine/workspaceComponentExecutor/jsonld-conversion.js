'use strict';

const jsonld =  require('jsonld')

class JsonLdConversion {
  constructor () {}
  pull (data, flowData, pullParams) {
    const specificData = data.specificData;
    return new Promise(async (resolve, reject) => {
      try {
        let result=flowData[0].data;
        console.log('specificData',specificData)
        if (specificData.configObject){
          result = await jsonld.frame(result, specificData.configObject);
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
module.exports = new JsonLdConversion()
