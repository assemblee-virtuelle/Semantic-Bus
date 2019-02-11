"use strict";
class HttpGet {
  constructor() {
    this.type= 'File consumer';
    this.description= 'Interroger un fichier mis à disposition sur une API REST avec une requete GET.';
    this.editor= 'rest-get-editor';
    this.graphIcon='File_consumer.png';
    this.tags=[
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/fileComponents'
    ];
    this.url= require('url');
    this.http= require('http');
    this.https= require('follow-redirects').https;
    //https: require('https'),
    this.dataTraitment= require("../dataTraitmentLibrary/index.js");
    this.propertyNormalizer = require("../sharedLibrary/propertyNormalizer.js");
    this.stringReplacer= require('../sharedLibrary/stringReplacer.js');
  }

  makeRequest(methodRest, urlString, contentType,pullParams) {
    var _self = this
    return new Promise((resolve, reject) => {
      urlString=this.stringReplacer.execute(urlString,pullParams,undefined);
      // console.log(encodeURIComponent(urlString));
      const parsedUrl = this.url.parse(urlString);
      const requestOptions = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        port: parsedUrl.port,
        method: 'get',
        headers: {
          Accept: 'text/plain, application/xml , application/ld+json, text/csv',
          'user-agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:44.0) Gecko/20100101 Firefox/44.0',
        }
      };


      var lib = urlString.indexOf('https') != -1 ? this.https : this.http;
      const request = lib.request(requestOptions, response => {
        const hasResponseFailed = response.statusCode >= 400;
        //console.log(response);
        var responseBody = '';
        var responseBodyExel = [];
        if (hasResponseFailed) {
          let fullError = new Error("http get hasResponseFailed");
          fullError.displayMessage = "`Request to " + urlString + " failed with HTTP "+  response.statusCode;
          reject(fullError)
        }

        response.on('data', chunk => {
          responseBody += chunk.toString();
          responseBodyExel.push(chunk);
        });

        response.on('end', function () {
          //console.log('end',response.headers['content-disposition']);
          let responseContentType=response.headers['content-type'];
          responseContentType=responseContentType||contentType;
          this.dataTraitment.type.type_file(response.headers['content-disposition'],responseBody, responseBodyExel, undefined,  responseContentType).then((result)=>{
            let normalized = this.propertyNormalizer.execute(result);
            // console.log("normalized",normalized);
            resolve({data:normalized})
          }, (err)=>{
            //console.log('FILE ERROR',err);
            let fullError = new Error(err);
            fullError.displayMessage = "HTTP GET : Erreur lors du traitement de votre fichier";
            reject(fullError)
          })
          //console.log('end');
        }.bind(this));
      });

      request.on('error', function (e) {
        //console.log('error :', e);
        let fullError = new Error(e);
        fullError.displayMessage = "HTTP GET : Erreur lors de la requete";
        reject(fullError)
      });
      request.end();
    });
  }

  pull(data,flowdata,pullParams) {
    //console.log('REST Get JSON | pull : ',data);
    return this.makeRequest('GET', data.specificData.url, data.specificData.contentType,pullParams);
  }
}
module.exports = new HttpGet();
