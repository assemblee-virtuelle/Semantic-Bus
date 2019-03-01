'use strict';
class QueryParamsCreation {
  constructor () {
    this.objectTransformation = require('../utils/objectTransformation.js')
  }

  buildQueryParam (previousQueryParam, specificData) {
    let stringPattern = JSON.stringify(specificData.queryParamsCreationObject)
    stringPattern = stringPattern.replace(/£./g, '$.')
    let objectPattern = JSON.parse(stringPattern)
    let out = this.objectTransformation.execute(previousQueryParam, objectPattern)
    return out
  }

  pull (data, flowData) {
    return new Promise((resolve, reject) => {
      resolve({ data: flowData[0].data })
    })
  }
}

module.exports = new QueryParamsCreation()
