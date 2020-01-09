'use strict'
class RestApiPost {
  constructor () {
    this.type = 'Post provider'
    this.description = `Déclencher un flux de donnée sur une API http POST.`
    this.editor = 'rest-api-post-editor'
    this.graphIcon = 'Post_provider.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/APIComponents'
    ],
    this.stepNode = false
    this.workspace_component_lib = require('../../../core/lib/workspace_component_lib')
    this.data2xml = require('data2xml')
    this.json2yaml = require('json2yaml')
    this.request = require('request')
    this.config = require('../../configuration')
  }

  initialise (router) {
    router.post('/:urlRequiered', (req, res, next) => {
      var urlRequiered = req.params.urlRequiered
      this.workspace_component_lib.get({
        'specificData.url': urlRequiered
      }).then(component => {
        this.request.post(this.config.engineUrl + '/work-ask/' + component._id,
          { body: { pushData: req.body, query: req.query, direction: 'push' },
            json: true
          }
          // eslint-disable-next-line handle-callback-err
          , (err, dataToSend) => {
            // console.log(err,dataToSend.body);
            if (err!=null && err.code) {
              res.status(err.code).send(err.message)
            } else {
              next(err)
            }
            res.send(dataToSend.body.data)
          })
      })
    })
  }
}

module.exports = new RestApiPost()
