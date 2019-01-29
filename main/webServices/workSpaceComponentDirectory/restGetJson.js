"use strict";
module.exports = {
  type: 'Flow consumer',
  description: 'Interroger une API REST avec une requête GET qui fournit un flux JSON, XML.',
  editor: 'rest-get-json-editor',
  graphIcon: 'Flow_consumer.png',
  tags: [
    'http://semantic-bus.org/data/tags/inComponents',
    'http://semantic-bus.org/data/tags/APIComponents'
  ],
  url: require('url'),
  //http: require('http'),
  http: require('follow-redirects').http,
  //https: require('https'),
  https: require('follow-redirects').https,
  stringReplacer: require('../sharedLibrary/stringReplacer.js'),
  xml2js: require('xml2js'),
  //waterfall: require('promise-waterfall'),

  makeRequest: function(methodRest, specificData, pullParams, flowdata) {

    // create a new Promise
    return new Promise((resolve, reject) => {
      //console.log(pullParams,urlString);
      let urlString = specificData.url;

      // if(pullParams !=undefined && pullParams.query!=undefined){
      //   for (let param in pullParams.query) {
      //     urlString = urlString.replace('{£.' + param + '}', pullParams.query[param]);
      //   }
      // }

      urlString=this.stringReplacer.execute(urlString,pullParams,flowdata,true);
      // console.log('restGetJson',urlString);
      // console.log('urlString',urlString);

      let headers = {}
      if (specificData.headers != undefined) {
        for (let header of specificData.headers) {
          headers[header.key] = header.value;
        }
      }
      //let headers=specificData.headers.map(record=>{return({record.key:record.value})});
      //console.log(headers);
      //console.log(urlString);
      let parsedUrl = this.url.parse(urlString);
      // console.log('REST Get JSON | makerequest | port', parsedUrl.port);
      // console.log('REST Get JSON | makerequest | host', parsedUrl.hostname);
      var requestOptions = {};
      requestOptions.hostname = parsedUrl.hostname;
      requestOptions.path = parsedUrl.path;
      requestOptions.port = parsedUrl.port;
      requestOptions.method = methodRest;
      requestOptions.headers = headers;
      //requestOptions.headers.Accept = 'application/json';
      //requestOptions.headers['user-agent'] = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:44.0) Gecko/20100101 Firefox/44.0';

      requestOptions.headers.Accept = 'application/xhtml+xml,application/xml,application/json,application/ld+json';
      //requestOptions.headers['Accept-Encoding']='gzip, deflate, br';
      //requestOptions.headers['Accept-Language']='fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7';
      //requestOptions.headers['Cache-Control']='max-age=0';
      //requestOptions.headers.Connection='keep-alive';
      //requestOptions.headers.Cookie='PHPSESSID=70d62a9v3ghkegr7jeka00nte4';
      //requestOptions.headers.Host='www.communecter.org';
      //requestOptions.headers['Upgrade-Insecure-Requests']=1;
      requestOptions.headers['User-Agent'] = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/62.0.3202.94 Chrome/62.0.3202.94 Safari/537.36';
      requestOptions.headers['Cache-Control'] = 'private, no-cache, no-store, must-revalidate'
      //console.log(requestOptions);
      //console.log(urlString.indexOf('https') != -1);

      var lib = urlString.indexOf('https') != -1 ? this.https : this.http;
      //console.log('before',requestOptions.path);
      let request = this.http.request(requestOptions, response => {
        // console.log('ALLO');
        let hasResponseFailed = response.statusCode >= 400;
        // console.log('REST Get JSON | header |',response.headers);
        // console.log('REST Get JSON | statusCode: |',response.statusCode);
        var responseBody = '';
        response.resume();
        if (hasResponseFailed) {
          //console.log('error body',response);
          reject(new Error('Request failed for url '+ urlString+' with status ' + response.statusCode));
        } else {
          /* the response stream's (an instance of Stream) current data. See:
           * https://nodejs.org/api/stream.html#stream_event_data */
          //var i = 0;

          response.on('data', chunk => {
            //console.log(chunk.toString());
            //console.log('chunk ',i);
            //i++;
            responseBody += chunk.toString()
          });

          // once all the data has been read, resolve the Promise
          response.on('end', () => {
            // console.log('end response');
            // console.log(responseBody);

            try {
              //console.log('CONTENT-TYPE',response.headers['content-type']);
              let contentType=response.headers['content-type'];
              if (specificData.overidedContentType!=undefined && specificData.overidedContentType.length>0){
                contentType=specificData.overidedContentType;
              }
              //console.log(responseBody);
              //console.log('Location',response.headers['location']);
              if (contentType.search('xml') != -1) {
                this.xml2js.parseString(responseBody, {
                  attrkey: "attr",
                  "trim": true
                }, function(err, result) {
                  resolve({
                    data: result
                  });
                });
              } else if (contentType.search('json') != -1) {
                let responseObject = JSON.parse(responseBody);
                //console.log('response length',responseObject.length,parsedUrl.href);
                resolve({
                  data: JSON.parse(responseBody)
                });
              } else {
                reject(new Error('unsuported content-type :' + contentType))
              }


            } catch (e) {
              e.displayMessage=('Data Flow is unparsable')
              reject(e);
            }

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
    //console.log(data.specificData);
    return this.makeRequest('GET', data.specificData, pullParams, flowdata==undefined?undefined: flowdata[0].data);

  }
};
