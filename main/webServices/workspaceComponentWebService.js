module.exports = function (router, amqpClient) {
  this.amqpClient = amqpClient
  const workspace_component_lib = require('../../core/lib/workspace_component_lib')
  const fragment_lib = require('../../core/lib/fragment_lib')
  const securityService = require('../webServices/securityService')
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------

  // if (process.env.NOTENGINE !== true) {
  //   amqpClient.consume('work-ask', (msg) => {
  //     var messageObject = JSON.parse(msg.content.toString())
  //     workspace_component_lib.get({
  //       _id: messageObject.id
  //     }).then(function (data) {
  //       var engine = require('./engine')
  //       return engine.execute(data, 'work', this.amqpClient, messageObject.callerId)
  //     }).then((data) => {
  //     }).catch(e => {
  //     })
  //   }, {
  //     noAck: true
  //   })

  //   router.get('/work-ask/:componentId', function (req, res, next) {
  //     // var messageObject = JSON.parse(msg.content.toString());
  //     var componentId = req.params.componentId
  //     workspace_component_lib.get({
  //       _id: componentId
  //     }).then(function (data) {
  //       var engine = require('./engine')
  //       return engine.execute(data, 'work', this.amqpClient, undefined)
  //     }).then((data) => {
  //     }).catch(e => {
  //     })
  //   })
  // }

  // --------------------------------------------------------------------------------

  // router.put('/workspaceComponent', (req, res, next) => securityService.wrapperSecurity(req, res, next), function (req, res, next) {
  //   workspace_component_lib.update(req.body)
  //     .then((componentUpdated) => (res.json(componentUpdated)))
  //     .catch(e => {
  //       next(e)
  //     })
  // })

  // --------------------------------------------------------------------------------

  // router.delete('/workspaces/:id/components', (req, res, next) => securityService.wrapperSecurity(req, res, next), function (req, res, next) {
  //   workspace_component_lib.remove({
  //     _id: req.body._id
  //   }).then(() => {
  //     res.json(req.body)
  //   }).catch(e => {
  //     next(e)
  //   })
  // })

  // --------------------------------------------------------------------------------
  // router.get('/workspaces/:id/components/:componentId/process/:processId', (req, res, next) => securityService.wrapperSecurity(req, res, next), function (req, res, next) {
  //   var componentId = req.params.componentId
  //   var processId = req.params.processId
  //   workspace_component_lib.get_component_result(componentId, processId).then(function (data) {
  //     if (data !== undefined) {
  //       if (data.persistProcess === true && data.frag !== undefined) {
  //         fragment_lib.get(data.frag).then(frag => {
  //           if (frag != null) {
  //             data.data = frag.data
  //           } else {
  //             data.error = { error: "frag of cache doesn't exist" }
  //           }
  //           res.send(data)
  //         })
  //       } else {
  //         res.send(data)
  //       }
  //     } else {
  //       res.send(undefined)
  //     }
  //   }).catch(e => {
  //     next(e)
  //   })
  // })

  // --------------------------------------------------------------------------------

  // router.get('/workspaceComponent/ConnectBeforeConnectAfter/:id', (req, res, next) => securityService.wrapperSecurity(req, res, next), function (req, res, next) {
  //   workspace_component_lib.getConnectBeforeConnectAfter({ _id: req.params.id })
  //     .then((data) => (res.send(data)))
  //     .catch(e => {
  //       next(e)
  //     })
  // })
}
