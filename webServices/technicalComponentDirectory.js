module.exports = {
   restGetJson : require('./workSpaceComponentDirectory/restGetJson.js'),
   objectTransformer : require('./workSpaceComponentDirectory/objectTransformer.js'),
   googleGetJson : require('./workSpaceComponentDirectory/googleGetJson.js'),
   simpleAgregator : require('./workSpaceComponentDirectory/simpleAgregator.js'),
   googleGeoLocaliser : require('./workSpaceComponentDirectory/googleGeoLocaliser.js'),
   cacheNosql : require('./workSpaceComponentDirectory/cacheNosql.js'),
   gouvFrInverseGeo : require('./workSpaceComponentDirectory/gouvFrInverseGeo.js'),
   restApiGet : require('./workSpaceComponentDirectory/restApiGet.js'),
   xmlToObject : require('./workSpaceComponentDirectory/xmlToObject.js'),
   framcalcGetCsv : require('./workSpaceComponentDirectory/framcalcGetCsv.js'),
   gouvFrGeoLocaliser : require('./workSpaceComponentDirectory/gouvFrGeoLocaliser.js'),
   gouvFrGeoLocaliserMass : require('./workSpaceComponentDirectory/gouvFrGeoLocaliserMass.js'),
   joinByField : require('./workSpaceComponentDirectory/joinByField.js'),
   deeperFocusOpeningBracket : require('./workSpaceComponentDirectory/deeperFocusOpeningBracket.js'),


   /* some other modules you want */
   initialise : function(router,recursivPullResolvePromise){
     this.restApiGet.initialise(router);
     this.cacheNosql.initialise(router,recursivPullResolvePromise);
   }
}
