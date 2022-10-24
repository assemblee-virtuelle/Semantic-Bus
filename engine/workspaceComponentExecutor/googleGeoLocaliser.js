'use strict';
class GoogleGeoLocaliser {
  constructor() {
    this.url = require('url')
    this.editor = 'google-geolocaliser-editor'
    this.https = require('https'),
    this.configuration = require('../configuration.js')
  }
  initComponent(entity) {
    return entity
  }

  getPriceState(specificData, moPrice, recordPrice) {
    if (specificData.googleToken != null) {
      return {
        moPrice: moPrice,
        recordPrice: 0
      }
    } else {
      return {
        moPrice: moPrice,
        recordPrice: recordPrice
      }
    }
  }

  geoLocalise(rawSource, specificData) {
    return new Promise((resolve, reject) => {
      var goePromises = []
      //var errorArray = [];
      let source = rawSource
      if (!Array.isArray(rawSource)) {
        source = [source]
      }
      for (let record of source) {
        var address = {
          street: record[specificData.streetPath],
          town: record[specificData.townPath],
          postalCode: record[specificData.postalCodePath],
          country: record[specificData.countryPath]
        }
        goePromises.push(
          new Promise((resolve, reject) => {
            //var apiKey = 'AIzaSyBJElsvbr_6obYaeTd2oOyiEd97XjSNyY8'
            let apiKey;
            if (specificData.apiKey != undefined) {
              apiKey = specificData.apiKey;
            } else if (this.configuration.components_information.googleGeoLocaliser.apiKey != undefined) {
              apiKey = this.configuration.components_information.googleGeoLocaliser.apiKey
            }

            if (apiKey != undefined) {
              // var apiKey = 'AIzaSyAGHo04gqJWKF8uVYhsWVRY_zo61YtemMQ'
              var addressGoogleFormated = 'address='
              addressGoogleFormated = addressGoogleFormated + (address.street ? address.street + ',+' : '')
              addressGoogleFormated = addressGoogleFormated + (address.town ? address.town + ',+' : '')
              addressGoogleFormated = addressGoogleFormated + (address.postalCode ? address.postalCode + ',+' : '')
              addressGoogleFormated = addressGoogleFormated + (address.country ? address.country + ',+' : '')
              var urlString = 'https://maps.googleapis.com/maps/api/geocode/json?'
              urlString = urlString + addressGoogleFormated
              urlString = urlString + '&key=' + apiKey;
              urlString = encodeURI(urlString);
              // console.log('urlString',urlString);
              const parsedUrl = this.url.parse(urlString)
              const requestOptions = {
                hostname: parsedUrl.hostname,
                path: parsedUrl.path,
                port: parsedUrl.port,
                method: 'GET'
              }
              const request = this.https.request(requestOptions, response => {
                const hasResponseFailed = response.statusCode >= 400
                var responseBody = ''
                /* the response stream's (an instance of Stream) current data. See:
                 * https://nodejs.org/api/stream.html#stream_event_data */
                response.on('data', chunk => {
                  // console.log(chunk.toString());
                  responseBody += chunk.toString()
                })
                // once all the data has been read, resolve the Promise
                response.on('end', () => {
                  if (hasResponseFailed) {
                    console.log('error',response);
                    resolve({
                      error: `Request to ${response.url} failed with HTTP ${response.statusCode}:${response.statusMessage}`
                    })
                  } else {
                    // console.log('response good');
                    let responseBodyObject = {}
                    try {
                      responseBodyObject = JSON.parse(responseBody)
                      if (responseBodyObject.error_message == undefined) {
                        resolve(responseBodyObject)
                      } else {
                        resolve({
                          error: responseBodyObject.error_message
                        })
                      }
                    } catch (e) {
                      resolve({
                        error: responseBody
                      })
                    }
                  }
                })
              })
              request.on('error', reject)
              request.end()
            } else {
              resolve({
                error: 'apiKey not exists'
              })
            }
          })
        )
      }

      Promise.all(goePromises).then(geoLocalisations => {
        var result = []
        for (var geoLocalisationKey in geoLocalisations) {
          let record = source[geoLocalisationKey]
          if (geoLocalisations[geoLocalisationKey].status == 'OK' && geoLocalisations[geoLocalisationKey].error == undefined) {
            record[specificData.latitudePath] = geoLocalisations[geoLocalisationKey].results[0].geometry.location.lat
            record[specificData.longitudePath] = geoLocalisations[geoLocalisationKey].results[0].geometry.location.lng
            result.push(record)
          } else {
            record[specificData.latitudePath] = {
              error: geoLocalisations[geoLocalisationKey].error || geoLocalisations[geoLocalisationKey].status
            }
            record[specificData.longitudePath] = {
              error: geoLocalisations[geoLocalisationKey].error || geoLocalisations[geoLocalisationKey].status
            }
            result.push(record)
          }
        }
        if (!Array.isArray(rawSource)) {
          result = result[0]
        }

        resolve({
          data: result
        })
      }).catch(err => {
        reject(err)
      })
    })
  }

  pull(data, flowData) {
    return this.geoLocalise(flowData[0].data, data.specificData)
  }
}

module.exports = new GoogleGeoLocaliser()
