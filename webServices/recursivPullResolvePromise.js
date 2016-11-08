'use strict';

//const https = require('https');

//const url = require('url');
//doc to promises : http://stackoverflow.com/questions/35182752/promises-with-http-get-node-js


module.exports = {
  technicalComponentDirectory: require('./technicalComponentDirectory.js'),
  restGetJson: require('./workSpaceComponentDirectory/restGetJson.js'),
  mLabPromise: require('./mLabPromise'),
  resolveWebComponentPull(webcomponent) {
    return this._makeRequest(webcomponent);
  },

  _makeRequest(webcomponent) {

    // create a new Promise
    return new Promise((resolve, reject) => {

      var module = this.technicalComponentDirectory[webcomponent.module]

      if (webcomponent.connectionsBefore.length > 0) {
        //console.log('resolveWebComponentPull | beforeId | ',webcomponent.connectionsBefore[0]);
        var flowsPromise = webcomponent.connectionsBefore.map(connectionBefore =>
            this.restGetJson.makeRequest('GET', 'http://localhost:3000/data/core/workspaceComponent/' + connectionBefore + '/test')
          )
        Promise.all(flowsPromise).then(function(connectionsBeforeData) {

            if (module.test) {
              module.test(webcomponent, connectionsBeforeData).then(function(data) {
                resolve(data);
              });
            } else {
              console.log('NO MODULE');
              resolve(null);
            }
          });
      } else {
        console.log('resolveWebComponentPull | Last| ', webcomponent);
        console.log('ALLO ' + module);
        if (module.test) {
          module.test(webcomponent).then(function(data) {
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
