"use strict";
module.exports = {
  type: 'QueryParamsCreation',
  description: 'créer des paramètres de requete dand le flux',
  editor:'query-params-creation-editor',
  graphIcon:'default.png',
  tags:[
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleUtilitiesComponents'
  ],

  buildQueryParam:function(previousQueryParam, specificData){

    let out= previousQueryParam || {};
    for (let key in specificData.queryParamsCreationObject){
      out[key]=specificData.queryParamsCreationObject[key];
    }
    //    console.log('BUILD QUERY PARAM',previousQueryParam,out);
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
