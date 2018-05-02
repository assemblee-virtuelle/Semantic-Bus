module.exports = function(router, unSafeRouteur) {
  var https = require('https');
  var technicalComponentDirectory = require('./technicalComponentDirectory.js');
  var recursivPullResolvePromise = require('./engine');
  technicalComponentDirectory.initialise(router, unSafeRouteur, recursivPullResolvePromise);

  router.get('/technicalComponent/', function(req, res) {
    var directory = [];
    //console.log(technicalComponentDirectory)
    for (var technicalComponent in technicalComponentDirectory) {
      if (technicalComponent != 'initialise') {
        directory.push({
          module: technicalComponent,
          type: technicalComponentDirectory[technicalComponent].type,
          description: technicalComponentDirectory[technicalComponent].description,
          editor: technicalComponentDirectory[technicalComponent].editor
        });
      }
    }
    //console.log(directory);
    res.json(directory);

    /*var source = "https://api.mlab.com/api/1/databases/semantic_bus/collections/technicalComponent/?apiKey=ue_eHVRDWSW0r2YZuTLCi1BxVB_zXnOI";
    var bodyChunks;
    var mlabReq = https.get(source, function(httpsReturn) {
      httpsReturn.on('data', (chunk) => {
        //console.log(chunk);
        bodyChunks = JSON.parse(chunk);

      });
      httpsReturn.on('end', function() {
        res.json(bodyChunks);
      });
    });
    mlabReq.end();*/
  });

  router.put('/technicalComponent/', function(req, res) {
    var bodyChunks;
    var id = req.body._id.$oid;
    var options = {
      hostname: 'api.mlab.com',
      path: '/api/1/databases/semantic_bus/collections/technicalComponent/' + id + '?apiKey=ue_eHVRDWSW0r2YZuTLCi1BxVB_zXnOI',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    var mlabReq = https.request(options, function(httpsReturn) {
      httpsReturn.on('data', (chunk) => {
        //console.log(chunk);
        bodyChunks = JSON.parse(chunk);

      });
      httpsReturn.on('end', function() {
        //console.log('mlab return', bodyChunks);
        res.json(bodyChunks);
      });
    });
    mlabReq.end(JSON.stringify(req.body));
  });

  router.post('/technicalComponent/', function(req, res) {
    var bodyChunks;
    var options = {
      hostname: 'api.mlab.com',
      path: '/api/1/databases/semantic_bus/collections/technicalComponent/?apiKey=ue_eHVRDWSW0r2YZuTLCi1BxVB_zXnOI',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    var mlabReq = https.request(options, function(httpsReturn) {
      httpsReturn.on('data', (chunk) => {
        //console.log(chunk);
        bodyChunks = JSON.parse(chunk);

      });
      httpsReturn.on('end', function() {
        //console.log('mlab return', bodyChunks);
        res.json(bodyChunks);
      });
    });
    mlabReq.end(JSON.stringify(req.body));
  });

  router.delete('/technicalComponent/', function(req, res) {
    var bodyChunks;
    var id = req.body._id.$oid;
    var options = {
      hostname: 'api.mlab.com',
      path: '/api/1/databases/semantic_bus/collections/technicalComponent/' + id + '?apiKey=ue_eHVRDWSW0r2YZuTLCi1BxVB_zXnOI',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    var mlabReq = https.request(options, function(httpsReturn) {
      httpsReturn.on('data', (chunk) => {
        //console.log(chunk);
        bodyChunks = JSON.parse(chunk);

      });
      httpsReturn.on('end', function() {
        //console.log('mlab return', bodyChunks);
        res.json(bodyChunks);
      });
    });
    mlabReq.end(JSON.stringify(req.body));
  });
}
