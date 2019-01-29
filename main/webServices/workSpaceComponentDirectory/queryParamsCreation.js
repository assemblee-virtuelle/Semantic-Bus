"use strict";
class QueryParamsCreation {
  constructor() {
    this.type= 'Params transform';
    this.description= 'Créer des paramètres de requête dans le flux.';
    this.editor='query-params-creation-editor';
    this.graphIcon='Params_transform.png';
    this.objectTransformation= require('../sharedLibrary/objectTransformation.js');
    this.tags=[
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleUtilitiesComponents'
    ];
  }

  buildQueryParam(previousQueryParam, specificData){
    let stringPattern=JSON.stringify(specificData.queryParamsCreationObject);
    stringPattern = stringPattern.replace(/£./g,'$.')
    let objectPattern = JSON.parse(stringPattern);
    let out= this.objectTransformation.execute(previousQueryParam, objectPattern);
    return out;
  }

  pull(data,flowData) {
    return new Promise((resolve, reject) => {
      resolve({data:flowData[0].data});
    })
  }
}

module.exports = new QueryParamsCreation();
