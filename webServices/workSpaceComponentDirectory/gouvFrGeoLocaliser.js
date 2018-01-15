module.exports = {
  type: 'adresse.data.gouv.fr geolocaliser',
  description: 'interroger l api adresse.data.gouv pour transo une adresse en latitude et longitude',
  editor: 'data-gouv-geolocaliser-editor',
  graphIcon: 'dataGouvFrGeolocaliser.png',
  tags:[
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleGeocodeComponents'
  ],
  url: require('url'),
  http: require('http'),
  RequestCount :0,
  getPriceState: function(){
    return new Promise((resolve,reject)=>{
      resolve({state:true})
    })
  },
  initComponent: function(entity) {
    return entity;
  },
  // buildWaterFall: function(promisesTab) {
  //   return new Promise((resolve, reject) => {
  //     var currentPromise = promisesTab[promisesTab.lenth - 1];
  //     //console.log(promisesTab.lenth);
  //     if (promisesTab.lenth > 1) {
  //       var previousPromises = promisesTab.slice(0, promisesTab - 2);
  //       buildWaterFall(previousPromises).then(previousData => {
  //         /*currentPromise.then(currentData => {
  //           previousData.push(currentData);
  //           resolve(previousData);
  //         })*/
  //         resolve(previousData);
  //       })
  //     } else {
  //       currentPromise.then(currentData => {
  //         resolve([currentData]);
  //       })
  //     }
  //   });
  // },
  geoLocalise: function(source, specificData) {
    //console.log('adress.data.gouv geoLocalise',specificData.countryPath);
    return new Promise((resolve, reject) => {

      var goePromises = [];
      var sourceKey = 0;
      var interval = setInterval(function() {
        if (sourceKey >= source.length) {
          clearInterval(interval);

          Promise.all(goePromises).then(geoLocalisations => {
            var result = [];
            //console.log('geoLocalise | geoLocalisations result |', geoLocalisations);
            for (var geoLocalisationKey in geoLocalisations) {
              console.log(geoLocalisations[geoLocalisationKey]);
              if (geoLocalisations[geoLocalisationKey].error == undefined && geoLocalisations[geoLocalisationKey].features[0] != undefined) {
                //console.log('geoLocalise | geoLocalisations line |',geoLocalisations[geoLocalisationKey]);
                //console.log('geoLocalise | geoLocalisations key |', geoLocalisationKey);
                var record = source[geoLocalisationKey];
                record[specificData.latitudePath] = geoLocalisations[geoLocalisationKey].features[0].geometry.coordinates[1];
                record[specificData.longitudePath] = geoLocalisations[geoLocalisationKey].features[0].geometry.coordinates[0];
                result.push(record);
              } else {
                //console.log(geoLocalisations[geoLocalisationKey]);
              }
            }

            resolve({
              data: result
            });
          });
        } else {
          this.RequestCount++;
          //console.log('RequestCount',this.RequestCount);
          var record = source[sourceKey];
          var address = {
            street: record[specificData.streetPath],
            town: record[specificData.townPath],
            postalCode: record[specificData.postalCodePath],
            country: record[specificData.countryPath],
          }

          var postalCodeString = address.postalCode + '';
          if (postalCodeString.length == 4) {
            address.postalCode = '0' + postalCodeString;
          }

          var addressGouvFrFormated = ''
          addressGouvFrFormated = addressGouvFrFormated + (address.street ? address.street + ' ' : '');
          addressGouvFrFormated = addressGouvFrFormated + (address.town ? address.town + ' ' : '');
          addressGouvFrFormated = addressGouvFrFormated + (address.postalCode ? address.postalCode + ' ' : '');
          //TODO notify user the adresse is too long (200)
          addressGouvFrFormated=addressGouvFrFormated.substr(0,199);
          //addressGouvFrFormated = addressGouvFrFormated + (address.country ? address.country + ' ' : '');
          if (addressGouvFrFormated.length > 0) {
            goePromises.push(
              new Promise((resolve, reject) => {
                //var apiKey = 'AIzaSyBAg94NXmqVLFeIWGBcQ4cweA7YXC3ndLI'
                //var apiKey = 'AIzaSyAGHo04gqJWKF8uVYhsWVRY_zo61YtemMQ'
                var urlString = 'http://api-adresse.data.gouv.fr/search/?q=';
                urlString = urlString + encodeURI(addressGouvFrFormated);
                //urlString = urlString + '&key='+apiKey;

                //console.log('geoLocalise | urlString |', urlString);

                const parsedUrl = this.url.parse(urlString);
                //console.log('geoLocalise | parsedUrl |', parsedUrl);
                //console.log('REST Get JSON | makerequest | port',parsedUrl.port);
                //  console.log('REST Get JSON | makerequest | host',parsedUrl.hostname);
                let keepAliveAgent = new this.http.Agent({
                  keepAlive: true
                });
                const requestOptions = {
                  hostname: parsedUrl.hostname,
                  path: parsedUrl.path,
                  port: parsedUrl.port,
                  method: 'GET',
                  agent: keepAliveAgent
                }
                //          console.log(requestOptions);
                // console.log('JUST before adresse.data.gouv request', specificData.countryPath);
                try {
                  //resolve({error:'dummy'})
                  const request = this.http.request(requestOptions, response => {
                      // console.log('JUST after adresse.data.gouv request', specificData.countryPath);
                    const hasResponseFailed = response.status >= 400;
                    var responseBody = '';

                    if (hasResponseFailed) {
                      // console.log({
                      //   error: 'request status fail'
                      // });
                      resolve({
                        error: 'Request to ${response.url} failed with HTTP ${response.status}'
                      });
                    }

                    response.on('data', chunk => {
                      //console.log(chunk.toString());
                      responseBody += chunk.toString()
                    });

                    // once all the data has been read, resolve the Promise
                    response.on('end', function() {
                      try {
                        //console.log(responseBody);
                        //console.log('try');
                        resolve(JSON.parse(responseBody));
                        //console.log('ok',sourceKey);
                      } catch (e) {
                        //console.log('parse fail');
                        resolve({
                          error: e
                        });
                        //throw e;
                      }
                    }.bind(this));

                  });




                  request.on('error', function(e) {
                    //console.log('request fail :', e);
                    resolve({
                      error: e
                    });
                  });
                  //console.log('start');
                  request.end();
                } catch (e) {
                  //console.log('global socket adress.data.gouv fail', e);
                  resolve({
                    error: e
                  });
                }
              })
            );
          } else {
            goePromises.push(
              new Promise((resolve, reject) => {
                resolve({
                  error: 'no adresse'
                });
              })
            );
          }

          sourceKey++;
        }

      }.bind(this), 200);

    })
  },
  pull: function(data, flowData) {
    //console.log('Object Transformer | pull : ',data,' | ',flowData[0].length);
    return this.geoLocalise(flowData[0].data, data.specificData);
  }
}
