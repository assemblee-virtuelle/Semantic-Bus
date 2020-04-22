'use strict'
class ObjectTransformer {
  constructor () {
    this.objectTransformation = require('../utils/objectTransformation.js')
  }

  initComponent (entity) {
    // console.log('Object Transformer | initComponent : ',entity);

    if (entity.specificData.transformObject == undefined) {
      entity.specificData.transformObject = {}
    }
    return entity
  }

  jsonTransform (source, jsonTransformPattern, pullParams,options) {

    let out =  this.objectTransformation.executeWithParams(source, pullParams, jsonTransformPattern,options)
    return out;
  }

  pull (data, flowData, pullParams) {
    // console.log('ObjectTransformer pull',flowData,pullParams);
    return new Promise((resolve, reject) => {
      try {
        if (flowData != undefined) {
          resolve({
            data: this.jsonTransform(flowData[0].data, data.specificData.transformObject, pullParams,{evaluationDetail:data.specificData.evaluationDetail})
          })
        } else {
          resolve({
            data: this.jsonTransform({}, data.specificData.transformObject, pullParams,{evaluationDetail:data.specificData.evaluationDetail})
          })
        }
      } catch (e) {
        reject(e);
      }
    })
  }
}
module.exports = new ObjectTransformer()
