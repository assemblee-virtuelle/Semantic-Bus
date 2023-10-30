'use strict'
class ObjectTransformer {
  constructor() {
    this.objectTransformation = require('../utils/objectTransformation.js');
    this.objectTransformationV2 = require('../utils/objectTransformationV2.js');
    this.config = require('../configuration.js');
  }

  initComponent(entity) {
    // console.log('Object Transformer | initComponent : ',entity);

    if (entity.specificData.transformObject == undefined) {
      entity.specificData.transformObject = {}
    }
    return entity
  }

  jsonTransform(source, jsonTransformPattern, pullParams, options) {
    let out;
    // console.log('config',this.config);
    if(options.version==='v1'||options.version==='default'||options.version===undefined){
      out = this.objectTransformation.executeWithParams(source, pullParams, jsonTransformPattern, options,this.config)
    }else if(options.version==='v2'){
      // console.log('source',source.length);
      out = this.objectTransformationV2.executeWithParams(source, pullParams, jsonTransformPattern, options,this.config)

      if(options.keepSource==true &&  !Array.isArray(out)&&!Array.isArray(source)){
        // console.log('source',source);
        out={...source,...out};
      }
    }
    // let out = this.objectTransformation.executeWithParams(source, pullParams, jsonTransformPattern, options)
    // console.log('out',out);
    if(out['nom du lieux *']&&out['nom du lieux *'].includes('Nuyens')){
      console.log("AFTER transform", out.bf_longitude, typeof out.bf_longitude);
    }
    // console.log(('transformer out',out));
    return out;
  }

  pull(data, flowData, pullParams) {
    // console.log('ObjectTransformer pull',flowData,pullParams);
    return new Promise((resolve, reject) => {
      try {
        if (flowData != undefined) {
          resolve({
            data: this.jsonTransform(flowData[0].data, data.specificData.transformObject, pullParams, {
              evaluationDetail: data.specificData.evaluationDetail,
              version: data.specificData.version,
              keepSource : data.specificData.keepSource
            })
          })
        } else {
          resolve({
            data: this.jsonTransform({}, data.specificData.transformObject, pullParams, {
              evaluationDetail: data.specificData.evaluationDetail,
              version: data.specificData.version,
              keepSource : data.specificData.keepSource
            })
          })
        }
      } catch (e) {
        reject(e);
      }
    })
  }
}
module.exports = new ObjectTransformer()
