'use strict';

const https = require('https');
var mlab_token = require('../configuration').mlab_token

//const url = require('url');
//doc to promises : http://stackoverflow.com/questions/35182752/promises-with-http-get-node-js


module.exports = {
  configuration: require('../configuration'),
  request(method, resource, dataToSend, options, databaseName) {
    return this._makeRequest(method, resource, dataToSend, options, databaseName);
  },

  _makeRequest(method, resource, dataToSend, options, databaseName) {

    // create a new Promise
    return new Promise((resolve, reject) => {

      /* Node's URL library allows us to create a
       * URL object from our request string, so we can build
       * our request for http.get */
      //const parsedUrl = url.parse(urlString);
      const requestOptions = this._createMLabOptions(method, resource, options, databaseName);
      //console.log('REQUEST :',requestOptions,dataToSend);
      const request = https.request(requestOptions, res => this._onResponse(res, resolve, reject));

      /* if there's an error, then reject the Promise
       * (can be handled with Promise.prototype.catch) */
      request.on('error', function(e) {
        // console.log(requestOptions);
        reject(e)
      });
      //request.on('error', function(e){resolve({info:'mlab fail',error:e})});
      request.end(JSON.stringify(dataToSend));
    });
  },

  // the options that are required by http.get
  _createMLabOptions(methodREST, resource, options, databaseName) {
    var params = "";
    // console.log(options);
    for (var paramKey in options) {
      params += paramKey + '=';
      params += JSON.stringify(options[paramKey]);
      params += '&'
    }
    // console.log(params);
    //console.log('PORT | ',process.env.NODE_PORT);
    if (databaseName == undefined) {
      databaseName = this.configuration.mlabDB;
    }

    return {
      hostname: 'api.mlab.com',
<<<<<<< HEAD
      path: '/api/1/databases/' + databaseName + '/collections/' + resource + '/?' + params + 'apiKey=' + mlab_token,
=======
      path: '/api/1/databases/' + databaseName + '/collections/' + resource + '/?' + params + 'apiKey=ue_eHVRDWSW0r2YZuTLCi1BxVB_zXnOI',
>>>>>>> 3f2738dee261e87dc7bb280d3a233b9ac45e464d
      /*port: url.port,*/
      method: methodREST,
      headers: {
        'Content-Type': 'application/json'
      }
    };
  },

  /* once http.get returns a response, build it and
   * resolve or reject the Promise */
  _onResponse(response, resolve, reject) {
    //console.log('RESPONSE');
    const hasResponseFailed = response.status >= 400;
    var responseBody = '';

    if (hasResponseFailed) {
      console.log('FAIL');
      reject(`Request to ${response.url} failed with HTTP ${response.status}`);
    }

    /* the response stream's (an instance of Stream) current data. See:
     * https://nodejs.org/api/stream.html#stream_event_data */
    response.on('data', chunk => responseBody += chunk.toString());



    // once all the data has been read, resolve the Promise
    //maybe JSON.parse(responseBody)
    response.on('end', () => {
      resolve(JSON.parse(responseBody))
    });
  },

  cloneDatabase() {
    return new Promise((resolve, reject) => {
      var workspaceComponentToDeletePromise = this.request('GET', 'workspaceComponent');
      var workspaceComponentToInsertPromise = this.request('GET', 'workspaceComponent', undefined, undefined, this.configuration.mlabDBToClone);
      var workspaceToDeletePromise = this.request('GET', 'workspace');
      var workspaceToInsertPromise = this.request('GET', 'workspace', undefined, undefined, this.configuration.mlabDBToClone);
      var readPromises = Promise.all([workspaceComponentToDeletePromise, workspaceComponentToInsertPromise, workspaceToDeletePromise, workspaceToInsertPromise]);

      //var workspaceComponentPromises = Promise.all([workspaceComponentToDeletePromise,workspaceComponentToInsertPromise]);

      readPromises.then(data => {
        //console.log(data[0]);
        var PromisesExecution = [];
        for (var record of data[0]) {
          PromisesExecution.push(this.request('DELETE', 'workspaceComponent/' + record._id.$oid))
        }
        for (var record of data[1]) {
          PromisesExecution.push(this.request('POST', 'workspaceComponent', record))
        }
        for (var record of data[2]) {
          PromisesExecution.push(this.request('DELETE', 'workspace/' + record._id.$oid))
        }
        for (var record of data[3]) {
          PromisesExecution.push(this.request('POST', 'workspace', record))
        }

        return Promise.all(PromisesExecution);
      }).then(data => {
        resolve({
          status: 'done'
        });
      });

    });

  }


};
