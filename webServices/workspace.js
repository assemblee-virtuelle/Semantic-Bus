module.exports = function(router) {
  var mLabPromise = require('./mLabPromise');
  var workspaceComponentPromise = require('./workspaceComponentPromise.js');
  var workspaceBusiness = require('./workspaceBusiness.js');

  //doc to promises : http://stackoverflow.com/questions/35182752/promises-with-http-get-node-js
  //var https = require('https');

  router.get('/core/workspace/', function(req, res) {
    var requestPromise = mLabPromise.request('GET', 'workspace');
    var workspaces;
    //console.log(requestPromise);
    requestPromise.then(function(data) {
      //console.log(data);
      workspaces = data;
      const _completeWorkspaceByComponentsPromises = workspaces.map(workspace => mLabPromise.request('GET', 'workspaceComponent', undefined, {
        q: {
          workspaceId: workspace._id.$oid
        }
      }));
      return Promise.all(_completeWorkspaceByComponentsPromises);

    }).then(function(responses) {
      for (var responseKey in responses) {
        //console.log('Check response | ',workspaces[responseKey], ' | components | ',responses[responseKey]);
        console.log('workspace', workspaces[responseKey]._id.$oid);
        workspaces[responseKey].components = workspaceBusiness.checkWorkspaceComponentConsistency(responses[responseKey]);
      }
      //console.log(workspaces);
      res.json(workspaces);
    });

  });

  router.get('/core/workspace/:id', function(req, res) {
      var id = req.params.id;
      var requestPromise = mLabPromise.request('GET', 'workspace/' + id);
      var workspace;
      //console.log(requestPromise);
      requestPromise.then(function(data) {
          workspace = data;
          return mLabPromise.request('GET', 'workspaceComponent', undefined, {
            q: {
              workspaceId: data._id.$oid
            }
          });

      }).then(function(components) {
      //console.log('Check response | ',workspaces[responseKey], ' | components | ',responses[responseKey]);
      //console.log('workspace',  workspaces[responseKey]._id.$oid);
      workspace.components = workspaceBusiness.checkWorkspaceComponentConsistency(components);

      //console.log(workspaces);
      res.json(workspace);
    });

  });

router.put('/core/workspace/', function(req, res) {
  var id = req.body._id.$oid;
  var entityToUpdate = JSON.parse(JSON.stringify(req.body));
  entityToUpdate.components = undefined;

  mLabPromise.request('GET', 'workspaceComponent', undefined, {
    q: {
      workspaceId: entityToUpdate._id.$oid
    }
  }).then(function(records) {
    const deletePromises = records.map(component => mLabPromise.request('DELETE', 'workspaceComponent/' + component._id.$oid));
    const updatePromise = mLabPromise.request('PUT', 'workspace/' + id, entityToUpdate)
      //const mergedPromises = [].concat.apply([], [deletePromises,insertPromises]);
    const mergedPromises = [].concat([updatePromise, deletePromises]);
    return Promise.all(mergedPromises);
  }).then(function(records) {
    req.body.components.forEach(component => {
      component.workspaceId = entityToUpdate._id.$oid
    });
    //TODO la sauvegerde su workspace dtruit les connections
    console.log('PUT /core/workspace/ | insertedComopnents | ', req.body.components);
    const insertPromises = req.body.components.map(component => workspaceComponentPromise.getInsertPromise(component));
    //const insertPromises = req.body.components.map(component => mLabPromise.request('POST', 'workspaceComponent',component));
    //entityToUpdate = records[0];
    //console.log(insertPromises);
    return Promise.all(insertPromises);
  }).then(function(records) {
    entityToUpdate.components = records;
    res.json(entityToUpdate);
  });

  //var requestFistComponentPromise = mLabPromise.request('POST', 'workspaceComponent', firstComponentToInsert);
  //return requestFistComponentPromise;


});

router.post('/core/workspace/', function(req, res) {
  var entityToInsert = req.body;
  //var firstComponentToInsert = entityToInsert.firstComponent;
  //entityToInsert.firstComponent = undefined;
  var requestPromise = mLabPromise.request('POST', 'workspace', entityToInsert);
  //console.log(requestPromise);
  requestPromise.then(function(data) {
    entityToInsert = data;
    data.components.forEach(component => {
      //component.technicalComponent = component._id.$oid;
      component.workspaceId = data._id.$oid
    });
    const promisesList = data.components.map(component => workspaceComponentPromise.getInsertPromise(component));
    //const promisesList = data.components.map(component => mLabPromise.request('POST', 'workspaceComponent', component));
    return Promise.all(promisesList);
  }).then(function(components) {
    entityToInsert.components = components
      //entityToInsert.components.push(componentData);
    res.json(entityToInsert);
  });
});

router.delete('/core/workspace/:id', function(req, res) {

  var id = req.params.id;

  mLabPromise.request('GET', 'workspaceComponent', undefined, {
    q: {
      workspaceId: id
    }
  }).then(function(records) {
    const promisesList = records.map(component => mLabPromise.request('DELETE', 'workspaceComponent/' + component._id.$oid));
    //const promisesList = data.components.map(component => mLabPromise.request('POST', 'workspaceComponent', component));
    return Promise.all(promisesList);
  }).then(function(records) {
    return mLabPromise.request('DELETE', 'workspace/' + id);
  }).then(function(data) {
    res.json(data);
  });

});
}
