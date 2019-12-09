'use strict';
class GouvFrInverseGeo {
  constructor () {
    this.url = require('url')
    this.http = require('http')
  }

  initComponent (entity) {
    return entity
  }

  inverseGeoLocalise (rawSource, specificData) {
    let source = rawSource
    if (!Array.isArray(rawSource)) {
      source = [source]
    }
    return new Promise(async (resolve, reject) => {

      try {
        var goePromises = []
        for (let record of source) {
          var geoLoc = {
            lat: record[specificData.latitudePath],
            lng: record[specificData.longitudePath]
          }

          goePromises.push(
            new Promise((resolve, reject) => {
              const urlString = 'http://api-adresse.data.gouv.fr/reverse/?lon=' + geoLoc.lng + '&lat=' + geoLoc.lat
              const parsedUrl = this.url.parse(urlString)
              const requestOptions = {
                hostname: parsedUrl.hostname,
                path: parsedUrl.path,
                port: parsedUrl.port,
                method: 'GET'
              }
              const request = this.http.request(requestOptions, response => {
                const hasResponseFailed = response.status >= 400

                var responseBody = ''

                if (hasResponseFailed) {
                  reject(`Request to ${response.url} failed with HTTP ${response.status}`)
                }
                response.on('data', chunk => {
                  responseBody += chunk.toString()
                })
                response.on('end', () => {
                  resolve(responseBody == '' ? undefined : JSON.parse(responseBody))
                })
              })
              request.on('error', reject)
              request.end()
            })
          )
        }

        let geoLocalisations = await Promise.all(goePromises);
        var result = []
        for (let geoLocalisationKey in geoLocalisations) {
          if (geoLocalisations[geoLocalisationKey] != undefined) {
            let record = source[geoLocalisationKey]
            if(geoLocalisations[geoLocalisationKey].features.length>0){
              // console.log(geoLocalisations[geoLocalisationKey].features[0].properties);
              record[specificData.CPPath] = geoLocalisations[geoLocalisationKey].features[0].properties.postcode;
              record[specificData.INSEEPath] = geoLocalisations[geoLocalisationKey].features[0].properties.citycode;
              record[specificData.VillePath] = geoLocalisations[geoLocalisationKey].features[0].properties.city;
            }else{
              record[specificData.CPPath]="no adress finded";
              record[specificData.INSEEPath]="no adress finded";
              record[specificData.VillePath] = "no adress finded"
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
      } catch (e) {
        reject(e)
      }
    })
  }

  pull (data, flowData) {
      return this.inverseGeoLocalise(flowData[0].data, data.specificData)
  }
}

module.exports = new GouvFrInverseGeo()
