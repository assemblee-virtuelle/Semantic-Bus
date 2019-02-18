module.exports = {

  // -------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------

  restGetJson: require('../workspaceComponent/restGetJson.js'),
  objectTransformer: require('../workspaceComponent/objectTransformer.js'),
  googleGetJson: require('../workspaceComponent/googleGetJson.js'),
  simpleAgregator: require('../workspaceComponent/simpleAgregator.js'),
  googleGeoLocaliser: require('../workspaceComponent/googleGeoLocaliser.js'),
  cacheNosql: require('../workspaceComponent/cacheNosql.js'),
  gouvFrInverseGeo: require('../workspaceComponent/gouvFrInverseGeo.js'),
  restApiGet: require('../workspaceComponent/restApiGet.js'),
  restApiPost: require('../workspaceComponent/restApiPost.js'),
  // xmlToObject: require('./workspaceComponent/xmlToObject.js'),
  framcalcGetCsv: require('../workspaceComponent/framcalcGetCsv.js'),
  gouvFrGeoLocaliser: require('../workspaceComponent/gouvFrGeoLocaliser.js'),
  // gouvFrGeoLocaliserMass: require('./workspaceComponent/gouvFrGeoLocaliserMass.js'),
  joinByField: require('../workspaceComponent/joinByField.js'),
  deeperFocusOpeningBracket: require('../workspaceComponent/deeperFocusOpeningBracket.js'),
  filter: require('../workspaceComponent/filter.js'),
  upload: require('../workspaceComponent/upload.js'),
  scrapper: require('../workspaceComponent/scrapper/scrapper.js'),
  httpGet: require('../workspaceComponent/restGetFile.js'),
  sqlConnector: require('../workspaceComponent/sqlConnecteur.js'),
  mongoConnector: require('../workspaceComponent/MongoDB.js'),
  sparqlRequest: require('../workspaceComponent/sparqlRequest.js'),
  valueMapping: require('../workspaceComponent/valueMapping.js'),
  timer: require('../workspaceComponent/timer.js'),
  queryParamsCreation: require('../workspaceComponent/queryParamsCreation.js'),
  valueFromPath: require('../workspaceComponent/valueFromPath.js'),
  unicity: require('../workspaceComponent/unicity.js'),
  propertiesMatrix: require('../workspaceComponent/propertiesMatrix.js'),
  postConsumer: require('../workspaceComponent/postConsumer.js'),
  keyToArray: require('../workspaceComponent/keyToArray.js'),

  /* some other modules you want */

  // --------------------------------------------------------------------------------
  buildDictionnaryArray: function () {
    var directory = []
    for (var technicalComponent in this) {
      if (technicalComponent != 'initialise' && technicalComponent != 'buildDictionnaryArray') {
        directory.push({
          module: technicalComponent,
          type: this[technicalComponent].type,
          description: this[technicalComponent].description,
          editor: this[technicalComponent].editor,
          graphIcon: this[technicalComponent].graphIcon,
          tags: this[technicalComponent].tags
        })
      }
    }
    return directory
  },

  initialise: function (router, unSafeRouteur, stompClient) {
    this.restApiPost.initialise(unSafeRouteur, stompClient) // NO SECURE CHANGE ROUTER
    this.restApiGet.initialise(unSafeRouteur, stompClient) // NO SECURE CHANGE ROUTER
    this.upload.initialise(router, stompClient)
    this.cacheNosql.initialise(router) // NO SECURE CHANGE ROUTER
  }
}
