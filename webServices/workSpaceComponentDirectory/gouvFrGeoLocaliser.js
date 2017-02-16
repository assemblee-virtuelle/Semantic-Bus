module.exports = {
  type: 'adresse.data.gouv.fr geolocaliser',
  description: 'interroger l api adresse.data.gouv pour transo une adresse en latitude et longitude',
  editor: 'data-gouv-geolocaliser-editor',
  url: require('url'),
  http: require('http'),
  initComponent: function(entity) {
    return entity;
  },
  geoLocalise: function(source, specificData) {

    return new Promise((resolve, reject) => {

      var goePromises = [];


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
          goePromises.push(
            new Promise((resolve, reject) => {

              //var apiKey = 'AIzaSyBAg94NXmqVLFeIWGBcQ4cweA7YXC3ndLI'
              //var apiKey = 'AIzaSyAGHo04gqJWKF8uVYhsWVRY_zo61YtemMQ'
              var urlString = 'http://api-adresse.data.gouv.fr/search/?q=';
              urlString = urlString + encodeURI(addressGouvFrFormated);
              //urlString = urlString + '&key='+apiKey;

              console.log('geoLocalise | urlString |', urlString);

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
              const request = this.http.request(requestOptions, response => {
                const hasResponseFailed = response.status >= 400;
                var responseBody = '';

                if (hasResponseFailed) {
                  reject(`Request to ${response.url} failed with HTTP ${response.status}`);
                }

                /* the response stream's (an instance of Stream) current data. See:
                 * https://nodejs.org/api/stream.html#stream_event_data */
                response.on('data', chunk => {
                  //console.log(chunk.toString());
                  responseBody += chunk.toString()
                });

                // once all the data has been read, resolve the Promise
                response.on('end', () => {
                  console.log(responseBody);
                  resolve(JSON.parse(responseBody));
                });
              });

              /* if there's an error, then reject the Promise
               * (can be handled with Promise.prototype.catch) */
              request.on('error', reject);
              request.end();
            })
          );
        }
      }
      Promise.all(goePromises).then(geoLocalisations => {
        var result = [];
        console.log('geoLocalise | geoLocalisations result |', geoLocalisations);
        for (var geoLocalisationKey in geoLocalisations) {
          //console.log('geoLocalise | geoLocalisations line |',geoLocalisations[geoLocalisationKey].features[0]);
          if (geoLocalisations[geoLocalisationKey].features[0] != undefined) {
            var record = source[geoLocalisationKey];
            record[specificData.latitudePath] = geoLocalisations[geoLocalisationKey].features[0].geometry.coordinates[1];
            record[specificData.longitudePath] = geoLocalisations[geoLocalisationKey].features[0].geometry.coordinates[0];
            result.push(record);
          }
        }

        resolve(result);
      });

    })
  },
  test: function(data, flowData) {
    //console.log('Object Transformer | test : ',data,' | ',flowData[0].length);
    return this.geoLocalise(flowData[0], data.specificData);
  }
}
