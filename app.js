"use strict";
var express = require('express')
var app = express();
var server = require('http').Server(app);
var https = require('https');
//var io = require('socket.io')(server);
var router = express.Router();
var bodyParser = require("body-parser");
router.use(bodyParser.json()); // used to parse JSON object given in the request body
var env = process.env;
//var cors = require('cors');
//router.use(cors());

require('./webServices/workspace')(router);
require('./webServices/workspaceComponent')(router);
require('./webServices/technicalComponent')(router);
require('./webServices/ldp')(router);

var transform = require('jsonpath-object-transform');
var sheetrock = require('sheetrock');

server.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function() {
  console.log('Listening on port ');
  console.log(env.NODE_PORT || 3000);
})

app.use('/data', router);
app.use('/ihm', express.static('static'));
app.use('/browserify', express.static('browserify'));
app.use('/npm', express.static('node_modules'));

var jsonTransform = function(source, jsonTransformPattern) {
  console.log('transform');
  //console.log(source);
  console.log(jsonTransformPattern);
  //console.log(jsonSchema);
  var array = true;
  for (var propertyKey in source) {
    //console.log(parseInt(propertyKey));
    if (isNaN(propertyKey)) {
      array = false;
      //console.log('BREAK ARRAY');
    }
  }

  if (array == true) {

    var destArray = [];
    for (var propertyKey in source) {
      var record = source[propertyKey];
      destArray.push(record);
    }
    source = destArray;
  }

  array = true;
  for (var propertyKey in jsonTransformPattern) {
    if (isNaN(propertyKey)) {
      array = false;
    }
  }
  if (array == true) {
    var destArray = [];
    for (var propertyKey in jsonTransformPattern) {
      var record = jsonTransformPattern[propertyKey];
      destArray.push(record);
    }
    jsonTransformPattern = destArray;
  }
  //var transformResult = transform(req.query.data, req.query.transformPattern);
  console.log(source);
  console.log(jsonTransformPattern);
  var transformResult = transform(source, jsonTransformPattern);
  //console.log('result : ', transformResult);
  //console.log(Object.keys(transformResult)[0], Object.keys(transformResult)[0] == 'undefined');
  //report result simple array at root
  if (Object.keys(transformResult)[0] == 'undefined') {
    //console.log(transformResult['undefined']);
    transformResult = transformResult['undefined'];
  }

  var destResult={};
  for(var key in transformResult){
    if(transformResult[key]==undefined){
      destResult[key]=jsonTransformPattern[key];
    }else{
      destResult[key]=transformResult[key];
    }
  }

  return destResult;
}

var googleSpreadsheetQuery = function(key, select,offset, provider,callback) {

  sheetrock({
    url: 'https://docs.google.com/spreadsheets/d/'+key+'/edit#gid=0',
    reset:true,
    query: select,
    callback: function (error, options, response) {
      //console.log('callback sheetrock',error,options,response);
      if (!error||error==null) {
        var cleanData =[];

        for (var recordKey in response.raw.table.rows) {
          if (recordKey < offset) {
            continue;
          }
          var record = response.raw.table.rows[recordKey];
          //console.log('record',record);
          var cleanRecord={};
          cleanRecord.provider=provider;
          for (var cellKey in record.c) {
            var cell = record.c[cellKey];
            var column = response.raw.table.cols[cellKey].id||cellKey;
            //  console.log('column',column);
            cleanRecord[column]=cell==null?undefined:cell.v;

          }
          cleanData.push(cleanRecord);
        }

        callback(cleanData);

      }else{
        callback({"error":error});
      }
    }.bind(this)
  });

}


var getAllFlow = function(callback) {

  var source = "https://api.mlab.com/api/1/databases/semantic_bus/collections/flow/?apiKey=ue_eHVRDWSW0r2YZuTLCi1BxVB_zXnOI";
  var bodyChunks;
  var mlabReq = https.get(source, function(httpsReturn) {
    httpsReturn.on('data', (chunk) => {
      //console.log(chunk);
      bodyChunks = JSON.parse(chunk);

    });
    httpsReturn.on('end', function() {
      callback(bodyChunks);
    });
  });
  mlabReq.end();

}

router.get('/query/all', function(req, res) {

  var resultAll=[];
  var buildPromiseFlow = function(flow){
    return new Promise(function(resolve, reject) {
     googleSpreadsheetQuery(flow.source.key, flow.source.select,flow.source.offset, flow.source.provider,function(data){
       var result =jsonTransform(data,flow.transformer);
       console.log(result);
       resolve(result);
/*       for(var record of result){
         resultAll.push(record);
       }*/
       //res.json(result);
     })
    });
  }

  getAllFlow(function(data) {
    var promiseList=[];
    for (var flow of data){
        promiseList.push(buildPromiseFlow(flow));
    }
    Promise.all(promiseList).then(function(values) {
      console.log(values);
      res.json(values);
    });
  }.bind(this));
});

router.get('/query/:request', function(req, res) {
  console.log('query',req.params.request);
  getAllFlow(function(data) {
      var filtered = data.filter(function(record){
        if (record.destination.url==req.params.request){
          return true;
        }else {
          return false;
        }
      });

      if(filtered.length>0){
        var flow = filtered[0];
        googleSpreadsheetQuery(flow.source.key, flow.source.select,flow.source.offset, flow.source.provider,function(data){
          var result =jsonTransform(data,flow.transformer);
          console.log(result);
          res.json(result);
        })
      }


  }.bind(this));
});



router.get('/transform/', function(req, res) {

  //console.log('---------------------------');
  //console.log(req);
  var transformResult = jsonTransform(req.query.data,req.query.template);

  res.json(transformResult);
});

router.get('/googleSpreadseetQuery/', function(request, response) {

  googleSpreadsheetQuery(request.query.key, request.query.select,request.query.offset, request.query.provider,function(data){
    //console.log(data);
    response.json(data);
  }.bind(this));

});

router.get('/core/flow/', function(req, res) {
  getAllFlow(function(data) {
      res.json(data);
  }.bind(this));
});

router.put('/core/flow/', function(req, res) {
  var bodyChunks;
  var id = req.body._id.$oid;
  var options = {
    hostname: 'api.mlab.com',
    path: '/api/1/databases/semantic_bus/collections/flow/'+id+'?apiKey=ue_eHVRDWSW0r2YZuTLCi1BxVB_zXnOI',
    method: 'PUT',
    headers: {
       'Content-Type' : 'application/json'
    }
  }
  var mlabReq = https.request(options, function(httpsReturn) {
    httpsReturn.on('data', (chunk) => {
      //console.log(chunk);
      bodyChunks = JSON.parse(chunk);

    });
    httpsReturn.on('end', function() {
      console.log('mlab return',bodyChunks);
      res.json(bodyChunks);
    });
  });
  mlabReq.end(JSON.stringify(req.body));
});

router.post('/core/flow/', function(req, res) {
  var bodyChunks;
  var options = {
    hostname: 'api.mlab.com',
    path: '/api/1/databases/semantic_bus/collections/flow/?apiKey=ue_eHVRDWSW0r2YZuTLCi1BxVB_zXnOI',
    method: 'POST',
    headers: {
       'Content-Type' : 'application/json'
    }
  }
  var mlabReq = https.request(options, function(httpsReturn) {
    httpsReturn.on('data', (chunk) => {
      //console.log(chunk);
      bodyChunks = JSON.parse(chunk);

    });
    httpsReturn.on('end', function() {
      console.log('mlab return',bodyChunks);
      res.json(bodyChunks);
    });
  });
  mlabReq.end(JSON.stringify(req.body));
});

router.delete('/core/flow/', function(req, res) {
  var bodyChunks;
  var id = req.body._id.$oid;
  var options = {
    hostname: 'api.mlab.com',
    path: '/api/1/databases/semantic_bus/collections/flow/'+id+'?apiKey=ue_eHVRDWSW0r2YZuTLCi1BxVB_zXnOI',
    method: 'DELETE',
    headers: {
       'Content-Type' : 'application/json'
    }
  }
  var mlabReq = https.request(options, function(httpsReturn) {
    httpsReturn.on('data', (chunk) => {
      //console.log(chunk);
      bodyChunks = JSON.parse(chunk);

    });
    httpsReturn.on('end', function() {
      console.log('mlab return',bodyChunks);
      res.json(bodyChunks);
    });
  });
  mlabReq.end(JSON.stringify(req.body));
});
