module.exports = {
  type: 'data.gouv inverse geolocaliser',
  description: 'interoge l api adresse .data.gouv pour retrouver une adresse + CP + Insee depuis latitude et longitude',
  editor: 'data-gouv-inverse-geolocaliser-editor',
  graphIcon:'dataGouvFrInvGeo.png',
  tags:[
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleGeocodeComponents'
  ],
  url: require('url'),
  http: require('http'),
  initComponent: function(entity) {
    //console.log('Object Transformer | initComponent : ',entity);

    /*if (entity.specificData.transformObject == undefined) {
      entity.specificData.transformObject = {};
    }*/
    return entity;
  },

  inverseGeoLocalise: function(source, specificData) {

    return new Promise((resolve, reject) => {

      var goePromises = [];


      for (record of source) {
        var geoLoc = {
          lat: record[specificData.latitudePath],
          lng: record[specificData.longitudePath],
        }

        goePromises.push(
          new Promise((resolve, reject) => {

/*            var apiKey = 'AIzaSyBAg94NXmqVLFeIWGBcQ4cweA7YXC3ndLI'
            //var apiKey = 'AIzaSyAGHo04gqJWKF8uVYhsWVRY_zo61YtemMQ'
            var addressGoogleFormated = 'address='
            addressGoogleFormated = addressGoogleFormated + (address.street ? address.street + ',+' : '');
            addressGoogleFormated = addressGoogleFormated + (address.town ? address.town + ',+' : '');
            addressGoogleFormated = addressGoogleFormated + (address.postalCode ? address.postalCode + ',+' : '');
            addressGoogleFormated = addressGoogleFormated + (address.country ? address.country + ',+' : '');
            var urlString = 'https://maps.googleapis.com/maps/api/geocode/json?';
            urlString = urlString + addressGoogleFormated;
            urlString = urlString + '&key='+apiKey;*/
            urlString = 'http://api-adresse.data.gouv.fr/reverse/?lon='+geoLoc.lng+'&lat='+geoLoc.lat;

            //console.log('geoLocalise | urlString |', urlString);

            const parsedUrl = this.url.parse(urlString);
            //console.log('gouvInverse | request |',urlString);
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
              //console.log('gouvInverse | headers |',response.headers)
              var responseBody = '';

              if (hasResponseFailed) {
                reject(`Request to ${response.url} failed with HTTP ${response.status}`);
              }

              /* the response stream's (an instance of Stream) current data. See:
               * https://nodejs.org/api/stream.html#stream_event_data */
              response.on('data', chunk => {
                //console.log('gouvInverse | chunk |', chunk.toString());
                responseBody += chunk.toString();
              });

              // once all the data has been read, resolve the Promise
              response.on('end', () => {
                //console.log('gouvInverse | response |',responseBody);
                resolve(responseBody==""?undefined:JSON.parse(responseBody));
                //resolve({});
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
        //console.log('gouvInverse | ALL DONE');
        var result= [];
        //console.log('geoLocalise | geoLocalisations result |', geoLocalisations);
        for (var geoLocalisationKey in geoLocalisations) {
          //console.log('geoLocalise | geoLocalisations line |',geoLocalisations[geoLocalisationKey],' | ',geoLocalisations[geoLocalisationKey].features[0].properties);
          if (geoLocalisations[geoLocalisationKey]!= undefined) {
            var record = source[geoLocalisationKey];
            record[specificData.CPPath] = geoLocalisations[geoLocalisationKey].features[0].properties.postcode;
            record[specificData.INSEEPath] = geoLocalisations[geoLocalisationKey].features[0].properties.citycode;
            result.push(record);
          }
        }
        //console.log('gouvInverse | result |',result);
        resolve({data:result});
      });

    })
  },
  pull: function(data, flowData) {
    //console.log('Object Transformer | pull : ',data,' | ',flowData[0].length);
    return this.inverseGeoLocalise(flowData[0].data, data.specificData);
  }
}
