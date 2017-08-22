'use strict';
var user_model = require('../lib/core/models').user
var workspace_model = require('../lib/core/models').workspace
var workspaceComponent_model = require('../lib/core/models').workspaceComponent
var cache_model = require('../lib/core/models').cache
var config = require('../configuration');

// var mongoose = require('mongoose');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;


// --------------------------------------------------------------------------------

var conStr = config.mlab_migration

var connection = mongodb.connect(conStr);


// --------------------------------------------------------------------------------


function _migration_workspace_workspace_component() {
  var i = 0
  connection.then(function (db) {
    console.log("Votre migration commence")
    db.collection("workspace").find().toArray(function (err, workspaces) {
      db.collection("workspaceComponent").find().toArray(function (err, workspaceComponents) {
        workspaces.forEach(function (workspace, index) {
          if (workspaces[index] == workspaces.length) {
            console.log("Migration terminé")
          }
          workspace.components = [];
          let workspace_promises = workspaceComponents.map(function (workspaceComponent) {
            return new Promise(function (resolve, reject) {
              if (workspaceComponent.workspaceId == workspace._id) {
                var new_version_workspaceComponent = new workspaceComponent_model({
                  _id: workspaceComponent._id,
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
                new_version_workspaceComponent.save(function (err, newWorkspaceComponent) {
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
              var new_version_workspace = new workspace_model({
                _id: workspace._id,
                name: workspace.name,
                description: workspace.description,
                components: last_array_result[last_array_result.length - 1],
              })
            }
            console.log("WORKSPACE N°" + i)
            console.log(new_version_workspace)
            new_version_workspace.save(function (err, new_version_workspace_save) {
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
  })
} //<= _migration_workspace_workspace_component


// --------------------------------------------------------------------------------

function _migration_user() {
  connection.then(function (db) {
    db.collection("users").find().toArray(function (err, users) {
      users.forEach(function (user) {
        var new_version_user = new user_model({
          _id: user._id,
          credentials: {
            email: user.email,
            hashed_password: user.password
          },
          name: user.email.substring(0, user.email.indexOf("@")),
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
        })
        new_version_user.save(function (err, userData) {
          if (err) {
            throw TypeError(err);
          } else {
            console.log("save")
          }
        })
      })
    });
  })
} //<= _migration_user


// --------------------------------------------------------------------------------

function _migration_cache() {
  connection.then(function (db) {
    db.collection("cache").find().toArray(function (err, caches) {
      caches.forEach(function (cache, index) {
        var new_version_cache_model = new cache_model({
          _id: cache._id,
          data: cache.data
        })
        new_version_cache_model.save(function (err, userData) {
          if (err) {
            throw TypeError(err);
          } else {
            console.log("save")
          }
        })
      })
    })
  })
} //<= _migration_cache

// --------------------------------------------------------------------------------

// _migration_user();
_migration_cache();
_migration_workspace_workspace_component()