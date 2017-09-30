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
      console.log('path :',requestOptions.path);
      // console.log('REQUEST :',requestOptions,dataToSend);
      const request = https.request(requestOptions, res => this._onResponse(res, resolve, reject));

      /* if there's an error, then reject the Promise
       * (can be handled with Promise.prototype.catch) */
      request.on('error', function(e) {
         console.log('error',e);
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
      databaseName = this.configuration.DB;
    }

    return {
      hostname: 'api.mlab.com',
      path: '/api/1/databases/' + databaseName + '/collections/' + resource + '/?' + params + 'apiKey=' + mlab_token,
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
    console.log('configuration :',this.configuration);
    return new Promise((resolve, reject) => {
      console.log('clone start');

      var workspaceComponentToInsertPromise = this.request('GET', 'workspacecomponents', undefined, undefined, this.configuration.DBToClone);
      var workspaceToInsertPromise = this.request('GET', 'workspaces', undefined, undefined, this.configuration.DBToClone);

      var readPromises = Promise.all([workspaceComponentToInsertPromise, workspaceToInsertPromise]);

      var insertWorkspaceData;
      var insertComponentData;

      readPromises.then(data => {

        let PromisesExecution = [];


        insertWorkspaceData=data[1];

        insertComponentData=data[0];

        
        PromisesExecution.push(this.request('PUT', 'workspacecomponents', [], undefined));
        
        
        PromisesExecution.push(this.request('PUT', 'workspaces', [], undefined));

        return Promise.all(PromisesExecution);
      }).then(data => {
        let PromisesExecution = [];
          
        PromisesExecution.push(this.request('POST', 'workspacecomponents', insertWorkspaceData, undefined));

        
        PromisesExecution.push(this.request('POST', 'workspaces', insertComponentData, undefined));

        return Promise.all(PromisesExecution);
      }).then(data => {
        console.log('CLONE DONE');
        resolve({
          status: 'done'
        });
      });

    });

  },

  cloneDatabaseMigration() {
    return new Promise((resolve, reject) => {
      console.log('clone start');
      var DbToClone = "semantic_bus_seed"
      var DBcible = "semantic_bus_integration"
      var workspaceComponentToInsertPromise = this.request('GET', 'workspacecomponents', undefined, undefined, DbToClone);
      var workspaceToInsertPromise = this.request('GET', 'workspaces', undefined, undefined, DbToClone);
      var userToInsertPromise = this.request('GET', 'users', undefined, undefined, DbToClone);

      var readPromises = Promise.all([workspaceComponentToInsertPromise, workspaceToInsertPromise, userToInsertPromise]);

      var insertWorkspaceData;
      var insertComponentData;
      var insertUserData;

      readPromises.then(data => {

        let PromisesExecution = [];


        insertWorkspaceData=data[1];

        insertComponentData=data[0];

        insertUserData = data[2]
        
        PromisesExecution.push(this.request('PUT', 'workspacecomponents', [], undefined, DBcible));
        
        
        PromisesExecution.push(this.request('PUT', 'workspaces', [], undefined, DBcible));


        PromisesExecution.push(this.request('PUT', 'users', [], undefined, DBcible));


        return Promise.all(PromisesExecution);
      }).then(data => {
        let PromisesExecution = [];
          
        PromisesExecution.push(this.request('POST', 'workspacecomponents', insertWorkspaceData, undefined, DBcible));
        
        
        PromisesExecution.push(this.request('POST', 'workspaces', insertComponentData, undefined, DBcible));


        PromisesExecution.push(this.request('POST', 'users', insertUserData, undefined, DBcible));

        return Promise.all(PromisesExecution);
      }).then(data => {
        console.log('CLONE DONE', data);
        resolve({
          status: 'done'
        });
      });

    });

  }


};
