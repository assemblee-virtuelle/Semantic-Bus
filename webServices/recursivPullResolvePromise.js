'use strict';

//const https = require('https');

//const url = require('url');
//doc to promises : http://stackoverflow.com/questions/35182752/promises-with-http-get-node-js


module.exports = {
  technicalComponentDirectory: require('./technicalComponentDirectory.js'),
  restGetJson: require('./workSpaceComponentDirectory/restGetJson.js'),
  mLabPromise: require('./mLabPromise'),
  workspaceComponentPromise: require('./workspaceComponentPromise.js'),
  resolveComponentPull(component, notMainNode) {
    return this._makeRequest(component, notMainNode);
  },

  _makeRequest(component, notMainNode) {

    // create a new Promise
    return new Promise((resolve, reject) => {

      var module = this.technicalComponentDirectory[component.module]
      if (component.connectionsBefore.length > 0 && (module.stepNode!=true || notMainNode!=true)) {
        //console.log('resolveWebComponentPull | beforeId | ',webcomponent.connectionsBefore[0]);

        Promise.all(
          component.connectionsBefore.map(connectionBeforeId =>
            this.workspaceComponentPromise.getReadPromiseById(connectionBeforeId)
          )
        ).then(workspaceComponents =>
          Promise.all(
            workspaceComponents.map(workspaceComponent =>
              this.resolveComponentPull(workspaceComponent,true)
            )
          )
        ).then(connectionsBeforeData => {
          if (module.test) {
            module.test(component, connectionsBeforeData).then(function(data) {
              resolve(data);
            });
          } else {
            console.log('NO MODULE');
            resolve(null);
          }
        });
      } else {
        //console.log('resolveWebComponentPull | Last| ', component);
        if (module.test) {
          module.test(component).then(function(data) {
            resolve(data);
          });
        } else {
          console.log('NO MODULE');
          resolve(null);
        }
      }
    });
  }
};
