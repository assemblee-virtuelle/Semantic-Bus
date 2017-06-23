module.exports = function(router) {
  var mLabPromise = require('./mLabPromise');
  var workspaceComponentPromise = require('./workspaceComponentPromise.js');
  var workspaceBusiness = require('./workspaceBusiness.js');

  //doc to promises : http://stackoverflow.com/questions/35182752/promises-with-http-get-node-js
  //var https = require('https');

  ///TEST GESTION DES COMPTE EN MODIFIANT LES QUERY POUR AVOIR LES WORKSPACE DES USERS
  router.get('/workspaceByUser/:userId', function(req, res) {
    // console.log(req.params.userId);
    var userId = req.params.userId;
    //On recupere le user grace a l'id
    var requestPromise = mLabPromise.request('GET', 'users/' + userId);
    var workspacePromises = [];
    var final_workspaces = [];
    var _completeWorkspaceByComponentsPromises = [];
    //console.log(requestPromise);
    requestPromise.then(function(data) {
      // console.log(data);
      // console.log(data);
      // On recupere les id des workspace du user
      // On requete sur la table workspace pour avoir ses workspaces
      console.log(data.workspaces)
      for (id in data.workspaces) {
        console.log(data.workspaces[id].role)
        if(data.workspaces[id].role == "owner"){
            workspacePromises.push(mLabPromise.request('GET', 'workspace/' + data.workspaces[id]._id));
        } 
      }
      // On recupere les informatiosn complementaire des workspace du user
      Promise.all(workspacePromises).then(function(res) {
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
      }).then(function(responses) {
        for (var responseKey in responses) {
          //   //console.log('Check response | ',workspaces[responseKey], ' | components | ',responses[responseKey]);
          //   //console.log('workspace', workspaces[responseKey]._id.$oid);
          final_workspaces[responseKey].components = workspaceBusiness.checkWorkspaceComponentConsistency(responses[responseKey]);
        }
        // console.log(final_workspaces)
        res.json(final_workspaces);
      });
    });
  });

  router.get('/workspaces/share/:userId', function(req, res) {
    // console.log(req.params.userId);
    var userId = req.params.userId;
    //On recupere le user grace a l'id
    var requestPromise = mLabPromise.request('GET', 'users/' + userId);
    var workspacePromises = [];
    var final_workspaces = [];
    var _completeWorkspaceByComponentsPromises = [];
    //console.log(requestPromise);
    requestPromise.then(function(data) {
      // console.log(data);
      // console.log(data);
      // On recupere les id des workspace du user
      // On requete sur la table workspace pour avoir ses workspaces
      console.log(data.workspaces)
      for (id in data.workspaces) {
        console.log(data.workspaces[id].role)
        if(data.workspaces[id].role == "editor" || data.workspaces[id].role ==  "viewer "){
            workspacePromises.push(mLabPromise.request('GET', 'workspace/' + data.workspaces[id]._id));
        } 
      }
      // On recupere les informatiosn complementaire des workspace du user
      Promise.all(workspacePromises).then(function(res) {
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
      }).then(function(responses) {
        for (var responseKey in responses) {
          //   //console.log('Check response | ',workspaces[responseKey], ' | components | ',responses[responseKey]);
          //   //console.log('workspace', workspaces[responseKey]._id.$oid);
          final_workspaces[responseKey].components = workspaceBusiness.checkWorkspaceComponentConsistency(responses[responseKey]);
        }
        // console.log(final_workspaces)
        res.json(final_workspaces);
      });
    });
  });


  //TEST GESTION DES COPOSANT DES UTILISATEURS
  router.get('/workspace/:id', function(req, res) {
    var id = req.params.id;
    var requestPromise = mLabPromise.request('GET', 'workspace/' + id);
    var workspace;
    //console.log(requestPromise);
    requestPromise.then(function(data) {
      workspace = data;
      return mLabPromise.request('GET', 'workspaceComponent/' + '', undefined, {
        q: {
          workspaceId: data._id.$oid
        }
      });

    }).then(function(components) {
      //console.log('Check response | ',workspaces[responseKey], ' | components | ',responses[responseKey]);
      //console.log('workspace',  workspaces[responseKey]._id.$oid);
      workspace.components = workspaceBusiness.checkWorkspaceComponentConsistency(components);

      //console.log(workspaces);
      res.json(workspace);
    });

  });


  router.get('/workspaceOwnAll/:userId', function(req, res) {
    console.log(req.params.userId);
    var userId = req.params.userId;
    //On recupere le user grace a l'id
    var userPromise = mLabPromise.request('GET', 'users/' + userId);
    var workspacePromise = mLabPromise.request('GET', 'workspace');
    //var final_workspaces = [];
    //var _completeWorkspaceByComponentsPromises = [];
    //console.log(requestPromise);
    var promises = [userPromise, workspacePromise]
    Promise.all(promises).then(function(res) {
      var user = res[0];
      var workspaces=res[1];
      var workspacesTable = [];
      for(workspace of workspaces){
        workspacesTable.push({_id:workspace._id.$oid, role: "owner"});
      }
      user.workspaces=workspacesTable;
      console.log(user);
      return mLabPromise.request('PUT', 'users/'+user._id.$oid,user);
    }).then(function(data){
      //console.log(res);
      res.json(data);
    });


    //
    // requestPromise.then(function(data) {
    //   console.log(data);
    //   // console.log(data);
    //   // On recupere les id des workspace du user
    //   // On requete sur la table workspace pour avoir ses workspaces
    //   for (id in data.workspaces) {
    //     workspacePromises.push(mLabPromise.request('GET', 'workspace/' + data.workspaces[id]._id));
    //   }
    //   // On recupere les informatiosn complementaire des workspace du user
    //   Promise.all(workspacePromises).then(function(res) {
    //     final_workspaces = res
    //     // console.log(final_workspaces);
    //     for (workspace in final_workspaces) {
    //       _completeWorkspaceByComponentsPromises.push(
    //         mLabPromise.request('GET', 'workspaceComponent', undefined, {
    //           q: {
    //             workspaceId: final_workspaces[workspace]._id.$oid
    //           }
    //         })
    //       )
    //     }
    //     // console.log(_completeWorkspaceByComponentsPromises);
    //     return Promise.all(_completeWorkspaceByComponentsPromises);
    //   }).then(function(responses) {
    //     for (var responseKey in responses) {
    //       //   //console.log('Check response | ',workspaces[responseKey], ' | components | ',responses[responseKey]);
    //       //   //console.log('workspace', workspaces[responseKey]._id.$oid);
    //       final_workspaces[responseKey].components = workspaceBusiness.checkWorkspaceComponentConsistency(responses[responseKey]);
    //     }
    //     // console.log(final_workspaces)
    //     console.log(final_workspaces);
    //     res.json(final_workspaces);
    //   });
    // });
  });

  router.put('/workspace/', function(req, res) {
    // var id = req.body._id.$oid;
    var entityToUpdate = JSON.parse(JSON.stringify(req.body));
    console.log(entityToUpdate)
    entityToUpdate.components = undefined;

    mLabPromise.request('GET', 'workspaceComponent', undefined, {
      q: {
        workspaceId: entityToUpdate._id.$oid
      }
    }).then(function(records) {
      const deletePromises = records.map(component => mLabPromise.request('DELETE', 'workspaceComponent/' + component._id.$oid));
      const updatePromise = mLabPromise.request('PUT', 'workspace/' + id, entityToUpdate)
      //const mergedPromises = [].concat.apply([], [deletePromises,insertPromises]);
      const mergedPromises = [].concat([updatePromise, deletePromises]);
      return Promise.all(mergedPromises);
    }).then(function(records) {
      req.body.components.forEach(component => {
        component.workspaceId = entityToUpdate._id.$oid
      });
      //TODO la sauvegerde su workspace dtruit les connections
      //console.log('PUT /workspace/ | insertedComopnents | ', req.body.components);
      const insertPromises = req.body.components.map(component => workspaceComponentPromise.getInsertPromise(component));
      //const insertPromises = req.body.components.map(component => mLabPromise.request('POST', 'workspaceComponent',component));
      //entityToUpdate = records[0];
      //console.log(insertPromises);
      return Promise.all(insertPromises);
    }).then(function(records) {
      entityToUpdate.components = records;
      res.json(entityToUpdate);
    });

    //var requestFistComponentPromise = mLabPromise.request('POST', 'workspaceComponent', firstComponentToInsert);
    //return requestFistComponentPromise;


  });

  router.post('/workspace/:userId', function(req, res) {
    var entityToInsert = req.body;
    var userId = req.params.userId;
    console.log(entityToInsert);
    console.log(userId)
    //var firstComponentToInsert = entityToInsert.firstComponent;
    //entityToInsert.firstComponent = undefined;
    //AJOUT D'un Workspace pour un utilisateur
    // On l'ajout d'abord a la collection workspace pluis on lui ajute sa reference dans la table users
    var requestPromise = mLabPromise.request('POST', 'workspace', entityToInsert);
    var requestUserPromise = mLabPromise.request('GET', 'users/' + userId);
    // const updatePromise = mLabPromise.request('PUT', 'users/' + userId, entityToUpdate)
    // const mergedPromises = [].concat([requestPromise,requestUserPromise,  updatePromise]);
    // return Promise.all(mergedPromises);
    //console.log(requestPromise);
    requestUserPromise.then(function(user) {
      // console.log(user)
      var userToInsert = user;
      requestPromise.then(function(data) {
        entityToInsert = data;
        userToInsert.workspaces.push(
          {_id: data._id.$oid,
            role: owner})
        data.components.forEach(component => {
          //component.technicalComponent = component._id.$oid;
          component.workspaceId = data._id.$oid
        });
        var updatePromise = mLabPromise.request('PUT', 'users/' + userId, userToInsert)
        const promisesList = data.components.map(component => workspaceComponentPromise.getInsertPromise(component));
        //const promisesList = data.components.map(component => mLabPromise.request('POST', 'workspaceComponent', component));
        const mergedPromises = [].concat([updatePromise, promisesList]);
        return Promise.all(mergedPromises);
      }).then(function(components) {
        // console.log(components[1])
        entityToInsert.components = components[1]
        //entityToInsert.components.push(componentData);
        console.log("Votre Workspace a été créé")
        res.json(entityToInsert);
      });
    })
  });

  router.delete('/workspace/:id/:userId', function(req, res) {
    var id = req.params.id;
    var userId = req.params.userId;
    var newWorspaceUserStore = []
    mLabPromise.request('GET', 'users/' + userId).then(function(user) {
      var userToInsert = user;
      for (workspaceid in userToInsert.workspaces) {
        if (userToInsert.workspaces[workspaceid]._id != id) {
          newWorspaceUserStore.push({
            _id: userToInsert.workspaces[workspaceid]._id
          })
        }
      }
      userToInsert.workspaces = newWorspaceUserStore;
      var updateUserPromise = mLabPromise.request('PUT', 'users/' + userId, userToInsert);
      var WorspaceDelete = mLabPromise.request('GET', 'workspaceComponent', undefined, {
        q: {
          workspaceId: id
        }
      })
      const mergedPromises = [].concat([updateUserPromise, WorspaceDelete]);
      Promise.all(mergedPromises).then(function(records) {
        // console.log("In record");
        // console.log(records[1]);
        return promisesList = records[1].map(component => {
          if (component._id != null) {
            console.log(component._id.$oid);
            return mLabPromise.request('DELETE', 'workspaceComponent/' + component._id.$oid);
          }
        })
      }).then(function(res) {
        // console.log(res)
        return Promise.all(promisesList);
      }).then(function(records) {
        return mLabPromise.request('DELETE', 'workspace/' + id);
      }).then(function(data) {
        console.log("Votre Workspace a été supprimé")
        res.json(data);
      });
    })
  });
}
