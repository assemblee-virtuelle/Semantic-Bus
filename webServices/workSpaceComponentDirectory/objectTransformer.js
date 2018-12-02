"use strict";
module.exports = {
  type: 'Transform',
  description: 'Transformer un objet par mapping grâce à un objet transformation.',
  editor: 'object-transformer',
  graphIcon: 'Transform.png',
  //transform: require('jsonpath-object-transform'),
  objectTransformation: require('../sharedLibrary/objectTransformation.js'),
  tags: [
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleQueryingComponents'
  ],


  initComponent: function(entity) {
    //console.log('Object Transformer | initComponent : ',entity);

    if (entity.specificData.transformObject == undefined) {
      entity.specificData.transformObject = {};
    }
    return entity;
  },
  jsonTransform: function(source, jsonTransformPattern) {
    return this.objectTransformation.execute(source, jsonTransformPattern);
  },
  pull: function(data, flowData) {
    //console.log('Object Transformer | pull : ',data,' | ',flowData[0].data);
    //console.log('XXXXXXXXXXXXXXXXXXXX',encodeURI(data.specificData.transformObject.desc));
    return new Promise((resolve, reject) => {
      if (flowData != undefined) {
        resolve({
          data: this.jsonTransform(flowData[0].data, data.specificData.transformObject)
        });
      } else {
        resolve({
          data: this.jsonTransform({}, data.specificData.transformObject)
        });
      }
    })
  }
}
