module.exports = function(router, amqpClient) {
  //TODO Ugly
  this.amqpClient = amqpClient;
  //this.stompClient = stompClient;

  var recursivPullResolvePromise = require('./engine');
  var workspaceComponentPromise = require('./workspaceComponentPromise.js');
  var workspaceBusiness = require('./workspaceBusiness.js');
  var workspace_component_lib = require('../lib/core/lib/workspace_component_lib');
  var fragment_lib = require('../lib/core/lib/fragment_lib');
  var configuration = require('../configuration');



  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------


  if(process.env.NOTENGINE != true){
    console.log('listen work-ask');
    amqpClient.consume('work-ask', (msg) => {
      var messageObject = JSON.parse(msg.content.toString());
      workspace_component_lib.get({
        _id: messageObject.id
      }).then(function(data) {
        var engine = require('./engine');
        return engine.execute(data, 'work', this.amqpClient, messageObject.callerId);
      }).then((data) => {
      }).catch(e => {
        //console.log('AMQP work error',JSON.stringify(e));
        console.log('ENGINE work error', e);

        //console.log('work error');

        //this.stompClient.send('/topic/work-response.'+token, JSON.stringify({error:e.message}));
      });
    }, {
      noAck: true
    });
  }
  // --------------------------------------------------------------------------------

  router.put('/workspaceComponent/', function(req, res, next) {
    //var configuration = require('../configuration');
    // if (configuration.saveLock == false) {
      //var id = req.body._id;
      //var componentToUpdate = req.body;
      workspace_component_lib.update(req.body).then((componentUpdated) => {
        res.json(componentUpdated)
      }).catch(e => {
        next(e);
      });
    // } else {
    //   next(new Error('save forbiden'));
    // }
  });



  router.delete('/workspaceComponent/:id', function(req, res, next) {
    //var configuration = require('../configuration');
    // if (configuration.saveLock == false) {
      //var id = req.body._id;
      //var componentToUpdate = req.body;
      //console.log('workspaceComponent',componentToUpdate);
      workspace_component_lib.remove({
        _id: req.params.id
      }).then(() => {
        res.json(req.body)
      }).catch(e => {
        next(e);
      });
    // } else {
    //   next(new Error('save forbiden'));
    // }
  });


  // --------------------------------------------------------------------------------
  router.get('/componentData/:componentId/:processId', function(req, res, next) {
    var componentId = req.params.componentId;
    var processId = req.params.processId;
    workspace_component_lib.get_component_result(componentId, processId).then(function(data) {
      //console.log('componentData',data);
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

      //console.log(data);
      //res.send(data);
    }).catch(e => {
      next(e);
    });
  })

  router.get('/workspaceComponent/ConnectBeforeConnectAfter/:id', function(req, res, next) {
    var id = req.params.id;
    workspace_component_lib.getConnectBeforeConnectAfter({
      _id: id
    }).then(function(data) {
      res.send(data)
    }).catch(e => {
      next(e);
    });
  }) //<= get_ConnectBeforeConnectAfter

}
