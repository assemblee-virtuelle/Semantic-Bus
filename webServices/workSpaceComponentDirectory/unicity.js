"use strict";
module.exports = {
  type: 'Unicity',
  description: 'sctructurer les données en vérifiant l\'unicité par champ et répartir les valeurs par source',
  editor: 'unicity-editor',
  graphIcon: 'default.png',
  sift: require('sift'),
  transform: require('jsonpath-object-transform'),
  dotProp: require('dot-prop'),
  tags: [
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleComponentsAgregation'
  ],


  pull: function(data, flowData) {
    //console.log('Flow Agregator | pull : ',data,' | ',flowData);
    return new Promise((resolve, reject) => {
      var resultFlow = [];
      //console.log('TOTAL',flowData.length);




      //for (let flow of flowData) {
      //console.log('stotal',flow.data.length,flow.componentId);
      //console.log('flowData',flowData);
      if (!Array.isArray(flowData[0].data)) {
        reject(new Error('input flow have to be an array'));
      } else {
        for (let record of flowData[0].data) {
          let filter = {
            key: {}
          };
          let source;

          let newValues = {};
          let sourcedData={};
          for (let key in record) {

            console.log(key, data.specificData.source);
            if (key == data.specificData.source) {
              source = record[key];
            }
            let keysInUnicity = [];
            if (data.specificData.unicityFields != undefined) {
              keysInUnicity = this.sift({
                field: key
              }, data.specificData.unicityFields);
            }
            //console.log('keysInUnicity',key,keysInUnicity);
            if (keysInUnicity.length > 0) {
              filter.key[key] = record[key];
            }else{
              sourcedData[key]=[{source:source,value:record[key]}]
            }
            //}

          }

          // for (let key in record) {
          //   sourcedData[key]=[{source:source,value:record[key]}]
          // }
          if (Object.keys(filter.key).length !== 0) {
            let everExistingData = this.sift(filter, resultFlow);
            if (everExistingData.length > 0) {
              console.log('everExistingData', everExistingData);
              for (let key in sourcedData) {
                //console.log('ALLO',key,everExistingData[0].data);
                everExistingData[0].data[key].push(sourcedData[key][0]);
                //console.log('ALLO2');
              }

            } else {
              resultFlow.push({
                key: filter.key,
                data: sourcedData
              })
            }
          } else {
            resultFlow.push({
              key: undefined,
              data: sourcedData
            })
          }


        }
      }

      resolve({
        data: resultFlow
      });
    })
  }
}
