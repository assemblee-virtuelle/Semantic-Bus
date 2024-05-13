module.exports = {

  // -------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------

  objectTransformer: require('../workspaceComponentInitialize/objectTransformer.js'),
  googleGetJson: require('../workspaceComponentInitialize/googleGetJson.js'),
  simpleAgregator: require('../workspaceComponentInitialize/simpleAgregator.js'),
  googleGeoLocaliser: require('../workspaceComponentInitialize/googleGeoLocaliser.js'),
  cacheNosql: require('../workspaceComponentInitialize/cacheNosql.js'),
  gouvFrInverseGeo: require('../workspaceComponentInitialize/gouvFrInverseGeo.js'),
  restApiGet: require('../workspaceComponentInitialize/restApiPost.js'),
  restApiPost: require('../workspaceComponentInitialize/restApiPost.js'),
  httpProvider: require('../workspaceComponentInitialize/httpProvider.js'),
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
  httpConsumerFile: require('../workspaceComponentInitialize/httpConsumerFile.js'),
  sqlConnector: require('../workspaceComponentInitialize/sqlConnecteur.js'),
  mongoConnector: require('../workspaceComponentInitialize/MongoDB.js'),
  influxdbConnector: require('../workspaceComponentInitialize/influxdb.js'),
  sparqlRequest: require('../workspaceComponentInitialize/sparqlRequest.js'),
  valueMapping: require('../workspaceComponentInitialize/valueMapping.js'),
  timer: require('../workspaceComponentInitialize/timer.js'),
  queryParamsCreation: require('../workspaceComponentInitialize/queryParamsCreation.js'),
  valueFromPath: require('../workspaceComponentInitialize/valueFromPath.js'),
  unicity: require('../workspaceComponentInitialize/unicity.js'),
  propertiesMatrix: require('../workspaceComponentInitialize/propertiesMatrix.js'),
  postConsumer: require('../workspaceComponentInitialize/postConsumer.js'),
  httpConsumer: require('../workspaceComponentInitialize/httpConsumer.js'),
  restGetJson: require('../workspaceComponentInitialize/restGetJson.js'),
  keyToArray: require('../workspaceComponentInitialize/keyToArray.js'),
  sftpConsumer: require('../workspaceComponentInitialize/sftpConsumer.js'),
  flat: require('../workspaceComponentInitialize/flat.js'),
  jsEvaluation: require('../workspaceComponentInitialize/jsEvaluation.js'),
  slugify: require('../workspaceComponentInitialize/slugify.js'),
  regex: require('../workspaceComponentInitialize/regex.js'),
  slice: require('../workspaceComponentInitialize/slice.js'),
  incrementTable: require('../workspaceComponentInitialize/incrementTable.js'),
  jsonLdConversion: require('../workspaceComponentInitialize/jsonld-conversion.js'),
  // ---ENDOFPART---

  /* some other modules you want */

  // --------------------------------------------------------------------------------
  buildDictionnaryArray: function () {
    var directory = []
    for (var technicalComponent in this) {
      if (technicalComponent != 'initialise' && technicalComponent != 'buildDictionnaryArray' && this[technicalComponent].tags != undefined) {
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

  initialise: function (router, unSafeRouteur,engineTracer) {
    // console.log('initialise')
    // this.restApiPost.initialise(unSafeRouteur,engineTracer) // NO SECURE CHANGE ROUTER
    // this.restApiGet.initialise(unSafeRouteur,engineTracer) // NO SECURE CHANGE ROUTER
    this.httpProvider.initialise(unSafeRouteur,engineTracer)
    this.upload.initialise(router,engineTracer)
    this.cacheNosql.initialise(router,engineTracer) // NO SECURE CHANGE ROUTER
  },

  setAmqp : function (channel){
    // console.log('setAmqp')
    this.httpProvider.setAmqp(channel);
    this.upload.setAmqp(channel)
  }
}
