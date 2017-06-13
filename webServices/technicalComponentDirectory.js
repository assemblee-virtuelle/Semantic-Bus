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
   filter : require('./workSpaceComponentDirectory/filter.js'),
   upload: require('./workSpaceComponentDirectory/upload.js'),


   /* some other modules you want */
   initialise : function(router, apiRouteur, recursivPullResolvePromise){
     this.restApiGet.initialise(apiRouteur);//NO SECURE CHANGE ROUTER
     this.upload.initialise(router);
     this.cacheNosql.initialise(apiRouteur,recursivPullResolvePromise); //NO SECURE CHANGE ROUTER
   }
}
