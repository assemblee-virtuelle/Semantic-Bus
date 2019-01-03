"use strict";
module.exports = {
  type: 'Params transform',
  description: 'Créer des paramètres de requête dans le flux.',
  editor:'query-params-creation-editor',
  graphIcon:'Params_transform.png',
  objectTransformation: require('../sharedLibrary/objectTransformation.js'),
  tags:[
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleUtilitiesComponents'
  ],

  buildQueryParam:function(previousQueryParam, specificData){
    console.log('QUERY INITIAL',previousQueryParam);
    let stringPattern=JSON.stringify(specificData.queryParamsCreationObject);
    //console.log(stringPattern);
    stringPattern = stringPattern.replace(/£./g,'$.')
    let objectPattern = JSON.parse(stringPattern);
    //console.log(previousQueryParam.queryParams,objectPattern);
    let out= this.objectTransformation.execute(previousQueryParam, objectPattern);

    // let out= previousQueryParam.queryParams || {};
    // for (let key in specificData.queryParamsCreationObject){
    //   out[key]=specificData.queryParamsCreationObject[key];
    // }
    console.log('BUILD QUERY PARAM',previousQueryParam,out);
    return out;
  },
  pull: function(data,flowData) {

    return new Promise((resolve, reject) => {
      //console.log('dfob | pull : ',data,' | ',flowData);
      //var dfob = flowData[0].dfob==undefined?[]:flowData.dfob;
      //dfob.push(data.specificData.dfobPath);
      //console.log('Deeper Focus Opening Bracket |  ',dfob);
      resolve({data:flowData[0].data});
    })
  }
}
