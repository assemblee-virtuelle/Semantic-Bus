'use strict';
class QueryParamsCreation {
  constructor () {
    this.objectTransformation = require('../utils/objectTransformationV2.js')
  }

  async buildQueryParam (previousQueryParam, specificData) {
    let stringPattern = JSON.stringify(specificData.queryParamsCreationObject)
    stringPattern = stringPattern.replace(/£./g, '$.')
    let objectPattern = JSON.parse(stringPattern)

    // console.log(previousQueryParam,objectPattern);
    let out = await this.objectTransformation.executeWithParams(previousQueryParam,{}, objectPattern)

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
