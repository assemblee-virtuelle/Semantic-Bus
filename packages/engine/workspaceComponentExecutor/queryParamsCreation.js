'use strict';
class QueryParamsCreation {
  constructor () {
    this.objectTransformation = require('../utils/objectTransformationV2.js')
  }

  buildQueryParam (previousQueryParam, specificData) {
    let stringPattern = JSON.stringify(specificData.queryParamsCreationObject)
    stringPattern = stringPattern.replace(/£./g, '$.')
    let objectPattern = JSON.parse(stringPattern)

    // console.log(previousQueryParam,objectPattern);
    let out = this.objectTransformation.executeWithParams(previousQueryParam,{}, objectPattern)

    // console.log('out',out);
    return out
  }

  pull (data, flowData) {
    return new Promise((resolve, reject) => {
      resolve({ data: flowData?.[0].data })
    })
  }
}

module.exports = new QueryParamsCreation()
