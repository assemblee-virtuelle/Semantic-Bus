const workspace_component_lib = require('../../core/lib/workspace_component_lib');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

class Communication {
  init(router) {
    router.post('/work-ask/:componentId', async (req, res, next) => {

      // console.log('VERSION',req.params.engineVersion)

      req.setTimeout(0);
      const componentId = req.params.componentId;
      const pushData = req.body.pushData;
      const queryParams = req.body.queryParams;

      const direction = req.body.direction || 'work';
      try {
        console.log('get component', componentId);
        const data = await workspace_component_lib.get({ _id: componentId });
        const engine = require('../services/engine.js');
        try {
          const engineResult = await engine.execute(data, direction, this.amqpClient, undefined, pushData, queryParams);
          res.send(engineResult);
        } catch (errors) {
          let errorsMessages;
          if (Array.isArray(errors)) {
            errorsMessages = errors.map(e => e.message);
          } else {
            errorsMessages = errors.message;
          }
          console.log('error engine', errorsMessages);
          res.status(500).send(errorsMessages);
        }
      } catch (e) {
        console.log('error global', e);
        res.status(500).send(e);
      }
    });
  }

  async setAmqpChannel(channel) {
    console.log('setAmqpChannel');
    channel.consume('work-ask', async (msg) => {
      // console.log('msg', msg);
      const messageObject = JSON.parse(msg.content.toString());
      // console.log('messageObject', messageObject);
      try {
        const data = await workspace_component_lib.get({ _id: messageObject.id });
        const engine = require('../services/engine.js');
        try {
          await engine.execute(data, 'work', this.amqpClient, messageObject.callerId, messageObject.pushData, messageObject.queryParams, messageObject.tracerId);
          // console.log('engine ok');
        } catch (e) {
          console.error(e);
        }
      } catch (e) {
        console.error(e);
      }
    }, {
      noAck: true
    });
  }

  setAmqpClient(amqpClient){
    this.amqpClient=amqpClient;
  }
}

module.exports =new Communication();
