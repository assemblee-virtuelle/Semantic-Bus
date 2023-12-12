'use strict';
class HttpFileConsumer {
  constructor () {
    this.url = require('url')
    this.http = require('http')
    this.https = require('follow-redirects').https
    this.dataTraitment = require('../../core/dataTraitmentLibrary/index.js')
    this.propertyNormalizer = require('../utils/propertyNormalizer.js')
    this.stringReplacer = require('../utils/stringReplacer.js')
  }

  makeRequest (methodRest, urlString, contentType, flowData, pullParams) {
    return new Promise((resolve, reject) => {
      urlString = this.stringReplacer.execute(urlString, pullParams, flowData?flowData[0].data:undefined)
      const parsedUrl = this.url.parse(urlString)
      const requestOptions = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        port: parsedUrl.port,
        method: 'get',
        headers: {
          Accept: 'application/json, application/xml, application/ld+json, text/csv, text/plain,',
          'user-agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:44.0) Gecko/20100101 Firefox/44.0'
        }
      }

      var lib = urlString.indexOf('https') != -1 ? this.https : this.http
      const request = lib.request(requestOptions, response => {
        const hasResponseFailed = response.statusCode >= 400
        var responseBody = ''
        // var responseBodyExel = []
        if (hasResponseFailed) {
          let fullError = new Error('http get hasResponseFailed')
          fullError.displayMessage = '`Request to ' + urlString + ' failed with HTTP ' + response.statusCode
          reject(fullError)
        }

        response.on('data', chunk => {
          responseBody += chunk.toString()
          // responseBodyExel.push(chunk)
        })

        response.on('end', function () {
          let responseContentType = response.headers['content-type']
          responseContentType = contentType || responseContentType
          console.log(responseBody)
          this.dataTraitment.type.data_from_file(response.headers['content-disposition'], Buffer.from(responseBody, 'utf-8'), responseContentType).then((result) => {
            let normalized = this.propertyNormalizer.execute(result)
            resolve({ data: normalized })
          }, (err) => {
            let fullError = new Error(err)
            fullError.displayMessage = 'HTTP GET : Erreur lors du traitement de votre fichier';
            reject(fullError)
          })
        }.bind(this))
      })

      request.on('error', function (e) {
        let fullError = new Error(e)
        fullError.displayMessage = 'HTTP GET : Erreur lors de la requete';
        reject(fullError)
      })
      request.end()
    })
  }

  pull (data, flowdata, pullParams) {
    return this.makeRequest('GET', data.specificData.url, data.specificData.contentType,flowdata, pullParams)
  }
}
module.exports = new HttpFileConsumer()
