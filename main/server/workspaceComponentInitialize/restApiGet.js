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
    const { pathToRegexp, match, parse, compile } = require("path-to-regexp");
    this.pathToRegexp=pathToRegexp;
    this.request = require('request')
    this.config = require('../../configuration')
  }

  initialise(router, amqp) {
    //ALL feature support by restApiPost
    // router.get('*', async (req, res, next) => {
    //   const urlRequiered = req.params[0].split('/')[1]
    //   const urlRequieredFull = req.params[0].replace('/','')
    //   const query = req.query
    //   let targetedComponent
    //   const regex = /([^-]*)-.*/g
    //   let componentId = regex.exec(urlRequiered)[1]
    //   console.log('componentId',componentId);
    //   let component;
    //   try {
    //     let component = await this.workspace_component_lib.get({
    //       _id: componentId,
    //       module: 'restApiGet'
    //     });
    //     if (component != undefined && component.specificData.url != undefined) {
    //       req.setTimeout(0);
    //       let keys = []
    //       let regexp = this.pathToRegexp(component.specificData.url, keys);
    //       if (regexp.test(urlRequieredFull)) {
    //         let values = regexp.exec(urlRequieredFull);
    //
    //         let valueIndex = 1;
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
    //       }else {
    //         // console.log('NO MATH!!');
    //       }
    //
    //       this.request.post(this.config.engineUrl + '/work-ask/' + component._id, {
    //           body: {
    //             queryParams: {
    //               query: req.query,
    //               body: req.body,
    //               headers :req.headers
    //             }
    //           },
    //           json: true
    //         }
    //         , (err, data) => {
    //           // console.log(err,data);
    //           try {
    //             if (err) {
    //               console.error("restpiIGet request error", err);
    //               res.status(500).send(err)
    //             } else {
    //               if (data.statusCode != 200) {
    //                 res.status(500).send({
    //                   engineResponse: data.body
    //                 })
    //               } else {
    //                 let dataToSend
    //                 try {
    //                   dataToSend = data.body.data
    //                 } catch (e) {
    //                   console.log(e);
    //                 }
    //                 // const dataToSend = data.body.data
    //                 if (component.specificData != undefined) { // exception in previous promise
    //                   if (component.specificData.contentType != undefined) {
    //                     // console.log(component.specificData.contentType);
    //                     if (dataToSend == undefined) {
    //                       res.send(new Error('data in flow is not defined. please check your configuration'))
    //                     } else if (component.specificData.contentType.search('application/vnd.ms-excel') != -1) {
    //                       res.setHeader('content-type', component.specificData.contentType)
    //                       this.dataTraitment.type.buildFile(undefined, JSON.stringify(dataToSend), undefined, true, component.specificData.contentType).then((result) => {
    //                         res.setHeader('Content-disposition', 'attachment; filename=' + component.specificData.url + '.xlsx')
    //                         res.send(result)
    //                       })
    //                     } else if (component.specificData.contentType.search('rdf') != -1) {
    //
    //                       res.setHeader('content-type', component.specificData.contentType)
    //                       this.dataTraitment.type.buildFile(undefined, JSON.stringify(dataToSend), undefined, true, component.specificData.contentType).then((result) => {
    //                         res.setHeader('Content-disposition', 'attachment; filename=' + component.specificData.url + '.xml')
    //                         res.send(result)
    //                       })
    //                     } else if (component.specificData.contentType.search('xml') != -1) {
    //                       res.setHeader('content-type', component.specificData.contentType)
    //                       let out = this.xmlJS.js2xml(dataToSend, {
    //                         compact: true,
    //                         ignoreComment: true,
    //                         spaces: 0
    //                       });
    //                       out = out.replace(/\0/g, '');
    //                       // console.log('xml out', out);
    //                       // console.log(Buffer.byteLength(out, 'utf8') + " bytes");
    //                       res.send(out)
    //                       // res.end();
    //                     } else if (component.specificData.contentType.search('yaml') != -1) {
    //                       res.setHeader('content-type', component.specificData.contentType)
    //                       res.send(this.json2yaml.stringify(dataToSend));
    //                     } else if (component.specificData.contentType.search('json') != -1) {
    //                       res.setHeader('content-type', component.specificData.contentType)
    //                       var buf = Buffer.from(JSON.stringify(dataToSend))
    //                       res.send(buf)
    //                     } else {
    //                       res.send(new Error('no supported madiatype'))
    //                       // return ('type mime non géré')
    //                     }
    //                   } else {
    //                     res.send(new Error('content-type have to be set'))
    //                     // return ('type mime non géré')
    //                   }
    //                 }
    //               }
    //             }
    //           } catch (e) {
    //             console.log('api error after engine call', e);
    //             res.send(new Error(e.message))
    //           }
    //
    //         });
    //     } else {
    //       res.status(404).send('no API for this url');
    //     }
    //   } catch (e) {
    //     console.log(e);
    //     res.status(404).send('no API for this url');
    //
    //   }
    // })
  }
}

module.exports = new RestApiGet()
