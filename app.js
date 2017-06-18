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

var dataRouter = express.Router();
var apiRouteur = express.Router();

var authRouter = express.Router();
var bodyParser = require("body-parser");
app.use(bodyParser.json())
authRouter.use(bodyParser.json());
dataRouter.use(bodyParser.json()); // used to parse JSON object given in the request body
var env = process.env;

//Sécurisation des route de data
dataRouter.use(function(req, res, next) {
	jwtService.securityAPI(req, res, next)
})



var cors = require('cors');
authRouter.use(cors());

require('./webServices/authWebService')(authRouter);
require('./webServices/workspace')(dataRouter);
require('./webServices/workspaceComponent')(dataRouter);
require('./webServices/technicalComponent')(dataRouter, apiRouteur);
require('./webServices/userWebservices')(dataRouter);
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
app.use('/auth',  authRouter);
app.use('/data',  dataRouter);
app.use('/ihm', express.static('static'));
app.use('/browserify', express.static('browserify'));
app.use('/npm', express.static('node_modules'));
