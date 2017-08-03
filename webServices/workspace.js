var mLabPromise = require('./mLabPromise');
var workspaceComponentPromise = require('./workspaceComponentPromise.js');
var workspaceBusiness = require('./workspaceBusiness.js');
var workspace_lib = require('../lib/core').workspace
var workspace_component_lib = require('../lib/core').workspaceComponent
//doc to promises : http://stackoverflow.com/questions/35182752/promises-with-http-get-node-js



// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


module.exports = function (router) {

  // --------------------------------------------------------------------------------

  router.get('/workspaceByUser/:userId', function (req, res) {
    workspace_lib.getAllOwner(req.params.userId).then(function (workspaces) {
      res.json(workspaces)
    })
  }); //<= share workspace 


  // --------------------------------------------------------------------------------

  router.get('/workspaces/share/:userId', function (req, res) {
    // console.log(req.params.userId);
    var userId = req.params.userId;
    //On recupere le user grace a l'id
    var requestPromise = mLabPromise.request('GET', 'users/' + userId);
    var workspacePromises = [];
    var final_workspaces = [];
    var _completeWorkspaceByComponentsPromises = [];
    //console.log(requestPromise);
    requestPromise.then(function (data) {
      // console.log(data);
      // console.log(data);
      // On recupere les id des workspace du user
      // On requete sur la table workspace pour avoir ses workspaces
      // console.log(data.workspaces)
      for (id in data.workspaces) {
        // console.log(data.workspaces[id].role)
        if (data.workspaces[id].role == "editor" || data.workspaces[id].role == "viewer ") {
          workspacePromises.push(mLabPromise.request('GET', 'workspace/' + data.workspaces[id]._id));
        }
      }
      // On recupere les informatiosn complementaire des workspace du user
      Promise.all(workspacePromises).then(function (res) {
        final_workspaces = res
        // console.log(final_workspaces);
        for (workspace in final_workspaces) {
          // console.log('workspace', workspace)
          _completeWorkspaceByComponentsPromises.push(
            mLabPromise.request('GET', 'workspaceComponent', undefined, {
              q: {
                workspaceId: final_workspaces[workspace]._id.$oid
              }
            })
          )
        }
        // console.log(_completeWorkspaceByComponentsPromises);
        return Promise.all(_completeWorkspaceByComponentsPromises);
      }).then(function (responses) {
        for (var responseKey in responses) {
          //   //console.log('Check response | ',workspaces[responseKey], ' | components | ',responses[responseKey]);
          //   //console.log('workspace', workspaces[responseKey]._id.$oid);
          final_workspaces[responseKey].components = workspaceBusiness.checkWorkspaceComponentConsistency(responses[responseKey]);
        }
        res.json(final_workspaces);
      });
    });
  });

  // --------------------------------------------------------------------------------

  router.get('/workspace/:id', function (req, res) {
    workspace_lib.getWorkspace(req.params.id).then(function (workspaces) {
      res.json(workspaces);
    });
  }); // <= get one workspace

  // --------------------------------------------------------------------------------

  router.get('/workspaceOwnAll/:userId', function (req, res) {
    // console.log(req.params.userId);
    var userId = req.params.userId;
    //On recupere le user grace a l'id
    var userPromise = mLabPromise.request('GET', 'users/' + userId);
    var workspacePromise = mLabPromise.request('GET', 'workspace');
    //var final_workspaces = [];
    //var _completeWorkspaceByComponentsPromises = [];
    //console.log(requestPromise);
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
      // console.log(user);
      return mLabPromise.request('PUT', 'users/' + user._id.$oid, user);
    }).then(function (data) {
      //console.log(res);
      res.json(data);
    });
  });

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
      console.log(req.params.userId)
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
    var id = req.params.id;
    var userId = req.params.userId;
    var newWorspaceUserStore = []
    mLabPromise.request('GET', 'users/' + userId).then(function (user) {
      var userToInsert = user;
      new Promise(function (resolve, reject) {
        for (workspaceid in userToInsert.workspaces) {
          if (userToInsert.workspaces[workspaceid]._id != id) {
            newWorspaceUserStore.push({
              _id: userToInsert.workspaces[workspaceid]._id,
              role: userToInsert.workspaces[workspaceid].role
            })
          }
        }
        console.log("etape 1", newWorspaceUserStore)
        resolve(newWorspaceUserStore)
      }).then(function (newWorspaceUser) {
        new Promise(function (resolve, reject) {
          userToInsert.workspaces = newWorspaceUser;
          var updateUserPromise = mLabPromise.request('PUT', 'users/' + userId, userToInsert);
          var WorspaceDelete = mLabPromise.request('GET', 'workspaceComponent', undefined, {
            q: {
              workspaceId: id
            }
          })
          resolve({
            "updateUserPromise": updateUserPromise,
            "WorspaceDelete": WorspaceDelete
          })
        }).then(function (dataRes) {
          console.log(dataRes)
          const mergedPromises = [].concat([dataRes.updateUserPromise, dataRes.WorspaceDelete]);
          Promise.all(mergedPromises).then(function (records) {
            // console.log("In record");
            // console.log(records[1]);
            return promisesList = records[1].map(component => {
              if (component._id != null) {
                console.log(component._id.$oid);
                return mLabPromise.request('DELETE', 'workspaceComponent/' + component._id.$oid);
              }
            })
            console.log("etape 3", component._id)
          }).then(function () {
            // console.log(res)
            console.log("etape 6")
            return Promise.all(promisesList);
          }).then(function () {
            console.log("etape 5", id)
            return mLabPromise.request('DELETE', 'workspace/' + id);
          }).then(function (data) {
            console.log("Votre Workspace a été supprimé")
            res.json(data);
          });
        })
      })
    })
  })
}