'use strict';

module.exports = {

  workspace_model: require('@semantic-bus/core/models').workspace,
  workspaceComponent_model: require('@semantic-bus/core/models').workspaceComponent,
  config: require('../config.json'),

  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------

  work: function() {
    this._migration_workspace_links();
  },

  _migration_workspace_links: function() {
    console.log('Votre migration commence');
    try {
      this.workspace_model.find().populate({
        path: 'components',
        select: '-consumption_history'
      }).lean().exec((err, workspaces) => {
        // console.log(workspaces);
        const workspace_promises = [];
        workspaces.forEach(workspace => {
          // console.log(this);
          const promise = new Promise((resolve, reject) => {
            workspace.links = [];
            workspace.components.forEach(component => {
              component.connectionsAfter.forEach(connection => {
                // console.log(component._id);
                workspace.links.push({
                  source: component._id,
                  target: connection
                });
              });
            });

            this.workspace_model.findOneAndUpdate({
              _id: workspace._id
            }, workspace, {
              new: true
            }).lean().exec((err, workspaceUpdated) => {
              if (err) {
                reject(err);
              } else {
                resolve(workspaceUpdated);
              }
            });
          });
          workspace_promises.push(promise);
        });
        Promise.all(workspace_promises).then(workspaces => {
          console.log('all links migrate');
          // resolve(workspaces);
        }).catch(e => {
          console.log(e);
          // reject(e);
        });
      });
    } catch (e) {
      console.log(e);
    }
  }
};
