var mLabPromise = require('./mLabPromise');
var workspaceComponentPromise = require('./workspaceComponentPromise.js');
var workspaceBusiness = require('./workspaceBusiness.js');
var workspace_lib = require('../lib/core').workspace
var workspace_component_lib = require('../lib/core').workspaceComponent


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


module.exports = function (router) {

    // ---------------------------------------  ALL USERS  -----------------------------------------

  router.get('/workspaceByUser/:userId', function (req, res) {
    workspace_lib.getAll(req.params.userId, "owner").then(function (workspaces) {
      res.json(workspaces)
    })
  }); //<= own workspace 


  // --------------------------------------------------------------------------------

  router.get('/workspaces/share/:userId', function (req, res) {
    workspace_lib.getAll(req.params.userId, "editor").then(function (workspaces) {
      res.json(workspaces)
    })
  }); //<= share workspace 

  // --------------------------------------------------------------------------------

  router.get('/workspace/:id', function (req, res) {
    workspace_lib.getWorkspace(req.params.id).then(function (workspaces) {
      console.log("RENDER ", req.params.id)
      res.json(workspaces);
    });
  }); // <= get one workspace

  // --------------------------------------------------------------------------------

  router.put('/workspace/', function (req, res) {
    console.log('req.body', req.body)
    if (req.body != null) {
      if (req.body.component) {
        workspace_component_lib.create(req.body.component).then(function (workspaceComponent) {
          workspace_lib.update(req.body.workspace, workspaceComponent._id).then(function (workspaceUpdate) {
            res.send(workspaceUpdate)
          })
        })
      } else {
        workspace_lib.update(req.body).then(function (workspaceUpdate) {
          res.send(workspaceUpdate)
        })
      }
    } else {
      res.send("error")
    }
  }) //<= update_workspace;

  // --------------------------------------------------------------------------------

  router.post('/workspace/:userId', function (req, res) {
    if (req.body.components) {
      if (req.body.components.length > 0) {
        workspace_component_lib.create(req.body.components).then(function (workspaceComponent) {
          req.body.components = []
          req.body.components.push(workspaceComponent._id)
          workspace_lib.create(req.params.userId, req.body).then(function (workspace) {
            res.send(workspace)
          })
        })
      } else {
        workspace_lib.create(req.params.userId, req.body).then(function (workspace) {
          res.send(workspace)
        })
      }
    } else {
      workspace_lib.create(req.params.userId, req.body).then(function (workspace) {
        res.send(workspace)
      })
    }
  }); //<= post workspace

  // --------------------------------------------------------------------------------

  router.delete('/workspace/:id/:userId', function (req, res) {

    workspace_lib.destroy(req.params.userId, req.params.id).then(function(workspace){
      console.log("workspace delete", workspace)
      res.json(workspace)
    })
  })//<= delete workspace



  router.get('/workspaceComponent/load_all_component/:id', function (req, res) {
    var id = req.params.id;
    console.log(id)
    workspace_lib.load_all_component(id).then(function (data) {
      res.send(data)
    });
  }) //<= get_ConnectBeforeConnectAfter

  // --------------------------------------------------------------------------------

  

  // ---------------------------------------  ADMIN  -----------------------------------------

  router.get('/workspaceOwnAll/:userId', function (req, res) {
    var userId = req.params.userId;
    var userPromise = mLabPromise.request('GET', 'users/' + userId);
    var workspacePromise = mLabPromise.request('GET', 'workspace');
    var promises = [userPromise, workspacePromise]
    Promise.all(promises).then(function (res) {
      var user = res[0];
      var workspaces = res[1];
      var workspacesTable = [];
      for (workspace of workspaces) {
        workspacesTable.push({
          _id: workspace._id.$oid,
          role: "owner"
        });
      }
      user.workspaces = workspacesTable;
      return mLabPromise.request('PUT', 'users/' + user._id.$oid, user);
    }).then(function (data) {
      res.json(data);
    });
  });
}




