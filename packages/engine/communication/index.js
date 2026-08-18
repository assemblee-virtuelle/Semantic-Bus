const workspace_component_lib = require('@semantic-bus/core/lib/workspace_component_lib');
const hmac_lib = require('@semantic-bus/core/lib/hmac_lib');
const engineWorkAuth = require('@semantic-bus/core/lib/engineWorkAuth');
const config = require('../config.json');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

class Communication {
  init(router) {
    router.post('/work-ask/:componentId', async (req, res, next) => {

      // console.log('VERSION',req.params.engineVersion)

      // SÉCURITÉ : cet endpoint déclenche l'exécution d'un composant/workflow avec
      // du pushData/queryParams fourni par l'appelant. Il doit être appelé par un
      // caller interne légitime (timer scheduler), authentifié par signature HMAC.
      // Tout appel non signé (ou signé invalide/expiré) est rejeté 401.
      const componentId = req.params.componentId;
      if (!hmac_lib.verify(componentId, req.body, req.headers)) {
        res.status(401).send('Unauthorized: missing or invalid signature');
        return;
      }

      req.setTimeout(0);
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

    channel.consume('work-ask', async (msg) => {
      // console.log('msg', msg);
      let messageObject;
      try {
        messageObject = JSON.parse(msg.content.toString());
      } catch (e) {
        console.error('work-ask : invalid message', e.message);
        return;
      }

      // SÉCURITÉ : le message doit être authentifié. Deux chemins acceptés :
      //   - caller interne (timer scheduler, httpProvider, upload) : signé HMAC ;
      //   - navigateur (STOMP) : porte un JWT, avec vérification de l'autorisation
      //     (admin, ou rôle owner/editor sur le workspace du composant).
      let authorized = false;
      if (hmac_lib.verifyMessage(messageObject)) {
        authorized = true;
      } else if (messageObject.token) {
        const check = await engineWorkAuth.authorizeWorkAsk(messageObject.token, messageObject.id, config);
        authorized = check.authorized;
        if (!authorized) {
          console.warn('work-ask : authorization refused', messageObject.id, check.reason);
        }
      } else {
        console.warn('work-ask : unauthenticated message refused', messageObject.id);
      }

      if (!authorized) {
        return;
      }

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
