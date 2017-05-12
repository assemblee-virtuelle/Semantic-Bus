module.exports = {
  type: 'adresse.data.gouv.fr geolocaliser',
  description: 'interroger l api adresse.data.gouv pour transo une adresse en latitude et longitude',
  editor: 'data-gouv-geolocaliser-editor',
  url: require('url'),
  http: require('http'),
  //waterfall: require('promise-waterfall'),
  initComponent: function(entity) {
    return entity;
  },
  buildWaterFall: function(promisesTab) {
    return new Promise((resolve, reject) => {
      var currentPromise = promisesTab[promisesTab.lenth - 1];
      //console.log(promisesTab.lenth);
      if (promisesTab.lenth > 1) {
        var previousPromises = promisesTab.slice(0, promisesTab - 2);
        buildWaterFall(previousPromises).then(previousData => {
          /*currentPromise.then(currentData => {
            previousData.push(currentData);
            resolve(previousData);
          })*/
          resolve(previousData);
        })
      } else {
        currentPromise.then(currentData => {
          resolve([currentData]);
        })
      }
    });
  },
  geoLocalise: function(source, specificData) {

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

            resolve({data:result});
          });
        } else {

          var record = source[sourceKey];
          var address = {
            street: record[specificData.streetPath],
            town: record[specificData.townPath],
            postalCode: record[specificData.postalCodePath],
            country: record[specificData.countryPath],
          }

          var postalCodeString = address.postalCode+'';
          if (postalCodeString.length==4){
            address.postalCode = '0'+postalCodeString;
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

                //console.log('geoLocalise | urlString |', urlString);

                const parsedUrl = this.url.parse(urlString);
                //console.log('geoLocalise | parsedUrl |', parsedUrl);
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
                    console.log({
                      error: 'request status fail'
                    });
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
                      console.log('parse fail');
                      resolve({
                        error: e
                      });
                      //throw e;
                    }
                  }.bind(this));
                });


                request.on('error', function(e) {
                  console.log('request fail');
                  resolve({
                    error: e
                  });
                });
                //console.log('start');
                request.end();

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

      /*for (record of source) {
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


        } else {
          goePromises.push(
            new Promise((resolve, reject) => {
              resolve({
                error: 'no adresse'
              });
            })
          );
        }
      }*/


      /*  this.waterfall(goePromises).then(data => {
            console.log('OK');
          }).catch(err => {
            console.log('Fail');
          });*/

      /*this.buildWaterFall(goePromises).then(data=>{
        console.log("EPIC");
      });*/




      /*  var geoResolutions = [];
        var serialisedPromises = goePromises[0];
        goePromises.forEach(function(prom) {
          if (prom !== serialisedPromises) {
            //soluce1 pas fini
            serialisedPromises = new Promise((resolve, reject) => {
                serialisedPromises.then(data => {
                  geoResolutions.push(data);
                  return prom;
                })
              })
              //soluce 2 inspiré par ex
            serialisedPromises = serialisedPromises.then(function(data) {
              geoResolutions.push(data);
              return prom;
            });
          }
        });*/
      //resolve([]);



    })
  },
  test: function(data, flowData) {
    //console.log('Object Transformer | test : ',data,' | ',flowData[0].length);
    return this.geoLocalise(flowData[0].data, data.specificData);
  }
}
