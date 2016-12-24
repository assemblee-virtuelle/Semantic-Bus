'use strict';

const https = require('https');

//const url = require('url');
//doc to promises : http://stackoverflow.com/questions/35182752/promises-with-http-get-node-js


module.exports = {
  configuration: require('../configuration'),
  request(method, resource, dataToSend, options) {
      return this._makeRequest(method, resource, dataToSend, options);
    },

    _makeRequest(method, resource, dataToSend, options) {

      // create a new Promise
      return new Promise((resolve, reject) => {

        /* Node's URL library allows us to create a
         * URL object from our request string, so we can build
         * our request for http.get */
        //const parsedUrl = url.parse(urlString);
        const requestOptions = this._createMLabOptions(method, resource, options);
        //console.log('REQUEST :',requestOptions,dataToSend);
        const request = https.request(requestOptions, res => this._onResponse(res, resolve, reject));

        /* if there's an error, then reject the Promise
         * (can be handled with Promise.prototype.catch) */
        request.on('error', reject);

        request.end(JSON.stringify(dataToSend));
      });
    },

    // the options that are required by http.get
    _createMLabOptions(methodREST, resource, options) {
      var params = "";
      for (var paramKey in options) {
        params += paramKey + '=';
        params += JSON.stringify(options[paramKey]);
        params += '&'
      }
      //console.log(params);
      //console.log('PORT | ',process.env.NODE_PORT);
      var databaseName = this.configuration.mlabDB;

      return {
        hostname: 'api.mlab.com',
        path: '/api/1/databases/' + databaseName + '/collections/' + resource + '/?' + params + 'apiKey=ue_eHVRDWSW0r2YZuTLCi1BxVB_zXnOI',
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
    }
};
