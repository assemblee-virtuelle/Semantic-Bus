'use strict';
class GouvFrInverseGeo {
  constructor () {
    this.url = require('url')
    this.http = require('http')
  }

  initComponent (entity) {
    return entity
  }

  async inverseGeoLocalise2 (flowData, specificData) {
    if(Array.isArray(flowData)){
      throw new Error('input data can not be an array');
    }
    var geoLoc = {
      lat: flowData[specificData.latitudePath],
      lng: flowData[specificData.longitudePath]
    }
    const urlString = 'http://api-adresse.data.gouv.fr/reverse/?lon=' + geoLoc.lng + '&lat=' + geoLoc.lat;
    console.log(urlString)
    const geoResponse = await fetch(urlString);


    if(geoResponse.status==200){

      const geoResponseObject = await geoResponse.json();
      console.log(geoResponseObject)
      if(geoResponseObject.features.length>0){
        // console.log(geoLocalisations[geoLocalisationKey].features[0].properties);
        flowData[specificData.CPPath] = geoResponseObject.features[0].properties.postcode;
        flowData[specificData.INSEEPath] = geoResponseObject.features[0].properties.citycode;
        flowData[specificData.VillePath] = geoResponseObject.features[0].properties.city;
      }else{
        flowData[specificData.CPPath]="no adress finded";
        flowData[specificData.INSEEPath]="no adress finded";
        flowData[specificData.VillePath] = "no adress finded"
      }
  
      return flowData;
    } else {
      throw new Error(geoResponseObject.message)
    }

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
                  try {
                    resolve(responseBody == '' ? undefined : JSON.parse(responseBody))
                  } catch (error) {
                    reject(new Error('json deserialisation not ok:',responseBody));
                  }

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
      return this.inverseGeoLocalise2(flowData[0].data, data.specificData)
  }
}

module.exports = new GouvFrInverseGeo()
