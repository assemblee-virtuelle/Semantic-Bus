module.exports = function (router) {

  var recursivPullResolvePromise = require('./recursivPullResolvePromise');
  var workspaceComponentPromise = require('./workspaceComponentPromise.js');
  var workspaceBusiness = require('./workspaceBusiness.js');
  var workspace_component_lib = require('../lib/core/lib/workspace_component_lib')



  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------


  router.get('/workspaceComponent/:id/test', function (req, res) {
    var id = req.params.id;
    workspace_component_lib.get({
      _id: id
    }).then(function (data) {
      console.log('workspaceComponent | test| ', data);
      var recursivPullResolvePromiseDynamic = require('./recursivPullResolvePromise');
      return recursivPullResolvePromise.getNewInstance().resolveComponentPull(data, false);
    }).then(function (data) {
      //console.log("IN WORKSPACE COMPONENT RETURN DATA |", data)
      res.json(data.data);
    })

  }); //<= resolveComponentPull

  // --------------------------------------------------------------------------------

  router.get('/workspaceComponent/:id/work', function (req, res) {
    var id = req.params.id;
    workspace_component_lib.get({
      _id: id
    }).then(function (data) {
      console.log('workspaceComponent | work| ', data);
      var recursivPullResolvePromiseDynamic = require('./recursivPullResolvePromise');
      return recursivPullResolvePromiseDynamic.getNewInstance().resolveComponent(data, 'work');
    }).then(function (data) {
      console.log("IN WORKSPACE COMPONENT RETURN DATA |", data)
      res.json(data.data);
    })
  }); //<= resolveComponent

  // --------------------------------------------------------------------------------

  router.put('/workspaceComponent/', function (req, res) {

    var configuration = require('../configuration');
    if (configuration.saveLock == false) {
      var id = req.body._id;
      var componentToUpdate = req.body;
      console.log('workspaceComponent',componentToUpdate);
      workspace_component_lib.update(req.body).then(function (compoupdate) {
        res.json(compoupdate)
      })
    } else {
      res.json({
        message: 'save forbiden'
      })
    }
  });

  // --------------------------------------------------------------------------------

  router.get('/workspaceComponent/ConnectBeforeConnectAfter/:id', function (req, res) {
    var id = req.params.id;
    workspace_component_lib.getConnectBeforeConnectAfter({
      _id: id
    }).then(function (data) {
      res.send(data)
    });
  }) //<= get_ConnectBeforeConnectAfter

}
