module.exports = {
  type: 'REST Get JSON',
  description: 'intéroger une API REST avec une requete Get qui fourni un flux JSON',
  editor: 'rest-get-json-editor',
  url: require('url'),
  http: require('http'),
  makeRequest: function(methodRest, urlString, options) {
    //console.log(urlString);
    // create a new Promise
    return new Promise((resolve, reject) => {
      const parsedUrl = this.url.parse(urlString);
      //console.log('REST Get JSON | makerequest | port',parsedUrl.port);
      //  console.log('REST Get JSON | makerequest | host',parsedUrl.hostname);
      const requestOptions = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        port: parsedUrl.port,
        method: methodRest
      }
      console.log(requestOptions);
      const request = this.http.request(requestOptions, response => {
        const hasResponseFailed = response.status >= 400;
        var responseBody = '';

        if (hasResponseFailed) {
          reject(`Request to ${response.url} failed with HTTP ${response.status}`);
        }

        /* the response stream's (an instance of Stream) current data. See:
         * https://nodejs.org/api/stream.html#stream_event_data */
        response.on('data', chunk => {
          //console.log(chunk.toString());
          responseBody += chunk.toString()
        });

        // once all the data has been read, resolve the Promise
        response.on('end', () => {
          //console.log(responseBody);
          resolve(JSON.parse(responseBody));
        });
      });

      /* if there's an error, then reject the Promise
       * (can be handled with Promise.prototype.catch) */
      request.on('error', reject);
      request.end();
    });
  },
  test: function(data) {
    //console.log('REST Get JSON | test : ',data);
    return this.makeRequest('GET', data.specificData.url);
    /*this.makeRequest('GET', data.specificData.url).then(data => {
      //console.log('ALLO', data);
      res.json(data);
    });*/
    /*    res.json({
          url: data.url
        });*/
  }
}
