module.exports = function(router,stompClient) {
  //TODO Ugly
  this.stompClient=stompClient;
  //this.stompClient = stompClient;

  var recursivPullResolvePromise = require('./recursivPullResolvePromise');
  var workspaceComponentPromise = require('./workspaceComponentPromise.js');
  var workspaceBusiness = require('./workspaceBusiness.js');
  var workspace_component_lib = require('../lib/core/lib/workspace_component_lib');
  var configuration = require('../configuration');



  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------


  router.get('/workspaceComponent/:id/test', function(req, res, next) {
    var id = req.params.id;
    workspace_component_lib.get({
      _id: id
    }).then(function(data) {
      console.log('workspaceComponent | test| ', data);
      var recursivPullResolvePromiseDynamic = require('./recursivPullResolvePromise');
      return recursivPullResolvePromise.getNewInstance().resolveComponentPull(data, false).then(function(data) {
      //console.log("IN WORKSPACE COMPONENT RETURN DATA |", data)
      res.json(data.data);
      //this.stompClient.message...

    }).catch(e => {
      console.log("IN ERROR WEB SERVICE",e)
      next(e);
    });

  }); //<= resolveComponentPull
})

  // --------------------------------------------------------------------------------

  router.get('/workspaceComponent/:id/work', function(req, res, next) {
    //console.log('WORK');
    var id = req.params.id;
    workspace_component_lib.get({
      _id: id
    }).then(function(data) {
      //console.log('workspaceComponent | work| ', data);
      var recursivPullResolvePromiseDynamic = require('./recursivPullResolvePromise');
      return recursivPullResolvePromiseDynamic.getNewInstance().resolveComponent(data, 'work');
    }).then(function(data) {
      //console.log("IN WORKSPACE COMPONENT RETURN DATA |", data)

      res.json(data.data);
    }).catch(e => {
      console.log("IN ERROR WEB SERVICE",e.message)
        next(e);
    });
  }.bind(this)); //<= resolveComponent


  stompClient.subscribe('/queue/work-ask', message=>{
    let body=JSON.parse(message.body);
    //console.log('body', body);
    //this.stompClient.send('/topic/work-response', JSON.stringify({message:'AJAX va prendre cher'}));
    //console.log('WORK');
    var id = body.id;
    let token = body.token;
    //console.log(token);
    workspace_component_lib.get({
      _id: id
    }).then(function(data) {
      //console.log('workspaceComponent | work| ', data);
      var recursivPullResolvePromiseDynamic = require('./recursivPullResolvePromise');
      return recursivPullResolvePromiseDynamic.getNewInstance().resolveComponent(data, 'work');
    }).then(function(data) {
      //console.log("IN WORKSPACE COMPONENT RETURN DATA |", data)

      this.stompClient.send('/topic/work-response.'+token, JSON.stringify({data:data}));

    }).catch(e => {
      //console.log('AMQP work error',JSON.stringify(e));
        this.stompClient.send('/topic/work-response.'+token, JSON.stringify({error:e.message}));
    });
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
