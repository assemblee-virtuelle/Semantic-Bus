module.exports = {
  type: 'Framacalc Get CSV',
  description: 'intéroger une feuille de calcule Framacalc qui fourni un flux CSV',
  editor: 'framacalc-get-csv-editor',
  //  url: require('url'),
  //  http: require('http'),
  url: require('url'),
  http: require('http'),
  https: require('https'),
  csv: require('csvtojson'),
  makeRequest: function(key, offset, provider) {

    return new Promise((resolve, reject) => {
      var urlString = 'https://framacalc.org/' + key + '.csv'
      const parsedUrl = this.url.parse(urlString);
      //console.log('REST Get JSON | makerequest | port',parsedUrl.port);
      //  console.log('REST Get JSON | makerequest | host',parsedUrl.hostname);
      const requestOptions = {
          hostname: parsedUrl.hostname,
          path: parsedUrl.path,
          port: parsedUrl.port,
          method: 'get',
          headers: {
            Accept: 'text/csv',
            'user-agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:44.0) Gecko/20100101 Firefox/44.0'
          }
        }
        //console.log(requestOptions);

      var lib = urlString.indexOf('htts') != -1 ? this.http : this.https;

      const request = lib.request(requestOptions, response => {

        const hasResponseFailed = response.status >= 400;
        //console.log('REST Get JSON | header |',response.headers);
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
          console.log('responseBody | ', responseBody);
          this.csv({
              noheader: true
            }).fromString(responseBody).on('json', (jsonObj) => {
              console.log('CSV', jsonObj)
            }).on('end', () => {
              console.log('end')
            }).on('end_parsed', (jsonArr) => {
              console.log(jsonArr);
              resolve({data:jsonArr});
            })
            //resolve(JSON.parse(responseBody));
        });
      });

      /* if there's an error, then reject the Promise
       * (can be handled with Promise.prototype.catch) */
      request.on('error', reject);
      request.end();
    });
  },
  test: function(data) {
    //console.log('GOOGLE Get JSON | test : ', data);
    return this.makeRequest(data.specificData.key, data.specificData.offset, data.specificData.provider);
    /*this.makeRequest('GET', data.specificData.url).then(data => {
      //console.log('ALLO', data);
      res.json(data);
    });*/
    /*    res.json({
          url: data.url
        });*/
  }
}
