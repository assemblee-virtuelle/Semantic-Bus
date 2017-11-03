module.exports = {
  type: 'REST Get JSON',
  description: 'OBSOLETE, utiliser HTTP GET; intéroger une API REST avec une requete Get qui fourni un flux JSON',
  editor: 'rest-get-json-editor',
  graphIcon: 'restGetJson.png',
  url: require('url'),
  http: require('http'),
  https: require('https'),
  makeRequest: function(methodRest, urlString, pullParams, options) {

    // create a new Promise
    return new Promise((resolve, reject) => {
      //console.log(pullParams,urlString);
      for (param in pullParams) {
        console.log(param);
        urlString = urlString.replace('<%' + param + '%>', pullParams[param]);
      }
      //console.log(urlString);
      const parsedUrl = this.url.parse(urlString);
      // console.log('REST Get JSON | makerequest | port', parsedUrl.port);
      // console.log('REST Get JSON | makerequest | host', parsedUrl.hostname);
      var requestOptions = options || {};
      requestOptions.hostname = parsedUrl.hostname;
      requestOptions.path = parsedUrl.path;
      requestOptions.port = parsedUrl.port;
      requestOptions.method = methodRest;
      requestOptions.headers = requestOptions.headers || {};
      requestOptions.headers.Accept = 'application/json';
      requestOptions.headers['user-agent'] = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:44.0) Gecko/20100101 Firefox/44.0';


      console.log(requestOptions);

      var lib = urlString.indexOf('https') != -1 ? this.http : this.https;

      const request = lib.request(requestOptions, response => {
        const hasResponseFailed = response.statusCode >= 400;
        //console.log('REST Get JSON | header |',response.headers);
        //console.log('REST Get JSON | statusCode: |',response.statusCode);
        var responseBody = '';

        if (hasResponseFailed) {
          reject(new Error('Requestfailed with status '+ response.statusCode));
        } else {
          /* the response stream's (an instance of Stream) current data. See:
           * https://nodejs.org/api/stream.html#stream_event_data */
          var i = 0;
          response.on('data', chunk => {
            //console.log(chunk.toString());
            //console.log('chunk ',i);
            i++;
            responseBody += chunk.toString()
          });

          // once all the data has been read, resolve the Promise
          response.on('end', () => {
            //console.log('end response');
            //console.log(responseBody);
            resolve({
              data: JSON.parse(responseBody)
            });
          });

        }
      });

      /* if there's an error, then reject the Promise
       * (can be handled with Promise.prototype.catch) */
      request.on('error', function(e) {
        console.log('error request:', e);
        reject(e);
      });
      request.end();
    });
  },
  pull: function(data, flowdata, pullParams) {
    //console.log('REST Get JSON | pull : ',data);
    return this.makeRequest('GET', data.specificData.url, pullParams);
    /*this.makeRequest('GET', data.specificData.url).then(data => {
      //console.log('ALLO', data);
      res.json(data);
    });*/
    /*    res.json({
          url: data.url
        });*/
  }
};
