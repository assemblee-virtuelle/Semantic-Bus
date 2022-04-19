module.exports = {

  // -------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------

  restGetJson: require('../workspaceComponentInitialize/restGetJson.js'),
  objectTransformer: require('../workspaceComponentInitialize/objectTransformer.js'),
  googleGetJson: require('../workspaceComponentInitialize/googleGetJson.js'),
  simpleAgregator: require('../workspaceComponentInitialize/simpleAgregator.js'),
  googleGeoLocaliser: require('../workspaceComponentInitialize/googleGeoLocaliser.js'),
  cacheNosql: require('../workspaceComponentInitialize/cacheNosql.js'),
  gouvFrInverseGeo: require('../workspaceComponentInitialize/gouvFrInverseGeo.js'),
  restApiGet: require('../workspaceComponentInitialize/restApiGet.js'),
  restApiPost: require('../workspaceComponentInitialize/restApiPost.js'),
  // xmlToObject: require('./workspaceComponentInitialize/xmlToObject.js'),
  framcalcGetCsv: require('../workspaceComponentInitialize/framcalcGetCsv.js'),
  gouvFrGeoLocaliser: require('../workspaceComponentInitialize/gouvFrGeoLocaliser.js'),
  // gouvFrGeoLocaliserMass: require('./workspaceComponentInitialize/gouvFrGeoLocaliserMass.js'),
  joinByField: require('../workspaceComponentInitialize/joinByField.js'),
  deeperFocusOpeningBracket: require('../workspaceComponentInitialize/deeperFocusOpeningBracket.js'),
  filter: require('../workspaceComponentInitialize/filter.js'),
  upload: require('../workspaceComponentInitialize/upload.js'),
  scrapper: require('../workspaceComponentInitialize/scrapper.js'),
  httpGet: require('../workspaceComponentInitialize/restGetFile.js'),
  sqlConnector: require('../workspaceComponentInitialize/sqlConnecteur.js'),
  mongoConnector: require('../workspaceComponentInitialize/MongoDB.js'),
  sparqlRequest: require('../workspaceComponentInitialize/sparqlRequest.js'),
  valueMapping: require('../workspaceComponentInitialize/valueMapping.js'),
  timer: require('../workspaceComponentInitialize/timer.js'),
  queryParamsCreation: require('../workspaceComponentInitialize/queryParamsCreation.js'),
  valueFromPath: require('../workspaceComponentInitialize/valueFromPath.js'),
  unicity: require('../workspaceComponentInitialize/unicity.js'),
  propertiesMatrix: require('../workspaceComponentInitialize/propertiesMatrix.js'),
  postConsumer: require('../workspaceComponentInitialize/postConsumer.js'),
  keyToArray: require('../workspaceComponentInitialize/keyToArray.js'),
  sftpConsumer: require('../workspaceComponentInitialize/sftpConsumer.js'),

  /* some other modules you want */

  // --------------------------------------------------------------------------------
  buildDictionnaryArray: function () {
    var directory = []
    for (var technicalComponent in this) {
      if (technicalComponent != 'initialise' && technicalComponent != 'buildDictionnaryArray' && this[technicalComponent].tags!=undefined) {
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

  initialise: function (router, unSafeRouteur) {
    this.restApiPost.initialise(unSafeRouteur) // NO SECURE CHANGE ROUTER
    this.restApiGet.initialise(unSafeRouteur) // NO SECURE CHANGE ROUTER
    this.upload.initialise(router)
    this.cacheNosql.initialise(router) // NO SECURE CHANGE ROUTER
  }
}
