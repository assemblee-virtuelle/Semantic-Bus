'use strict';
var user_model = require('../lib/core/models').user
var workspace_model = require('../lib/core/models').workspace
var workspaceComponent_model = require('../lib/core/models').workspaceComponent
var cache_model = require('../lib/core/models').cache
var config = require('../configuration');


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


function _migration_workspace_workspace_component() {
  var i = 0
  console.log("Votre migration commence")
  workspace_model.find().exec(function (err, workspaces) {
    workspaceComponent_model.find().exec(function (err, workspaceComponents) {
      workspaces.forEach(function (workspace, index) {
        if (workspaces[index] == workspaces.length) {
          console.log("Migration terminé")
        }
        workspace.components = [];
        let workspace_promises = workspaceComponents.map(function (workspaceComponent) {
          return new Promise(function (resolve, reject) {
            if (workspaceComponent.workspaceId == workspace._id) {
              var new_version_workspaceComponent = {}
              var new_version_workspaceComponent = Object.assign(new_version_workspaceComponent, {
                module: workspaceComponent.module,
                name: workspaceComponent.name,
                type: workspaceComponent.type,
                description: workspaceComponent.description,
                editor: workspaceComponent.editor,
                connectionsAfter: workspaceComponent.connectionsAfter,
                connectionsBefore: workspaceComponent.connectionsBefore,
                workspaceId: workspaceComponent.workspaceId,
                specificData: workspaceComponent.specificData
              })
              workspaceComponent_model.findOneAndUpdate({
                _id: workspaceComponent._id
              }, new_version_workspaceComponent, {
                upsert: true
              }, function (err, newWorkspaceComponent) {
                if (err) {
                  throw TypeError(err);
                } else {
                  workspace.components.push(newWorkspaceComponent._id);
                  resolve(workspace.components)
                }
              })
            } else {
              resolve(false)
            }
          })
        })
        return Promise.all(workspace_promises).then(function (worksapceComponentResults) {
          i++
          var last_array_result = []
          worksapceComponentResults.forEach(function (worksapceComponentResult) {
            if (worksapceComponentResult != false) {
              last_array_result.push(worksapceComponentResult)
            }
          })
          if (last_array_result != undefined) {
            var new_version_workspace = {}
            new_version_workspace = Object.assign(new_version_workspace, {
              name: workspace.name,
              description: workspace.description,
              components: last_array_result[last_array_result.length - 1],
            })
          }
          console.log("WORKSPACE N°" + i)
          console.log(new_version_workspace)
          workspace_model.findOneAndUpdate({
            _id: workspace._id}, new_version_workspace, {
              upsert: true
            },
            function (err, new_version_workspace) {
            if (err) {
              throw TypeError(err);
            } else {
              console.log("save workspace")
            }
          })
        })
      })
    });
  })
} //<= _migration_workspace_workspace_component


// --------------------------------------------------------------------------------

function _migration_user() {
  user_model.find().exec(function (err, users) {
    console.log(users)
    users.forEach(function (user) {
      var new_version_user_update = {};
      new_version_user_update = Object.assign(new_version_user_update, {
        credentials: {
          email: user.credentials.email,
          hashed_password: user.credentials.password
        },
        name: user.credentials.email.substring(0, user.credentials.email.indexOf("@")),
        society: user.society,
        job: user.job,
        googleId: user.googleid,
        googleToken: user.googleToken,
        workspaces: user.workspaces,
        admin: user.admin,
        dates: {
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      user_model.findOneAndUpdate({
        _id: user._id
      }, new_version_user_update, {
        upsert: true
      }, function (err) {
        if (err) throw TypeError(err);
        console.log('saved');
      });
    })
  });
} //<= _migration_user


// --------------------------------------------------------------------------------

function _migration_cache() {
  cache_model.find().exec(function (err, caches) {
      caches.forEach(function (cache, index) {
        var new_version_cache_model = {};
        new_version_cache_model = Object.assign(new_version_cache_model,{
          _id: cache._id,
          data: cache.data
        })
        cache_model.findOneAndUpdate({
          _id: cache._id
        }, new_version_cache_model, {
          upsert: true
        }, function (err) {
          if (err) throw TypeError(err);
          console.log('saved');
        });
      })
    })
} //<= _migration_cache

// --------------------------------------------------------------------------------

// _migration_user();
// _migration_cache();
// _migration_workspace_workspace_component()