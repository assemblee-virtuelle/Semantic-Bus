'use strict'
class RestGetJson {
  constructor () {
    this.url = require('url')
    this.http = require('follow-redirects').http
    this.https = require('follow-redirects').https
    this.stringReplacer = require('../utils/stringReplacer.js')
    this.propertyNormalizer = require('../utils/propertyNormalizer.js')
    this.xml2js = require('xml2js')
  }

  makeRequest (methodRest, specificData, pullParams, flowdata) {
    return new Promise((resolve, reject) => {
      let urlString = specificData.url
      // console.log(flowdata);
      urlString = this.stringReplacer.execute(urlString, pullParams, flowdata, true);
      // console.log('urlString',JSON.stringify(urlString));
      let headersFlow = {}
      if (specificData.headers != undefined) {
        for (let header of specificData.headers) {
          const value = this.stringReplacer.execute(header.value, pullParams, flowdata, true);
          headersFlow[header.key] = value
        }
      }

      // console.log('urlString',urlString);

      let parsedUrl = this.url.parse(urlString);
      // console.log('parsedUrl',parsedUrl);
      var defaultHeaders = {
        'Content-Type':'application/json',
        'User-Agent' : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/62.0.3202.94 Chrome/62.0.3202.94 Safari/537.36',
        'Cache-Control' : 'private, no-cache, no-store, must-revalidate',
        'Accept' : 'application/xhtml+xml,application/xml,application/json,application/ld+json',
        'SemanticBus-User' : 'test'
      }
      let requestOptions = {
        hostname : parsedUrl.hostname,
        path : parsedUrl.path,
        port : parsedUrl.port,
        method : methodRest,
        headers : {...defaultHeaders,...headersFlow}
      };

      // console.log('requestOptions',requestOptions);

      if(specificData.bodyFill==true){
        requestOptions.headers['Content-Length'] = Buffer.from(JSON.stringify(flowdata)).length;
      }
      // console.log('LENGTH',requestOptions.headers['Content-Length']);

      // requestOptions.headers['Content-Type'] = 'application/json';

      const requester = urlString.includes('https')?this.https:this.http;

      console.log('requestOptions',requestOptions);

      let request = requester.request(requestOptions, response => {
        let hasResponseFailed = response.statusCode >= 400
        var responseBody = ''
        response.resume()
        if (hasResponseFailed) {
          reject(new Error('Request failed for url ' + urlString + ' with status ' + response.statusCode))
        } else {
          response.on('data', chunk => {
            // i++;
            responseBody += chunk.toString()
          })

          response.on('end', () => {
            try {
              let contentType = response.headers['content-type']
              if (specificData.overidedContentType != undefined && specificData.overidedContentType.length > 0) {
                contentType = specificData.overidedContentType
              }
              if (contentType.search('xml') != -1) {
                this.xml2js.parseString(responseBody, {
                  attrkey: 'attr',
                  'trim': true
                }, (err, result) => {
                  resolve({
                    data: this.propertyNormalizer.execute(result)
                  })
                })
              } else if (contentType.search('json') != -1) {
                let responseObject = JSON.parse(responseBody)
                resolve({
                  data: this.propertyNormalizer.execute(responseObject)
                })
              } else {
                reject(new Error('unsuported content-type :' + contentType + responseBody))
              }
            } catch (e) {
              e.displayMessage = ('Data Flow is unparsable')
              reject(e)
            }
          })
        }
      })

      request.on('error', function (e) {
        console.log('error',e);
        reject(new Error(`connect refused to ${urlString}`))
      })
      if(specificData.bodyFill==true){
        request.write(JSON.stringify(flowdata));
      }
      request.end()
    })
  }

  pull (data, flowdata, pullParams) {
    return this.makeRequest('GET', data.specificData, pullParams, flowdata == undefined ? undefined : flowdata[0].data)
  }
}
module.exports = new RestGetJson()
