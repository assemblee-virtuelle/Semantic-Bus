
var mlab_token = require('../configuration').mlab_token
var componentsCategoriesTree = require('./componentsCategoriesTree')

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


module.exports = function(router, unSafeRouteur) {

  // --------------------------------------------------------------------------------

  var technicalComponentDirectory = require('./technicalComponentDirectory.js');
  var recursivPullResolvePromise = require('./recursivPullResolvePromise');
  technicalComponentDirectory.initialise(router, unSafeRouteur, recursivPullResolvePromise);


  router.get('/technicalComponent/', function(req, res) {

    res.json(technicalComponentDirectory.buildDictionnaryArray());
  });//<= get_technicalComponent

  router.get('/technicalComponent/componentsCategoriesTree', function (req, res,next) {
    res.json(componentsCategoriesTree);
  });

}
