'use strict'
class GouvFrGeoLocaliser {
  constructor () {
    this.url = require('url')
    this.http = require('http')
    this.RequestCount = 0
  }

  initComponent (entity) {
    return entity
  }

  geoLocalise (rawSource, specificData) {
    let source = rawSource
    if (!Array.isArray(rawSource)) {
      source = [source]
    }

    return new Promise((resolve, reject) => {
      var goePromises = []
      var sourceKey = 0
      var interval = setInterval(function () {
        if (sourceKey >= source.length) {
          clearInterval(interval)
          Promise.all(goePromises).then(geoLocalisations => {
            var result = []
            for (var geoLocalisationKey in geoLocalisations) {
              let record = source[geoLocalisationKey]
              if (geoLocalisations[geoLocalisationKey].error == undefined && geoLocalisations[geoLocalisationKey].features != undefined && geoLocalisations[geoLocalisationKey].features[0] != undefined) {
                record[specificData.latitudePath] = geoLocalisations[geoLocalisationKey].features[0].geometry.coordinates[1]
                record[specificData.longitudePath] = geoLocalisations[geoLocalisationKey].features[0].geometry.coordinates[0]

                result.push(record)
              } else {
                record[specificData.latitudePath] = {
                  error: geoLocalisations[geoLocalisationKey].error
                }
                record[specificData.longitudePath] = {
                  error: geoLocalisations[geoLocalisationKey].error
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
          })
        } else {
          this.RequestCount++
          var record = source[sourceKey]
          if (record == undefined) {
            resolve({
              error: 'undefined data'
            })
          } else {
            var address = {
              street: record[specificData.streetPath],
              town: record[specificData.townPath],
              postalCode: record[specificData.postalCodePath],
              country: record[specificData.countryPath]
            }

            var postalCodeString = address.postalCode + ''
            if (postalCodeString.length == 4) {
              address.postalCode = '0' + postalCodeString
            }

            var addressGouvFrFormated = ''
            addressGouvFrFormated = addressGouvFrFormated + (address.street ? address.street + ' ' : '')
            addressGouvFrFormated = addressGouvFrFormated + (address.town ? address.town + ' ' : '')
            addressGouvFrFormated = addressGouvFrFormated + (address.postalCode ? address.postalCode + ' ' : '')
            // TODO notify user the adresse is too long (200)
            addressGouvFrFormated = addressGouvFrFormated.substr(0, 199)
            // addressGouvFrFormated = addressGouvFrFormated + (address.country ? address.country + ' ' : '');
            if (addressGouvFrFormated.length > 0) {
              goePromises.push(
                new Promise((resolve, reject) => {
                  // var apiKey = 'AIzaSyBAg94NXmqVLFeIWGBcQ4cweA7YXC3ndLI'
                  // var apiKey = 'AIzaSyAGHo04gqJWKF8uVYhsWVRY_zo61YtemMQ'
                  var urlString = 'http://api-adresse.data.gouv.fr/search/?q='
                  urlString = urlString + encodeURI(addressGouvFrFormated)
                  const parsedUrl = this.url.parse(urlString)
                  let keepAliveAgent = new this.http.Agent({
                    keepAlive: true
                  })
                  const requestOptions = {
                    hostname: parsedUrl.hostname,
                    path: parsedUrl.path,
                    port: parsedUrl.port,
                    method: 'GET',
                    agent: keepAliveAgent
                  }
                  try {
                    // resolve({error:'dummy'})
                    const request = this.http.request(requestOptions, response => {
                      const hasResponseFailed = response.statusCode >= 400
                      var responseBody = ''

                      if (hasResponseFailed) {
                        //   error: 'request status fail'
                        // });
                        resolve({
                          error: 'Request to ${response.url} failed with HTTP ${response.status}'
                        })
                      }

                      response.on('data', chunk => {
                        responseBody += chunk.toString()
                      })

                      // once all the data has been read, resolve the Promise
                      response.on('end', function () {
                        try {
                          resolve(JSON.parse(responseBody))
                        } catch (e) {
                          resolve({
                            error: e
                          })
                          // throw e;
                        }
                      })
                    })
                    request.on('error', function (e) {
                      resolve({
                        error: e
                      })
                    })
                    request.end()
                  } catch (e) {
                    resolve({
                      error: e
                    })
                  }
                })
              )
            } else {
              goePromises.push(
                new Promise((resolve, reject) => {
                  resolve({
                    error: 'no adresse'
                  })
                })
              )
            }
          }
          sourceKey++
        }
      }.bind(this), 200)
    })
  }

  pull (data, flowData) {
    return this.geoLocalise(flowData[0].data, data.specificData)
  }
}

module.exports = new GouvFrGeoLocaliser()
