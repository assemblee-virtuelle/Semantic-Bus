"use strict";
module.exports = {
  type: 'adresse.data.gouv.fr geolocaliser par lot',
  description: 'interroger l api adresse.data.gouv pour transo une adresse en latitude et longitude par lot pour les gros volumes',
  editor: 'data-gouv-geolocaliser-mass-editor',
  graphIcon:'dataGouvFrGeolocaliser.png',
  tags:[
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleGeocodeComponents'
  ],
  url: require('url'),
  http: require('http'),
  initComponent: function(entity) {
    return entity;
  },

  geoLocalise: function(source, specificData) {

    return new Promise((resolve, reject) => {

      var goePromises = [];
      var adresseCSV = '';


      for (record of source) {


        var address = {
          street: record[specificData.streetPath],
          town: record[specificData.townPath],
          postalCode: record[specificData.postalCodePath],
          country: record[specificData.countryPath],
        }

        var addressGouvFrFormated = ''
        addressGouvFrFormated = addressGouvFrFormated + (address.street ? address.street + ' ' : '');
        addressGouvFrFormated = addressGouvFrFormated + (address.town ? address.town + ' ' : '');
        addressGouvFrFormated = addressGouvFrFormated + (address.postalCode ? address.postalCode + ' ' : '');
        addressGouvFrFormated = addressGouvFrFormated + (address.country ? address.country + ' ' : '');

        if (addressGouvFrFormated.length > 0) {
          addressGouvFrFormated = addressGouvFrFormated + '\n';
          adresseCSV = adresseCSV + addressGouvFrFormated;
          /*goePromises.push(
            new Promise((resolve, reject) => {

              var urlString = 'http://api-adresse.data.gouv.fr/search/?q=';
              urlString = urlString + encodeURI(addressGouvFrFormated);

              const parsedUrl = this.url.parse(urlString);
              const requestOptions = {
                hostname: parsedUrl.hostname,
                path: parsedUrl.path,
                port: parsedUrl.port,
                method: 'GET'
              }
              const request = this.http.request(requestOptions, response => {
                const hasResponseFailed = response.status >= 400;
                var responseBody = '';

                if (hasResponseFailed) {
                  reject(`Request to ${response.url} failed with HTTP ${response.status}`);
                }

                response.on('data', chunk => {
                  responseBody += chunk.toString()
                });

                response.on('end', function() {
                  try {
                    resolve(JSON.parse(responseBody));
                  } catch (e) {
                    resolve({
                      error: e
                    });
                  }
                }.bind(this));
              });
              request.on('error', reject);
              request.end();
            })
          );*/
        }

      }
      /*  Promise.all(goePromises).then(geoLocalisations => {
          var result = [];
          //console.log('geoLocalise | geoLocalisations result |', geoLocalisations);
          for (var geoLocalisationKey in geoLocalisations) {
            //console.log('geoLocalise | geoLocalisations line |',geoLocalisations[geoLocalisationKey].features[0]);
            if (geoLocalisations[geoLocalisationKey].error == undefined && geoLocalisations[geoLocalisationKey].features[0] != undefined) {
              var record = source[geoLocalisationKey];
              record[specificData.latitudePath] = geoLocalisations[geoLocalisationKey].features[0].geometry.coordinates[1];
              record[specificData.longitudePath] = geoLocalisations[geoLocalisationKey].features[0].geometry.coordinates[0];
              result.push(record);
            }
          }

          resolve(result);
        });*/
      //console.log(adresseCSV);
      var urlString = 'http://api-adresse.data.gouv.fr/search/csv/';
      //urlString = urlString + encodeURI(addressGouvFrFormated);

      const parsedUrl = this.url.parse(urlString);
      const requestOptions = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        port: parsedUrl.port,
        method: 'POST'
      }
      const request = this.http.request(requestOptions, response => {
        const hasResponseFailed = response.status >= 400;
        var responseBody = '';

        if (hasResponseFailed) {
          reject(`Request to ${response.url} failed with HTTP ${response.status}`);
        }

        response.on('data', chunk => {
          responseBody += chunk.toString()
        });

        response.on('end', function() {
          //console.log(responseBody);
          try {
            //resolve(JSON.parse(responseBody));

          } catch (e) {
            resolve({
              error: e
            });
          }
        }.bind(this));
      });
      request.on('error', reject);
      request.end('data='+adresseCSV);
      resolve([]);

    })
  },
  pull: function(data, flowData) {
    //console.log('Object Transformer | pull : ',data,' | ',flowData[0].length);
    return this.geoLocalise(flowData[0].data, data.specificData);
  }
}
