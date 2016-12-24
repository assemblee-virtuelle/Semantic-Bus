module.exports = {
   restGetJson : require('./workSpaceComponentDirectory/restGetJson.js'),
   objectTransformer : require('./workSpaceComponentDirectory/objectTransformer.js'),
   googleGetJson : require('./workSpaceComponentDirectory/googleGetJson.js'),
   simpleAgregator : require('./workSpaceComponentDirectory/simpleAgregator.js'),
   googleGeoLocaliser : require('./workSpaceComponentDirectory/googleGeoLocaliser.js'),
   cacheNosql : require('./workSpaceComponentDirectory/cacheNosql.js'),
   gouvInverseGeo : require('./workSpaceComponentDirectory/gouvInverseGeo.js'),
   restApiGet : require('./workSpaceComponentDirectory/restApiGet.js'),
   /* some other modules you want */
   initialise : function(router){
     this.restApiGet.initialise(router);
   }
}
