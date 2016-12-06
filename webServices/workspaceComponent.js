module.exports = function(router) {
  var mLabPromise = require('./mLabPromise');
  var recursivPullResolvePromise = require('./recursivPullResolvePromise')
  var technicalComponentDirectory = require('./technicalComponentDirectory.js');
  var workspaceComponentPromise = require('./workspaceComponentPromise.js');
  var workspaceBusiness = require('./workspaceBusiness.js');


  //doc to promises : http://stackoverflow.com/questions/35182752/promises-with-http-get-node-js
  //var https = require('https');

  router.get('/core/workspaceComponent/', function(req, res) {
    workspaceComponentPromise.getReadPromise.then(function(data) {
      //console.log(data);
      //var module = technicalComponentDirectory[data.module];
      res.json(data);
    });
  });

  router.get('/core/workspaceComponent/:id/test', function(req, res) {

    var id = req.params.id;
    mLabPromise.request('GET', 'workspaceComponent/' + id).then(function(data) {
      console.log('workspaceComponent | test| ',data);
      return recursivPullResolvePromise.resolveComponentPull(data,false);
    }).then(function(data) {
      res.json(data);
    })

  });

  router.put('/core/workspaceComponent/', function(req, res) {
    var id = req.body._id.$oid;
    var componentToUpdate = req.body;

    componentToUpdate.connectionsAfter = componentToUpdate.connectionsAfter || [];
    componentToUpdate.connectionsBefore = componentToUpdate.connectionsBefore || [];

    //console.log('put workspace component | componentToUpdate |',componentToUpdate);

    mLabPromise.request('GET', 'workspaceComponent', undefined, {
      q: {
        workspaceId: componentToUpdate.workspaceId
      }
    }).then(function(workspaceComponents) {
      var indexCurrentComponent
      for (var i; i < workspaceComponents.length; i++) {
        if (workspaceComponents[i]._id.$oid == componentToUpdate._id.$oid) {
          indexCurrentComponent = i;
          break;
        }
      }
      workspaceComponents[indexCurrentComponent] = componentToUpdate;
      impactedComponentPromises = [];
      impactedComponentPromises.push(mLabPromise.request('PUT', 'workspaceComponent/' + componentToUpdate._id.$oid, componentToUpdate));
      //console.log(workspaceBusiness);
      workspaceBusiness.checkWorkspaceComponentConsistency(workspaceComponents, function(workspaceComponentImpacted) {
        impactedComponentPromises.push(mLabPromise.request('PUT', 'workspaceComponent/' + workspaceComponentImpacted._id.$oid, workspaceComponentImpacted));
      });
      return Promise.all(impactedComponentPromises);

    }).then(function(Components) {
      console.log('put workspace component | componentsUpdated |',Components);

      res.json(Components[0]);
      return mLabPromise.request('PUT', 'workspaceComponent/' + id, componentToUpdate);
    });
  });

  router.post('/core/workspaceComponent/', function(req, res) {
    workspaceComponentPromise.getInsertPromise(req.body).then(function(data) {
      res.json(data);
    });

    /*  var entityToInsert = {};
      var module = technicalComponentDirectory[req.body.module];

      if (module.initComponent != undefined) {
        entityToInsert = module.initComponent(req.body);
      } else {
        entityToInsert = req.body;
      }

      mLabPromise.request('POST', 'workspaceComponent', entityToInsert).then(function(data) {;
        res.json(data);
      });*/
  });

  router.delete('/core/workspaceComponent/', function(req, res) {
    var id = req.body._id.$oid;
    mLabPromise.request('DELETE', 'workspaceComponent/' + id).then(function(data) {
      res.json(data);
    });
  });

}
