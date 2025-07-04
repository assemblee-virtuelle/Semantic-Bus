'use strict';

module.exports = {
  user_model: require('@semantic-bus/core/models').user,
  workspace_model: require('@semantic-bus/core/models').workspace,
  workspaceComponent_model: require('@semantic-bus/core/models').workspaceComponent,
  cache_model: require('@semantic-bus/core/models').cache,
  config: require('../config.json'),

  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------

  work: function() {
    this._migration_user;
    this._migration_workspace_workspace_component;
    this._migration_cache;
  },

  _migration_workspace_workspace_component: function() {
    let i = 0;
    console.log('Votre migration commence');
    workspace_model.find().exec((err, workspaces) => {
      workspaceComponent_model.find().exec((err, workspaceComponents) => {
        workspaces.forEach((workspace, index) => {
          if (workspaces[index] == workspaces.length) {
            console.log('Migration terminé');
          }
          workspace.components = [];
          const workspace_promises = workspaceComponents.map((workspaceComponent) => {
            return new Promise((resolve, reject) => {
              if (workspaceComponent.workspaceId == workspace._id) {
                var new_version_workspaceComponent = {};
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
                });
                workspaceComponent_model.findOneAndUpdate({
                  _id: workspaceComponent._id
                }, new_version_workspaceComponent, {
                  upsert: true
                }, (err, newWorkspaceComponent) => {
                  if (err) {
                    throw TypeError(err);
                  } else {
                    workspace.components.push(newWorkspaceComponent._id);
                    resolve(workspace.components);
                  }
                });
              } else {
                resolve(false);
              }
            });
          });
          return Promise.all(workspace_promises).then((worksapceComponentResults) => {
            i++;
            const last_array_result = [];
            worksapceComponentResults.forEach((worksapceComponentResult) => {
              if (worksapceComponentResult != false) {
                last_array_result.push(worksapceComponentResult);
              }
            });
            if (last_array_result != undefined) {
              var new_version_workspace = {};
              new_version_workspace = Object.assign(new_version_workspace, {
                name: workspace.name,
                description: workspace.description,
                components: last_array_result[last_array_result.length - 1]
              });
            }
            console.log('WORKSPACE N°' + i);
            console.log(new_version_workspace);
            workspace_model.findOneAndUpdate({
              _id: workspace._id }, new_version_workspace, {
              upsert: true
            },
            (err, new_version_workspace) => {
              if (err) {
                throw TypeError(err);
              } else {
                console.log('save workspace');
              }
            });
          });
        });
      });
    });
  }, // <= _migration_workspace_workspace_component

  // --------------------------------------------------------------------------------

  _migration_user: function() {
    user_model.find().exec((err, users) => {
      console.log(users);
      users.forEach((user) => {
        let new_version_user_update = {};
        new_version_user_update = Object.assign(new_version_user_update, {
          credentials: {
            email: user.credentials.email,
            hashed_password: user.credentials.password
          },
          name: user.credentials.email.substring(0, user.credentials.email.indexOf('@')),
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
        }, (err) => {
          if (err) throw TypeError(err);
          console.log('saved');
        });
      });
    });
  }, // <= _migration_user

  // --------------------------------------------------------------------------------

  _migration_cache: function() {
    cache_model.find().exec((err, caches) => {
      caches.forEach((cache, index) => {
        let new_version_cache_model = {};
        new_version_cache_model = Object.assign(new_version_cache_model, {
          _id: cache._id,
          data: cache.data
        });
        cache_model.findOneAndUpdate({
          _id: cache._id
        }, new_version_cache_model, {
          upsert: true
        }, (err) => {
          if (err) throw TypeError(err);
          console.log('saved');
        });
      });
    });
  } // <= _migration_cache

};
// --------------------------------------------------------------------------------

// _migration_user();
// _migration_cache();
// _migration_workspace_workspace_component()
