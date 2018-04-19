module.exports = function(router, amqpClient) {
  //TODO Ugly
  this.amqpClient = amqpClient;
  //this.stompClient = stompClient;

  var recursivPullResolvePromise = require('./recursivPullResolvePromise');
  var workspaceComponentPromise = require('./workspaceComponentPromise.js');
  var workspaceBusiness = require('./workspaceBusiness.js');
  var workspace_component_lib = require('../lib/core/lib/workspace_component_lib');
  var configuration = require('../configuration');



  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------


  //   router.get('/workspaceComponent/:id/test', function(req, res, next) {
  //     var id = req.params.id;
  //     workspace_component_lib.get({
  //       _id: id
  //     }).then(function(data) {
  //       //console.log('workspaceComponent | test| ', data);
  //       var recursivPullResolvePromiseDynamic = require('./recursivPullResolvePromise');
  //       return recursivPullResolvePromise.getNewInstance().resolveComponentPull(data, false).then(function(data) {
  //       //console.log("IN WORKSPACE COMPONENT RETURN DATA |", data)
  //       res.json(data.data);
  //       //this.stompClient.message...
  //
  //     }).catch(e => {
  //       console.log("IN ERROR WEB SERVICE",e)
  //       next(e);
  //     });
  //
  //   }); //<= resolveComponentPull
  // })

  // --------------------------------------------------------------------------------
  //
  // router.get('/workspaceComponent/:id/work', function(req, res, next) {
  //   //console.log('WORK');
  //   var id = req.params.id;
  //   workspace_component_lib.get({
  //     _id: id
  //   }).then(function(data) {
  //     //console.log('workspaceComponent | work| ', data);
  //     var recursivPullResolvePromiseDynamic = require('./recursivPullResolvePromise');
  //     return recursivPullResolvePromiseDynamic.getNewInstance().resolveComponent(data, 'work');
  //   }).then(function(data) {
  //     //console.log("IN WORKSPACE COMPONENT RETURN DATA |", data)
  //
  //     res.json(data.data);
  //   }).catch(e => {
  //     console.log("IN ERROR WEB SERVICE",e.message)
  //       next(e);
  //   });
  // }.bind(this)); //<= resolveComponent


  // stompClient.subscribe('/queue/work-ask', message=>{
  //   let body=JSON.parse(message.body);
  //   //console.log('/queue/work-ask | body', body);
  //   //this.stompClient.send('/topic/work-response', JSON.stringify({message:'AJAX va prendre cher'}));
  //   //console.log('WORK');
  //   // console.log('traitement');
  //   // let out = []
  //   // for (let i=0; i<800000; i++){
  //   //   out.push({text:'lorem ipsum',iteration:i})
  //   // }
  //   var id = body.id;
  //   let userId = body.userId;
  //
  //   // this.stompClient.send('/topic/work-response.'+token, JSON.stringify({data:out}));
  //
  //
  //   //console.log(token);
  //   workspace_component_lib.get({
  //     _id: id
  //   }).then(function(data) {
  //     //console.log('workspaceComponent | work| ', data);
  //     var recursivPullResolvePromiseDynamic = require('./recursivPullResolvePromise');
  //     return recursivPullResolvePromiseDynamic.execute(data, 'work',this.stompClient,userId);
  //   }).then((data)=> {
  //
  //     //console.log("IN WORKSPACE COMPONENT RETURN DATA |", data)
  //     //this.stompClient.send('/topic/work-response.'+token, JSON.stringify({processId:0}));
  //
  //
  //   }).catch(e => {
  //     //console.log('AMQP work error',JSON.stringify(e));
  //     //console.log('AMQP work error',e);
  //
  //     console.log('work error');
  //
  //     //this.stompClient.send('/topic/work-response.'+token, JSON.stringify({error:e.message}));
  //   });
  // });


  amqpClient.consume('work-ask', (msg) => {
    var messageObject = JSON.parse(msg.content.toString());
    workspace_component_lib.get({
      _id: messageObject.id
    }).then(function(data) {
      //console.log('workspaceComponent | work| ', data);
      var recursivPullResolvePromiseDynamic = require('./recursivPullResolvePromise');
      return recursivPullResolvePromiseDynamic.execute(data, 'work', this.amqpClient, messageObject.callerId);
    }).then((data) => {

      //console.log("IN WORKSPACE COMPONENT RETURN DATA |", data)
      //this.stompClient.send('/topic/work-response.'+token, JSON.stringify({processId:0}));


    }).catch(e => {
      //console.log('AMQP work error',JSON.stringify(e));
      console.log('AMQP work error',e);

      //console.log('work error');

      //this.stompClient.send('/topic/work-response.'+token, JSON.stringify({error:e.message}));
    });
  }, {
    noAck: true
  });
  // --------------------------------------------------------------------------------

  router.put('/workspaceComponent/', function(req, res, next) {
    //var configuration = require('../configuration');
    if (configuration.saveLock == false) {
      //var id = req.body._id;
      //var componentToUpdate = req.body;
      //console.log('workspaceComponent',componentToUpdate);
      workspace_component_lib.update(req.body).then((componentUpdated) => {
        res.json(componentUpdated)
      }).catch(e => {
        next(e);
      });
    } else {
      next(new Error('save forbiden'));
    }
  });

  router.post('/workspaceComponent/connection', function(req, res, next) {
    //var configuration = require('../configuration');
    if (configuration.saveLock == false) {
      let connection = req.body;
      let promises = [];
      promises.push(workspace_component_lib.update(connection.source));
      promises.push(workspace_component_lib.update(connection.target));
      Promise.all(promises).then((data) => {
        res.json({
          source: data[0],
          target: data[1]
        })
      }).catch(e => {
        next(e);
      });
    } else {
      next(new Error('save forbiden'));
    }
  });

  router.delete('/workspaceComponent/:id', function(req, res, next) {
    //var configuration = require('../configuration');
    if (configuration.saveLock == false) {
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
    } else {
      next(new Error('save forbiden'));
    }
  });


  // --------------------------------------------------------------------------------
  router.get('/componentData/:componentId/:processId', function(req, res, next) {
    var componentId = req.params.componentId;
    var processId = req.params.processId;
    workspace_component_lib.get_component_result(componentId, processId).then(function(data) {
      res.send(data);
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
