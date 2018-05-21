"use strict";
module.exports = {
  type: 'Property Matrix',
  description: 'recontruire des objects à partir de plusieurs propriétés en liste',
  editor: 'property-matrix-editor',
  graphIcon: 'default.png',
  sift: require('sift'),
  transform: require('jsonpath-object-transform'),
  dotProp: require('dot-prop'),
  tags: [
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleQueryingComponents'
  ],


  pull: function(data, flowData) {
    //console.log('Flow Agregator | pull : ',data,' | ',flowData);
    return new Promise((resolve, reject) => {
      let matrixResult = [];
      //console.log('TOTAL',flowData.length);




      //for (let flow of flowData) {
      //console.log('stotal',flow.data.length,flow.componentId);
      //console.log('flowData',flowData);
      if (Array.isArray(flowData[0].data)) {
        reject(new Error('input flow can\'t be an array'));
      } else {
        let maxLength=0
        for(let field of data.specificData.fields){
          maxLength=Math.max(maxLength,flowData[0].data[field]);
        }
        for(let i=0;i<maxLength;i++){
          let currentOject={};
          for(let field of data.specificData.fields){
            currentOject[field]=flowData[0].data[field][i];
          }
          matrixResult.push(currentOject);
        }
        flowData[0].data[data.specificData.attribut]=matrixResult;
      }

      resolve({
        data: flowData[0].data;
      });
    })
  }
}
