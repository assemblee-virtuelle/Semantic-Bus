"use strict";
var express = require('express')
var cors = require('cors')
var app = express();
var passport = require('passport');
app.use(cors());
app.use(passport.initialize());
require('./webServices/passport')(passport);
var helmet = require('helmet');

var server = require('http').Server(app);
var https = require('https');
var jwtService  = require('./webServices/jwtService')
//var io = require('socket.io')(server);

var safe = express.Router();
var unSafeRouteur = express.Router();

var bodyParser = require("body-parser");
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
safe.use(bodyParser.json()); // used to parse JSON object given in the request body
var env = process.env;

//Sécurisation des route de data
safe.use(function(req, res, next) {
	jwtService.securityAPI(req, res, next)
})



var cors = require('cors');
unSafeRouteur.use(cors());

require('./webServices/authWebService')(unSafeRouteur);
require('./webServices/workspace')(safe);
require('./webServices/workspaceComponent')(safe);
require('./webServices/technicalComponent')(safe, unSafeRouteur);
require('./webServices/userWebservices')(safe);
require('./webServices/rightsManagement')(safe);
//require('./webServices/ldp')(router);

var transform = require('jsonpath-object-transform');
var sheetrock = require('sheetrock');

server.listen(process.env.PORT || process.env.port || process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0', function() {
  console.log('Listening on  ');
	console.log(this.address().port);
  console.log(this.address());
})

/// Nous Securisons desormais IHM par un appel AJAX
/// à lentrée sur la page application.html

//  app.all('/ihm/*', function(req, res, next) {
//    jwtService.securityAPI(req, res, next)
//  })


///OTHER APP COMPONENT
///SECURISATION DES REQUETES
app.use(helmet());
app.disable('x-powered-by');
app.use('/auth',  express.static('static'));
app.use('/auth',  unSafeRouteur);
app.use('/data/specific',  unSafeRouteur);
app.use('/data/api',  unSafeRouteur);
app.use('/data/core',  safe);
app.use('/ihm', express.static('static'));
app.use('/browserify', express.static('browserify'));
app.use('/npm', express.static('node_modules'));
