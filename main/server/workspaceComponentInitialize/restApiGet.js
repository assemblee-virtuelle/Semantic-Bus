'use strict'
class RestApiGet {
  constructor() {
    this.type = 'Get provider'
    this.description = 'Exposer un flux de donnée sur une API http GET.'
    this.editor = 'rest-api-get-editor'
    this.graphIcon = 'Get_provider.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/outComponents',
      'http://semantic-bus.org/data/tags/APIComponents'
    ]
    this.stepNode = false
    this.workspace_component_lib = require('../../../core/lib/workspace_component_lib')
    this.data2xml = require('data2xml');
    this.xmlJS = require('xml-js');
    this.dataTraitment = require('../../../core/dataTraitmentLibrary/index.js')
    this.json2yaml = require('json2yaml')
    this.pathToRegexp = require('path-to-regexp')
    this.request = require('request')
    this.config = require('../../configuration')
  }

  initialise(router, amqp) {

    router.get('*', async (req, res, next) => {

      // console.log('api');
      // console.error('API text ERROR');
      // console.warn('API text WARN');
      // eslint-disable-next-line node/no-deprecated-api
      const urlRequiered = req.params[0].split('/')[1]
      // console.log('urlRequiered',urlRequiered);
      const query = req.query
      let targetedComponent
      const regex = /([^-]*)-.*/g
      let componentId = regex.exec(urlRequiered)[1]
      // console.log('componentId',componentId);
      let component;
      try {
        let component = await this.workspace_component_lib.get({
          _id: componentId,
          module: 'restApiGet'
        });
        console.log('component',component);
        if (component != undefined && component.specificData.url != undefined) {
          let keys = []
          let regexp = this.pathToRegexp(component.specificData.url, keys)
          if (regexp.test(urlRequiered)) {
            let values = regexp.exec(urlRequiered)
            let valueIndex = 1
            for (let key of keys) {
              let value = values[valueIndex]
              query[key.name] = value
              valueIndex++
            }
            for (let queryKey in query) {
              try {
                // console.log('1',query[queryKey]);
                query[queryKey] = JSON.parse(query[queryKey])
              } catch (e) {
                // console.log('2',query[queryKey]);
              }
            }
          }

          this.request.post(this.config.engineUrl + '/work-ask/' + component._id, {
              body: {
                queryParams: {
                  query: req.query,
                  body: req.body,
                }
              },
              json: true
            }
            // eslint-disable-next-line handle-callback-err
            , (err, data) => {
              // console.log(err,data);
              try {
                // console.log('ALLO 0');
                if (err) {
                  // console.error("restpiIGet request error",err);
                  res.status(500).send(err)
                } else {
                  console.log('ALLO 0.1 api',data.body);
                  if (data.statusCode != 200) {
                    console.log('ALLO 0.1.1 api');
                    res.status(500).send({
                      engineResponse: data.body
                    })
                  } else {
                    console.log('ALLO 0.1.2 api');
                    let dataToSend
                    try {
                      dataToSend = data.body.data
                    } catch (e) {
                      console.log('PUTAIN');
                    }
                    // const dataToSend = data.body.data
                    console.log('ALLO 1');
                    if (component.specificData != undefined) { // exception in previous promise
                      if (component.specificData.contentType != undefined) {
                        console.log('ALLO 2');
                        if (dataToSend == undefined) {
                          res.send(new Error('data in flow is not defined. please check your configuration'))
                        } else if (component.specificData.contentType.search('application/vnd.ms-excel') != -1) {
                          res.setHeader('content-type', component.specificData.contentType)
                          this.dataTraitment.type.buildFile(undefined, JSON.stringify(dataToSend), undefined, true, component.specificData.contentType).then((result) => {
                            res.setHeader('Content-disposition', 'attachment; filename=' + component.specificData.url + '.xlsx')
                            res.send(result)
                          })
                        } else if (component.specificData.contentType.search('xml') != -1) {
                          res.setHeader('content-type', targetedComponent.specificData.contentType)
                          // var convert = this.data2xml()
                          // var out = ''
                          // for (let key in dataToSend) {
                          //   out += convert(key, dataToSend[key])
                          //   // res.write(convert(key, dataToSend[key]))
                          // }
                          let out = this.xmlJS.js2xml(dataToSend, {
                            compact: true,
                            ignoreComment: true,
                            spaces: 0
                          });
                          out = out.replace(/\0/g, '');
                          // console.log('xml out', out);
                          // console.log(Buffer.byteLength(out, 'utf8') + " bytes");
                          res.send(out)
                          // res.end();
                        } else if (component.specificData.contentType.search('yaml') != -1) {
                          res.setHeader('content-type', component.specificData.contentType)
                          res.send(this.json2yaml.stringify(dataToSend));
                        } else if (component.specificData.contentType.search('json') != -1) {
                          res.setHeader('content-type', component.specificData.contentType)
                          var buf = Buffer.from(JSON.stringify(dataToSend))
                          res.send(buf)
                        } else {
                          res.send(new Error('no supported madiatype'))
                          // return ('type mime non géré')
                        }
                      } else {
                        res.send(new Error('content-type have to be set'))
                        // return ('type mime non géré')
                      }
                    }
                  }
                }
              } catch (e) {
                console.log('api error after engine call',e);
                res.send(new Error(e.message))
              }

            });
          // res.json({ok:'ok'});
        } else {
          res.status(404).send('no API for this url');
        }
      } catch (e) {
        console.log(e);
        res.status(404).send('no API for this url');

      }



      // this.workspace_component_lib.get_all({
      //   module: 'restApiGet'
      // }).then(components => {
      //   // console.log('components',components);
      //   let matched = false
      //   for (let component of components) {
      //     if (component.specificData.url != undefined) {
      //       let keys = []
      //       let regexp = this.pathToRegexp(component.specificData.url, keys)
      //       // console.log('url',component.specificData.url);
      //       // console.log('keys',keys);
      //       if (regexp.test(urlRequiered)) {
      //         matched = true
      //         targetedComponent = component
      //         let values = regexp.exec(urlRequiered)
      //         let valueIndex = 1
      //         for (let key of keys) {
      //           let value = values[valueIndex]
      //           query[key.name] = value
      //           valueIndex++
      //         }
      //         for (let queryKey in query) {
      //           try {
      //             // console.log('1',query[queryKey]);
      //             query[queryKey] = JSON.parse(query[queryKey])
      //           } catch (e) {
      //             // console.log('2',query[queryKey]);
      //           }
      //         }
      //         break
      //       }
      //     }
      //   }
      //   // console.log('ALLO-1',matched);
      //   // if (!matched) {
      //   //   //console.log('ERROR!!!');
      //   //   return new Promise((resolve, reject) => {
      //   //     res.status(404).send('no API for this url');
      //   //     // eslint-disable-next-line prefer-promise-reject-errors
      //   //     // reject({
      //   //     //   codeHTTP: 404,
      //   //     //   message: { detail: 'no API for this url' }
      //   //     // })
      //   //   })
      //   // } else {
      //   //   this.request.post(this.config.engineUrl + '/work-ask/' + targetedComponent._id, {
      //   //       body: {
      //   //         queryParams: {
      //   //           query: req.query,
      //   //           body : req.body,
      //   //         }
      //   //       },
      //   //       json: true
      //   //     }
      //   //     // eslint-disable-next-line handle-callback-err
      //   //     , (err, data) => {
      //   //       // console.log(err,data);
      //   //       if (err) {
      //   //         // console.error("restpiIGet request error",err);
      //   //         res.status(500).send(err)
      //   //       } else {
      //   //         if (data.statusCode != 200) {
      //   //           res.status(500).send({
      //   //             engineResponse: data.body
      //   //           })
      //   //         } else {
      //   //           const dataToSend = data.body.data
      //   //
      //   //           if (targetedComponent.specificData != undefined) { // exception in previous promise
      //   //             if (targetedComponent.specificData.contentType != undefined) {
      //   //               if (dataToSend == undefined) {
      //   //                 res.send(new Error('data in flow is not defined. please check your configuration'))
      //   //               } else if (targetedComponent.specificData.contentType.search('application/vnd.ms-excel') != -1) {
      //   //                 res.setHeader('content-type', targetedComponent.specificData.contentType)
      //   //                 this.dataTraitment.type.buildFile(undefined, JSON.stringify(dataToSend), undefined, true, targetedComponent.specificData.contentType).then((result) => {
      //   //                   res.setHeader('Content-disposition', 'attachment; filename=' + targetedComponent.specificData.url + '.xlsx')
      //   //                   res.send(result)
      //   //                 })
      //   //               } else if (targetedComponent.specificData.contentType.search('xml') != -1) {
      //   //                 res.setHeader('content-type', targetedComponent.specificData.contentType)
      //   //                 // var convert = this.data2xml()
      //   //                 // var out = ''
      //   //                 // for (let key in dataToSend) {
      //   //                 //   out += convert(key, dataToSend[key])
      //   //                 //   // res.write(convert(key, dataToSend[key]))
      //   //                 // }
      //   //                 let out=this.xmlJS.js2xml(dataToSend, {compact: true, ignoreComment: true, spaces: 0});
      //   //                 out = out.replace(/\0/g, '');
      //   //                 // console.log('xml out', out);
      //   //                 // console.log(Buffer.byteLength(out, 'utf8') + " bytes");
      //   //                 res.send(out)
      //   //                 // res.end();
      //   //               } else if (targetedComponent.specificData.contentType.search('yaml') != -1) {
      //   //                 res.setHeader('content-type', targetedComponent.specificData.contentType)
      //   //                 res.send(this.json2yaml.stringify(dataToSend));
      //   //               } else if (targetedComponent.specificData.contentType.search('json') != -1) {
      //   //                 res.setHeader('content-type', targetedComponent.specificData.contentType)
      //   //                 var buf = Buffer.from(JSON.stringify(dataToSend))
      //   //                 res.send(buf)
      //   //               } else {
      //   //                 res.send(new Error('no supported madiatype'))
      //   //                 // return ('type mime non géré')
      //   //               }
      //   //             } else {
      //   //               res.send(new Error('content-type have to be set'))
      //   //               // return ('type mime non géré')
      //   //             }
      //   //           }
      //   //         }
      //   //       }
      //   //     })
      //   // }
      // })
    })
  }
}

module.exports = new RestApiGet()
