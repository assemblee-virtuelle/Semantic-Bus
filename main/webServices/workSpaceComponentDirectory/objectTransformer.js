"use strict";
class ObjectTransformer{
  constructor(){
    this.type= 'Transform';
    this.description= 'Transformer un objet par mapping grâce à un objet transformation.';
    this.editor= 'object-transformer';
    this.graphIcon= 'Transform.png';
    this.objectTransformation= require('../sharedLibrary/objectTransformation.js');
    this.tags= [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleQueryingComponents'
    ];
  }

  initComponent(entity) {
    //console.log('Object Transformer | initComponent : ',entity);

    if (entity.specificData.transformObject == undefined) {
      entity.specificData.transformObject = {};
    }
    return entity;
  }

  jsonTransform(source, jsonTransformPattern,pullParams) {
    return this.objectTransformation.executeWithParams(source,pullParams, jsonTransformPattern);
  }

  pull(data, flowData,pullParams) {
    return new Promise((resolve, reject) => {
      if (flowData != undefined) {
        resolve({
          data: this.jsonTransform(flowData[0].data, data.specificData.transformObject,pullParams)
        });
      } else {
        resolve({
          data: this.jsonTransform({}, data.specificData.transformObject,pullParams)
        });
      }
    })
  }
}
module.exports= new ObjectTransformer();
