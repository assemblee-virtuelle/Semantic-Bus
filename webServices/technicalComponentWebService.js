
var mlab_token = require('../configuration').mlab_token

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

}
