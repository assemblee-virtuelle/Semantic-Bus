'use strict'
class RestApiGet {
  constructor () {
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
    this.data2xml = require('data2xml')
    this.dataTraitment = require('../../../core/dataTraitmentLibrary/index.js')
    this.json2yaml = require('json2yaml')
    this.pathToRegexp = require('path-to-regexp')
    this.request = require('request')
    this.config = require('../../configuration')
  }

  initialise (router, amqp) {

    router.get('*', (req, res, next) => {
      console.log('api');

      // eslint-disable-next-line node/no-deprecated-api
      const urlRequiered = req.params[0].split('/')[1]
      console.log('urlRequiered',urlRequiered);
      const query = req.query
      let targetedComponent
      this.workspace_component_lib.get_all({
        module: 'restApiGet'
      }).then(components => {
        console.log('components',components);
        let matched = false
        for (let component of components) {
          if (component.specificData.url != undefined) {
            let keys = []
            let regexp = this.pathToRegexp(component.specificData.url, keys)
            console.log('url',component.specificData.url);
            console.log('keys',keys);
            if (regexp.test(urlRequiered)) {
              matched = true
              targetedComponent = component
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
              break
            }
          }
        }
        console.log('ALLO-1',matched);
        if (!matched) {
          console.log('ERROR!!!');
          return new Promise((resolve, reject) => {
            res.status(404).send('no API for this url');
            // eslint-disable-next-line prefer-promise-reject-errors
            // reject({
            //   codeHTTP: 404,
            //   message: { detail: 'no API for this url' }
            // })
          })
        } else {
          console.log('allo');
          this.request.post(this.config.engineUrl + '/work-ask/' + targetedComponent._id,
            { body: { pushData: req.body, query: req.query },
              json: true
            }
            // eslint-disable-next-line handle-callback-err
            , (err, data) => {
              const dataToSend = data.body.data

              if (targetedComponent.specificData != undefined) { // exception in previous promise
                if (targetedComponent.specificData.contentType != undefined) {
                  if (dataToSend == undefined) {
                    res.send(new Error('data in flow is not defined. please check your configuration'))
                  } else if (targetedComponent.specificData.contentType.search('application/vnd.ms-excel') != -1) {
                    res.setHeader('content-type', targetedComponent.specificData.contentType)
                    this.dataTraitment.type.buildFile(undefined, JSON.stringify(dataToSend), undefined, true, targetedComponent.specificData.contentType).then((result) => {
                      res.setHeader('Content-disposition', 'attachment; filename=' + targetedComponent.specificData.url + '.xlsx')
                      res.send(result)
                    })
                  } else if (targetedComponent.specificData.contentType.search('xml') != -1) {
                    res.setHeader('content-type', targetedComponent.specificData.contentType)
                    var convert = this.data2xml()
                    var out = ''
                    for (let key in dataToSend) {
                      out += convert(key, dataToSend[key])
                    }
                    res.send(out)
                  } else if (targetedComponent.specificData.contentType.search('yaml') != -1) {
                    res.setHeader('content-type', targetedComponent.specificData.contentType)
                    return (this.json2yaml.stringify(dataToSend))
                  } else if (targetedComponent.specificData.contentType.search('json') != -1) {
                    res.setHeader('content-type', targetedComponent.specificData.contentType)
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
            })
        }
      })
    })
  }
}

module.exports = new RestApiGet()
