"use strict";
class GouvFrInverseGeo {
  constructor() {
    this.type = 'data.gouv reverse geocoding';
    this.description = 'Interroger l\'API adresse.data.gouv.fr pour trouver la latitude et la longitude avec une adresse.';
    this.editor = 'data-gouv-inverse-geolocaliser-editor';
    this.graphIcon = 'Data_gouv_reverse_geocoding.png';
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleGeocodeComponents'
    ];
    this.url = require('url');
    this.http = require('http');
  }

  initComponent(entity) {
    return entity;
  }

  inverseGeoLocalise(source, specificData) {

    return new Promise((resolve, reject) => {

      var goePromises = [];


      for (record of source) {
        var geoLoc = {
          lat: record[specificData.latitudePath],
          lng: record[specificData.longitudePath],
        }

        goePromises.push(
          new Promise((resolve, reject) => {
            urlString = 'http://api-adresse.data.gouv.fr/reverse/?lon=' + geoLoc.lng + '&lat=' + geoLoc.lat;
            const parsedUrl = this.url.parse(urlString);
            const requestOptions = {
              hostname: parsedUrl.hostname,
              path: parsedUrl.path,
              port: parsedUrl.port,
              method: 'GET'
            }
            const request = this.http.request(requestOptions, response => {
              const hasResponseFailed = response.status >= 400;
              //console.log('gouvInverse | headers |',response.headers)
              var responseBody = '';

              if (hasResponseFailed) {
                reject(`Request to ${response.url} failed with HTTP ${response.status}`);
              }
              response.on('data', chunk => {
                responseBody += chunk.toString();
              });
              response.on('end', () => {
                resolve(responseBody == "" ? undefined : JSON.parse(responseBody));
              });
            });
            request.on('error', reject);
            request.end();
          })
        );
      }

      Promise.all(goePromises).then(geoLocalisations => {
        var result = [];
        for (var geoLocalisationKey in geoLocalisations) {
          if (geoLocalisations[geoLocalisationKey] != undefined) {
            var record = source[geoLocalisationKey];
            record[specificData.CPPath] = geoLocalisations[geoLocalisationKey].features[0].properties.postcode;
            record[specificData.INSEEPath] = geoLocalisations[geoLocalisationKey].features[0].properties.citycode;
            result.push(record);
          }
        }
        resolve({
          data: result
        });
      });
    })
  }

  pull(data, flowData) {
    return this.inverseGeoLocalise(flowData[0].data, data.specificData);
  }

}

module.exports = new GouvFrInverseGeo();
