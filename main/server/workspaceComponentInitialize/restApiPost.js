'use strict'
class RestApiPost {
  constructor() {
    this.type = 'HTTP provider'
    this.description = `Mettre à disposition une API HTTP; Permettre à votre workflow d'être appelé par une requete HTTP.`
    this.editor = 'rest-api-post-editor'
    this.graphIcon = 'Post_provider.svg'
    this.tags = [
        'http://semantic-bus.org/data/tags/inComponents',
        'http://semantic-bus.org/data/tags/outComponents',
        'http://semantic-bus.org/data/tags/APIComponents'
      ],
      this.stepNode = false
    this.workspace_component_lib = require('../../../core/lib/workspace_component_lib')
    this.data2xml = require('data2xml');
    this.xmlJS = require('xml-js');
    this.dataTraitment = require('../../../core/dataTraitmentLibrary/index.js')
    this.json2yaml = require('json2yaml')
    this.request = require('request')
    this.config = require('../../configuration')
    const {
      pathToRegexp,
      match,
      parse,
      compile
    } = require("path-to-regexp");
    this.pathToRegexp = pathToRegexp;
  }

  initialise(router) {
    router.all('*', async (req, res, next) => {
      const urlRequiered = req.params[0].split('/')[1];
      const urlRequieredFull = req.params[0].replace('/', '');
      const query = req.query;
      // console.log();
      let targetedComponent;
      const regex = /([^-]*)-.*/g;
      let componentId = regex.exec(urlRequiered)[1];
      let component;
      try {
        let component = await this.workspace_component_lib.get({
          _id: componentId,
        });
        if (component != undefined && component.specificData.url != undefined) {
          req.setTimeout(0);
          let keys = []
          let regexp = this.pathToRegexp(component.specificData.url, keys);
          if (regexp.test(urlRequieredFull)) {
            let values = regexp.exec(urlRequieredFull);

            let valueIndex = 1;
            for (let key of keys) {
              let value = values[valueIndex]
              query[key.name] = value
              valueIndex++
            }
            for (let queryKey in query) {
              try {
                query[queryKey] = JSON.parse(query[queryKey])
              } catch (e) {
              }
            }
          } else {
            // console.log('NO MATH!!');
          }

          // console.log('req.body',req.body);

          this.request.post(this.config.engineUrl + '/work-ask/' + component._id, {
              body: {
                queryParams: {
                  query: req.query,
                  body: req.body,
                  headers: req.headers,
                  method :req.method
                },
                pushData: req.body
              },
              json: true
            }
            // eslint-disable-next-line handle-callback-err
            , (err, data) => {
              // console.log(err,data);
              try {
                if (err) {
                  console.error("restpiIPost request error", err);
                  res.status(500).send(err)
                } else {
                  if (data.statusCode != 200) {
                    res.status(500).send({
                      engineResponse: data.body
                    })
                  } else {
                    let dataToSend
                    try {
                      dataToSend = data.body.data
                    } catch (e) {
                      console.log(e);
                    }
                    // const dataToSend = data.body.data
                    // console.log('dataToSend',dataToSend);
                    if (component.specificData != undefined) { // exception in previous promise
                      if (component.specificData.contentType != undefined && component.specificData.contentType!='') {
                        // console.log('contentType',component.specificData.contentType);
                        if (dataToSend == undefined) {
                          res.status(201).send()
                        } else if (component.specificData.contentType.search('application/vnd.ms-excel') != -1) {
                          res.setHeader('content-type', component.specificData.contentType)
                          this.dataTraitment.type.buildFile(undefined, JSON.stringify(dataToSend), undefined, true, component.specificData.contentType).then((result) => {
                            res.setHeader('Content-disposition', 'attachment; filename=' + component.specificData.url + '.xlsx')
                            res.send(result)
                          })
                        } else if (component.specificData.contentType.search('rdf') != -1) {

                          res.setHeader('content-type', component.specificData.contentType)
                          this.dataTraitment.type.buildFile(undefined, JSON.stringify(dataToSend), undefined, true, component.specificData.contentType).then((result) => {
                            res.setHeader('Content-disposition', 'attachment; filename=' + component.specificData.url + '.xml')
                            res.send(result)
                          })
                        } else if (component.specificData.contentType.search('xml') != -1) {
                          res.setHeader('content-type', component.specificData.contentType)
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
                          res.status(400).send('no supported content-type')
                          // res.send(new Error('no supported madiatype'))
                          // return ('type mime non géré')
                        }
                      } else {
                        console.log('ERROR');
                        res.status(400).send(`content-type have to be set`)
                        // return ('type mime non géré')
                      }
                    }
                  }
                }
              } catch (e) {
                console.log('api error after engine call', e);
                res.send(new Error(e.message))
              }
            });
        } else {
          res.status(404).send('no API for this url');
        }
      } catch (e) {
        console.log(e);
        res.status(404).send('no API for this url');
      }
      // this.workspace_component_lib.get({
      //   'specificData.url': urlRequiered
      // }).then(component => {
      //   const queryParams={
      //     body : req.body
      //   }
      //   // console.log('component API',component);
      //   this.request.post(this.config.engineUrl + '/work-ask/' + component._id,
      //     {
      //       body: { pushData: req.body, queryParams: queryParams, direction: 'work' },
      //       json: true
      //     }
      //     // eslint-disable-next-line handle-callback-err
      //     , (err, dataToSend) => {
      //       // console.log(err,dataToSend.statusCode);
      //       if (err!=null && err.code) {
      //         res.status(err.code).send(err.message)
      //       } else if((err!=null)){
      //         res.status(500).send(err.message)
      //       } else {
      //         // next(err)
      //         res.status(dataToSend.statusCode).send(dataToSend.body.data)
      //       }
      //       // res.send(dataToSend.body.data)
      //     })
      // })
    })
  }
}

module.exports = new RestApiPost()
