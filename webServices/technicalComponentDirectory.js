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
   scrapper: require('./workSpaceComponentDirectory/scrapper.js'),
   httpGet: require('./workSpaceComponentDirectory/httpGet.js'),
   sqlConnector: require('./workSpaceComponentDirectory/sqlConnecteur.js'),
<<<<<<< HEAD
   mongoConnector: require('./workSpaceComponentDirectory/connecteurMongoDB.js'),
  sparqlRequest: require('./workSpaceComponentDirectory/sparqlRequest.js'),
=======
   valueMapping: require('./workSpaceComponentDirectory/valueMapping.js'),
    //  sparqlRequest: require('./workSpaceComponentDirectory/sparqlRequest.js'),
>>>>>>> 78e4e7f44e4a4442f9d0942bd041d68743be780e
    /* some other modules you want */
    initialise : function(router,unSafeRouteur, recursivPullResolvePromise){
      this.restApiGet.initialise(unSafeRouteur);//NO SECURE CHANGE ROUTER
      this.upload.initialise(unSafeRouteur);
      this.cacheNosql.initialise(unSafeRouteur,recursivPullResolvePromise); //NO SECURE CHANGE ROUTER
    }
}
