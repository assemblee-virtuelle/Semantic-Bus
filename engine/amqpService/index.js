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
        engine.execute(data, 'work', amqpClient, messageObject.callerId).then(r=>{
          // console.log('engine ok');
        }).catch(e=>{
          console.error(e);
        })
      })
    }, {
      noAck: true
    })
    router.post('/work-ask/:componentId', function (req, res, next) {
      const componentId = req.params.componentId
      const pushData = req.body.pushData
      const queryParams = req.body.queryParams
      const direction = req.body.direction || 'work'
      workspace_component_lib.get({
        _id: componentId
      }).then(async (data) => {
        const engine = require('../services/engine.js')
        engine.execute(data, direction, amqpClient, undefined, pushData, queryParams).then(engineResult=>{
          // console.log('engineResult',JSON.stringify(engineResult));
          res.send(engineResult)
        }).catch(errors=>{
          if(Array.isArray(errors)){
            errorsMessages=errors.map(e=>e.message);
          }else{
            errorsMessages=errors.message;
          }
          res.status(500).send(errorsMessages);
        })
      }).catch(e=>{
        res.status(500).send(e);
      })
    })
}
