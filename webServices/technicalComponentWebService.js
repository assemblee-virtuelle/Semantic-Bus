
var mlab_token = require('../configuration').mlab_token

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


module.exports = function(router, unSafeRouteur) {

  // -------------------------------------------------------------------------------

  var technicalComponentDirectory = require('./technicalComponentDirectory.js');
  var recursivPullResolvePromise = require('./recursivPullResolvePromise');
  technicalComponentDirectory.initialise(router, unSafeRouteur, recursivPullResolvePromise);

  router.get('/technicalComponent/', function(req, res) {
    var directory = [];
    console.log(technicalComponentDirectory)
    for (var technicalComponent in technicalComponentDirectory) {
      if (technicalComponent != 'initialise') {
        directory.push({
          module: technicalComponent,
          type: technicalComponentDirectory[technicalComponent].type,
          description: technicalComponentDirectory[technicalComponent].description,
          editor: technicalComponentDirectory[technicalComponent].editor
        });
      }
    }
    res.json(directory);
  });//<= get_technicalComponent

}
