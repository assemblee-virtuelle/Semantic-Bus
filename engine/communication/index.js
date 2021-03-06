const workspace_component_lib = require('../../core/lib/workspace_component_lib')

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

class Communication {
  init(router) {
    router.post('/work-ask/:componentId', (req, res, next) => {
      // console.log('ALLO engine');
      req.setTimeout(0);
      const componentId = req.params.componentId
      const pushData = req.body.pushData
      const queryParams = req.body.queryParams
      // console.log('queryParams',req.body.queryParams);
      // console.log('AAAAAAAAA componentId',componentId);
      const direction = req.body.direction || 'work'
      workspace_component_lib.get({
        _id: componentId
      }).then(async (data) => {
        const engine = require('../services/engine.js')
        engine.execute(data, direction, this.amqpClient, undefined, pushData, queryParams).then(engineResult=>{
          // console.log('engineResult',JSON.stringify(engineResult));
          res.send(engineResult)
        }).catch(errors=>{
          let errorsMessages;
          if(Array.isArray(errors)){
            errorsMessages=errors.map(e=>e.message);
          }else{
            errorsMessages=errors.message;
          }
          console.log('error engine',errorsMessages);
          res.status(500).send(errorsMessages);
        })
      }).catch(e=>{
        console.log('error global',e);
        res.status(500).send(e);
      })
    })
  }

  setAmqpClient(amqpClient){
    this.amqpClient=amqpClient;
    this.amqpClient.consume('work-ask', (msg) => {
      // console.log("work-ask", msg)
      const messageObject = JSON.parse(msg.content.toString())
      console.log("work-ask", messageObject)
      workspace_component_lib.get({
        _id: messageObject.id
      }).then( (data)=>{
        const engine = require('../services/engine.js')
        engine.execute(data, 'work', this.amqpClient, messageObject.callerId).then(r=>{
          // console.log('engine ok');
        }).catch(e=>{
          console.error(e);
        })
      })
    }, {
      noAck: true
    })
  }
}

module.exports =new Communication()
