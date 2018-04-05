"use strict";
module.exports = {
  type: 'Google geolocaliser',
  description: 'interoge l api google geocode pour transo une adresse en latitude et longitude',
  editor: 'google-geolocaliser-editor',
  url: require('url'),
  https: require('https'),
  graphIcon: 'googleGeolocaliser.png',
  tags: [
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleGeocodeComponents'
  ],
  initComponent: function(entity) {
    return entity;
  },

  getPriceState: function(specificData, moPrice, recordPrice) {
    if (specificData.googleToken != null) {
      return {
        moPrice: moPrice,
        recordPrice: 0
      };
    } else {
      return {
        moPrice: moPrice,
        recordPrice: recordPrice
      };
    }
  },
  geoLocalise: function(source, specificData) {

    return new Promise((resolve, reject) => {

      var goePromises = [];
      //var errorArray = [];


      for (let record of source) {
        var address = {
          street: record[specificData.streetPath],
          town: record[specificData.townPath],
          postalCode: record[specificData.postalCodePath],
          country: record[specificData.countryPath],
        }

        goePromises.push(
          new Promise((resolve, reject) => {

            var apiKey = 'AIzaSyBJElsvbr_6obYaeTd2oOyiEd97XjSNyY8'
            //var apiKey = 'AIzaSyAGHo04gqJWKF8uVYhsWVRY_zo61YtemMQ'
            var addressGoogleFormated = 'address='
            addressGoogleFormated = addressGoogleFormated + (address.street ? address.street + ',+' : '');
            addressGoogleFormated = addressGoogleFormated + (address.town ? address.town + ',+' : '');
            addressGoogleFormated = addressGoogleFormated + (address.postalCode ? address.postalCode + ',+' : '');
            addressGoogleFormated = addressGoogleFormated + (address.country ? address.country + ',+' : '');
            var urlString = 'https://maps.googleapis.com/maps/api/geocode/json?';
            urlString = urlString + addressGoogleFormated;
            urlString = urlString + '&key=' + apiKey;

            //console.log('geoLocalise | urlString |', urlString);

            const parsedUrl = this.url.parse(urlString);
            //console.log('REST Get JSON | makerequest | port',parsedUrl.port);
            //  console.log('REST Get JSON | makerequest | host',parsedUrl.hostname);
            const requestOptions = {
              hostname: parsedUrl.hostname,
              path: parsedUrl.path,
              port: parsedUrl.port,
              method: 'GET'
            }
            //          console.log(requestOptions);
            const request = this.https.request(requestOptions, response => {
              const hasResponseFailed = response.status >= 400;
              var responseBody = '';

              if (hasResponseFailed) {
                //errorArray.push(new Error(`Request to ${response.url} failed with HTTP ${response.status}`))
                reject(new Error(`Request to ${response.url} failed with HTTP ${response.status}`));

              }

              /* the response stream's (an instance of Stream) current data. See:
               * https://nodejs.org/api/stream.html#stream_event_data */
              response.on('data', chunk => {
                //console.log(chunk.toString());
                responseBody += chunk.toString()
              });

              // once all the data has been read, resolve the Promise
              response.on('end', () => {
                let responseBodyObject = JSON.parse(responseBody);
                //console.log(responseBodyObject);
                if (responseBodyObject.error_message == undefined) {
                  resolve(JSON.parse(responseBody));
                } else {
                  // console.log(responseBodyObject.error_message);
                  // errorArray.push(new Error(responseBodyObject.error_message))
                  reject(new Error(responseBodyObject.error_message));
                }


              });
            });

            /* if there's an error, then reject the Promise
             * (can be handled with Promise.prototype.catch) */
            request.on('error', reject);
            request.end();
          })
        );
      }

      Promise.all(goePromises).then(geoLocalisations => {

        var result = [];
        //console.log('geoLocalise | geoLocalisations result |', geoLocalisations);
        for (var geoLocalisationKey in geoLocalisations) {
          //        console.log('geoLocalise | geoLocalisations line |',geoLocalisations[geoLocalisationKey].results[0].geometry.location);
          if (geoLocalisations[geoLocalisationKey].status == 'OK') {
            var record = source[geoLocalisationKey];
            record[specificData.latitudePath] = geoLocalisations[geoLocalisationKey].results[0].geometry.location.lat;
            record[specificData.longitudePath] = geoLocalisations[geoLocalisationKey].results[0].geometry.location.lng;
            result.push(record);
          } else {
            //console.log('google geocode failed');
          }
        }

        resolve({
          data: result
        });
      }).catch(err => {
        //console.log('ALL ERROR', errorArray);
        reject(err)
      });

    })
  },
  pull: function(data, flowData) {
    //console.log('Object Transformer | pull : ',data,' | ',flowData[0].length);
    return this.geoLocalise(flowData[0].data, data.specificData);
  }
}
