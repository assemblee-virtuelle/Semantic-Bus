module.exports = {
  type: 'Google geolocaliser',
  description: 'interoge l api google geocode pour transo une adresse en latitude et longitude',
  editor: 'google-geolocaliser-editor',
  url: require('url'),
  https: require('https'),
  initComponent: function(entity) {
    //console.log('Object Transformer | initComponent : ',entity);

    /*if (entity.specificData.transformObject == undefined) {
      entity.specificData.transformObject = {};
    }*/
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

        goePromises.push(
          new Promise((resolve, reject) => {

            var apiKey = 'AIzaSyBAg94NXmqVLFeIWGBcQ4cweA7YXC3ndLI'
            //var apiKey = 'AIzaSyAGHo04gqJWKF8uVYhsWVRY_zo61YtemMQ'
            var addressGoogleFormated = 'address='
            addressGoogleFormated = addressGoogleFormated + (address.street ? address.street + ',+' : '');
            addressGoogleFormated = addressGoogleFormated + (address.town ? address.town + ',+' : '');
            addressGoogleFormated = addressGoogleFormated + (address.postalCode ? address.postalCode + ',+' : '');
            addressGoogleFormated = addressGoogleFormated + (address.country ? address.country + ',+' : '');
            var urlString = 'https://maps.googleapis.com/maps/api/geocode/json?';
            urlString = urlString + addressGoogleFormated;
            urlString = urlString + '&key='+apiKey;

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

      Promise.all(goePromises).then(geoLocalisations => {
        var result= [];
        //console.log('geoLocalise | geoLocalisations result |', geoLocalisations);
        for (var geoLocalisationKey in geoLocalisations) {
          //        console.log('geoLocalise | geoLocalisations line |',geoLocalisations[geoLocalisationKey].results[0].geometry.location);
          if (geoLocalisations[geoLocalisationKey].status == 'OK') {
            var record = source[geoLocalisationKey];
            record[specificData.latitudePath] = geoLocalisations[geoLocalisationKey].results[0].geometry.location.lat;
            record[specificData.longitudePath] = geoLocalisations[geoLocalisationKey].results[0].geometry.location.lng;
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
