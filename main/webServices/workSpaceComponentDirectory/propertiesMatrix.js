"use strict";
module.exports = {
  type: 'Property matrix',
  description: 'Reconstruire des objets à partir de plusieurs propriétés en liste.',
  editor: 'properties-matrix-editor',
  graphIcon: 'Property_matrix.png',
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
        let maxLength=0;
        for(let fieldObject of data.specificData.fields){
          let field=fieldObject.field;
          // console.log(flowData[0].data,field);
          maxLength=Math.max(maxLength,flowData[0].data[field].length);
        }
        // console.log('maxLength',maxLength);
        for(let i=0;i<maxLength;i++){
          let currentOject={};
          for(let fieldObject of data.specificData.fields){
            let field=fieldObject.field;
            currentOject[field]=flowData[0].data[field][i];
          }
          matrixResult.push(currentOject);
        }
        flowData[0].data[data.specificData.attribut]=matrixResult;
      }

      resolve({
        data: flowData[0].data
      });
    })
  }
}
