module.exports = {

  // -------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------

  restGetJson: require('./workSpaceComponentDirectory/restGetJson.js'),
  objectTransformer: require('./workSpaceComponentDirectory/objectTransformer.js'),
  googleGetJson: require('./workSpaceComponentDirectory/googleGetJson.js'),
  simpleAgregator: require('./workSpaceComponentDirectory/simpleAgregator.js'),
  googleGeoLocaliser: require('./workSpaceComponentDirectory/googleGeoLocaliser.js'),
  cacheNosql: require('./workSpaceComponentDirectory/cacheNosql.js'),
  gouvFrInverseGeo: require('./workSpaceComponentDirectory/gouvFrInverseGeo.js'),
  restApiGet: require('./workSpaceComponentDirectory/restApiGet.js'),
  restApiPost: require('./workSpaceComponentDirectory/restApiPost.js'),
  //xmlToObject: require('./workSpaceComponentDirectory/xmlToObject.js'),
  framcalcGetCsv: require('./workSpaceComponentDirectory/framcalcGetCsv.js'),
  gouvFrGeoLocaliser: require('./workSpaceComponentDirectory/gouvFrGeoLocaliser.js'),
  //gouvFrGeoLocaliserMass: require('./workSpaceComponentDirectory/gouvFrGeoLocaliserMass.js'),
  joinByField: require('./workSpaceComponentDirectory/joinByField.js'),
  deeperFocusOpeningBracket: require('./workSpaceComponentDirectory/deeperFocusOpeningBracket.js'),
  filter: require('./workSpaceComponentDirectory/filter.js'),
  upload: require('./workSpaceComponentDirectory/upload.js'),
  scrapper: require('./workSpaceComponentDirectory/scrapper.js'),
  httpGet: require('./workSpaceComponentDirectory/restGetFile.js'),
  sqlConnector: require('./workSpaceComponentDirectory/sqlConnecteur.js'),
  mongoConnector: require('./workSpaceComponentDirectory/MongoDB.js'),
  sparqlRequest: require('./workSpaceComponentDirectory/sparqlRequest.js'),
  valueMapping: require('./workSpaceComponentDirectory/valueMapping.js'),
  timer: require('./workSpaceComponentDirectory/timer.js'),
  queryParamsCreation:require('./workSpaceComponentDirectory/queryParamsCreation.js'),
  valueFromPath:require('./workSpaceComponentDirectory/valueFromPath.js'),
  unicity:require('./workSpaceComponentDirectory/unicity.js'),
  propertiesMatrix:require('./workSpaceComponentDirectory/propertiesMatrix.js'),
  postConsumer: require('./workSpaceComponentDirectory/postConsumer.js'),

  /* some other modules you want */

  // --------------------------------------------------------------------------------
  buildDictionnaryArray: function() {
    var directory = [];
    //console.log(technicalComponentDirectory)
    for (var technicalComponent in this) {
      if (technicalComponent != 'initialise' && technicalComponent != 'buildDictionnaryArray') {
        directory.push({
          module: technicalComponent,
          type: this[technicalComponent].type,
          description: this[technicalComponent].description,
          editor: this[technicalComponent].editor,
          graphIcon: this[technicalComponent].graphIcon,
          tags : this[technicalComponent].tags
        });
      }
    }
    return directory;
  },

  initialise: function (router, unSafeRouteur, stompClient) {
    this.restApiPost.initialise(unSafeRouteur,stompClient); //NO SECURE CHANGE ROUTER
    this.restApiGet.initialise(unSafeRouteur,stompClient); //NO SECURE CHANGE ROUTER
    this.upload.initialise(unSafeRouteur,stompClient);
    this.cacheNosql.initialise(router); //NO SECURE CHANGE ROUTER
  }
}
