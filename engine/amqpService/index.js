const workspace_component_lib = require('../../core/lib/workspace_component_lib')

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = function (router, amqpClient) {
  // Amqp
    amqpClient.consume('work-ask', (msg) => {
      // console.log("work-ask", msg)
      const messageObject = JSON.parse(msg.content.toString())
      console.log("work-ask", messageObject)
      workspace_component_lib.get({
        _id: messageObject.id
      }).then(function (data) {
        const engine = require('../services/engine.js')
        return engine.execute(data, 'work', amqpClient, messageObject.callerId)
      })
    }, {
      noAck: true
    })

    router.post('/work-ask/:componentId', function (req, res, next) {
      const componentId = req.params.componentId
      const pushData = req.body.pushData
      const queryParams = req.body.query
      const direction = req.body.direction || 'work'
      workspace_component_lib.get({
        _id: componentId
      }).then(async (data) => {
        const engine = require('../services/engine.js')
        let engineResult = await engine.execute(data, direction, amqpClient, undefined, pushData, queryParams)
        res.send(engineResult)
      })
    })
}
