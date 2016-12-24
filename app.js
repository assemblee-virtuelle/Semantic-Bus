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
//require('./webServices/ldp')(router);

var transform = require('jsonpath-object-transform');
var sheetrock = require('sheetrock');

server.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function() {
  console.log('Listening on port ');
  console.log(this.address().port);
})

app.use('/data', router);
app.use('/ihm', express.static('static'));
app.use('/browserify', express.static('browserify'));
app.use('/npm', express.static('node_modules'));
