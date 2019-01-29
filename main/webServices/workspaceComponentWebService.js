module.exports = function(router, amqpClient) {
  //TODO Ugly
  this.amqpClient = amqpClient;
  var workspace_component_lib = require('../../core/lib/workspace_component_lib');
  var fragment_lib = require('../../core/lib/fragment_lib');


  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------


  if(process.env.NOTENGINE != true){
    amqpClient.consume('work-ask', (msg) => {
      var messageObject = JSON.parse(msg.content.toString());
      workspace_component_lib.get({
        _id: messageObject.id
      }).then(function(data) {
        var engine = require('./engine');
        return engine.execute(data, 'work', this.amqpClient, messageObject.callerId);
      }).then((data) => {
      }).catch(e => {
      });
    }, {
      noAck: true
    });
  }

  // --------------------------------------------------------------------------------

  router.put('/workspaceComponent', function(req, res, next) {
      workspace_component_lib.update(req.body).then((componentUpdated) => {
        res.json(componentUpdated)
      }).catch(e => {
        next(e);
      });
  });

  // --------------------------------------------------------------------------------

  router.delete('/workspaceComponent/:id', function(req, res, next) {
      workspace_component_lib.remove({
        _id: req.params.id
      }).then(() => {
        res.json(req.body)
      }).catch(e => {
        next(e);
      });
  });

  // --------------------------------------------------------------------------------
  
  router.get('/componentData/:componentId/:processId', function(req, res, next) {
    var componentId = req.params.componentId;
    var processId = req.params.processId;
    workspace_component_lib.get_component_result(componentId, processId).then(function(data) {
      if(data!=undefined){
        if (data.persistProcess == true && data.frag != undefined) {

          fragment_lib.get(data.frag).then(frag => {
            if(frag!=null){
              data.data = frag.data;
            }else{
              data.error = {error:"frag of cache doesn't exist"}
            }
            //console.log('get Fag', frag);
            res.send(data);
          })

        } else {
          res.send(data);
        }
      }else {
        res.send(undefined);
      }
    }).catch(e => {
      next(e);
    });
  })

  // --------------------------------------------------------------------------------

  router.get('/workspaceComponent/ConnectBeforeConnectAfter/:id', function(req, res, next) {
    var id = req.params.id;
    workspace_component_lib.getConnectBeforeConnectAfter({
      _id: id
    }).then(function(data) {
      res.send(data)
    }).catch(e => {
      next(e);
    });
  })

}
