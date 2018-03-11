"use strict";
//memory leak tool, code is here to don't forget
var memwatch = require('memwatch-next');
var hd = new memwatch.HeapDiff();
var diff = hd.end();

var express = require('express')
var cors = require('cors')
var app = express();
app.use(cors());
var jenkins = process.env.JENKINS_DEPLOY || false;

var passport = require('passport');

var http = require('http');
http.globalAgent.maxSockets = 1000000000;
var server = http.Server(app);
var https = require('https');



var safe = express.Router();
var unSafeRouteur = express.Router();

var bodyParser = require("body-parser");
app.use(bodyParser.json({
  limit: '10mb'
}));
app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: true
}));
safe.use(bodyParser.json()); // used to parse JSON object given in the request body
var env = process.env;



var httpGet = require('./webServices/workSpaceComponentDirectory/restGetJson.js');
var fs = require('fs');
const configUrl = env.CONFIG_URL || 'http://app-cee3fd62-a81e-48b2-a766-a8be305d5fa9.cleverapps.io/file/dev';
//console.log("before http config",configUrl);
httpGet.makeRequest('GET', {
  url: configUrl
}).then(result => {
  console.log('~~ remote config | ', result);
  const configJson = result.data;
  const content = 'module.exports = ' + JSON.stringify(result.data);



  fs.writeFile("configuration.js", content, 'utf8', function(err) {
    if (err) {
      throw err;
    } else {

      console.log("~~ remote configuration saved");
      require('./lib/core/Oauth/google_auth_strategy')(passport);

      var jwtService = require('./webServices/jwtService')


      //Sécurisation des route de data
      safe.use(function(req, res, next) {
        // ensureSec(req,res,next)
        jwtService.securityAPI(req, res, next);
      })



      app.disable('etag'); //what is that? cache desactivation in HTTP Header

      unSafeRouteur.use(cors());

      var webstomp = require('webstomp-client');
      var WebSocket = require('ws');
      var url = 'wss://stomp-rabitmq-stomp.b9ad.pro-us-east-1.openshiftapps.com:443/ws/';

      let webSocket = new WebSocket(url)
      // let webSocket = new WebSocket(url, {
      //   origin: 'https://semantic-bus.org'
      // });

      var login = 'guest', password = 'guest';
      var stompClient = webstomp.over(webSocket,{heartbeat: {incoming: 10000, outgoing: 10000},debug:false});
      //client: webstomp.over(new WebSocket(url), options)

      // function onMessage(message) {
      //   console.log('message', JSON.parse(message.body));
      //   stompClient.send('/topic/work-response', JSON.stringify({message:'AJAX va prendre cher'}));
      // }

      var onConnect=function(client) {
      //  console.log(app);
        console.log('connected');
        //stompClient.subscribe('/queue/work-ask', message=>{console.log('ALLO');});
        let messagingSevices=[];


        //TODO it's ugly!!!! sytem function is increment with stompClient
        require('./webServices/initialise')(unSafeRouteur,stompClient);
        require('./webServices/authWebService')(unSafeRouteur,stompClient);
        require('./webServices/workspaceWebService')(safe,stompClient);
        require('./webServices/workspaceComponentWebService')(safe,stompClient);
        require('./webServices/technicalComponentWebService')(safe, unSafeRouteur,stompClient);
        require('./webServices/userWebservices')(safe,stompClient);
        require('./webServices/rightsManagementWebService')(safe,stompClient);
        require('./webServices/adminWebService')(safe,stompClient);

        ///OTHER APP COMPONENT
        ///SECURISATION DES REQUETES
        app.get('/', function(req, res, next) {
          res.redirect('/ihm/application.html#myWorkspaces');
        });
        app.use('/auth', express.static('static'));
        app.use('/auth', unSafeRouteur);
        app.use('/configuration', unSafeRouteur);
        app.use('/data/specific', unSafeRouteur);
        app.use('/data/api', unSafeRouteur);
        app.use('/data/core', safe);
        app.use('/ihm', express.static('static'));
        app.use('/browserify', express.static('browserify'));
        app.use('/npm', express.static('node_modules'));

        let errorLib = require('./lib/core/lib/error_lib');
        let jwtSimple = require('jwt-simple');
        let errorParser = require('error-stack-parser');
        app.use(function(err, req, res, next) {
          //console.log('PROXY');
          if (err) {
            //console.log('ERROR MANAGEMENT');
            var token = req.body.token || req.query.token || req.headers['authorization'];
            //console.log('token |',token);
            let user;
            if (token != undefined) {
              token.split("");
              let decodedToken = jwtSimple.decode(token.substring(4, token.length), configJson.secret);
              user = decodedToken.iss;
              //console.log('user |',user);
            }
            errorLib.create(err, user);
            //console.log(err);
            //console.log('XXXXXXXXXXX',res);
            res.status(500).send({
              message: err.message,
              stack: errorParser.parse(err),
              displayMessage: err.displayMessage
            });
          }
          //able to centralise response using res.data ans res.send(res.data)
        });

        server.listen(process.env.PORT || 8080, function() {
          console.log('~~ server started at ', this.address().address, ':', this.address().port)
          //console.log('ALLO');
          require('./lib/core/timerScheduler').run();

          if (jenkins) {
            //console.log("jenkins is true");
            http.get('http://bkz2jalw7c:3bdcf7bc40f582a4ae7ff52f77e90b24@tvcntysyea-jenkins.services.clever-cloud.com:4003/job/semanticbus-pic-3/build?token=semantic_bus_token', function(res) {
              console.log("jenkins JOB production triggered")
            })
          }
          // console.log('Listening on port  ');
          // console.log(this.address().port);
          //console.log('new message from master 18');
          //console.log(this.address());

        })

        // Lets encrypt response

        app.get('/.well-known/acme-challenge/:challengeHash', function(req, res) {
          var params = req.params.challengeHash.substr(0, req.params.challengeHash.length)
          var hash = params + ".rCIAnB6OZN-jvB1XIOagkbUTKQQmQ1ogeb5DUVFNUko";
          res.send(hash)
        });

        /// Nous Securisons desormais IHM par un appel AJAX
        /// à lentrée sur la page application.html

        server.on('error', function(err) {
          console.log(err)
        })
      }

      var onError=function(err) {
        //console.log(stompClient);
        console.log('disconnected ',err);
        if(err.command=='ERROR'){
          console.log('disconnected body',err.body);
          // let webSocket = new WebSocket(url)
          //
          // stompClient = webstomp.over(webSocket,{heartbeat: false,debug:true});
          // let amqpHost=env.AMQPHOST;
          // console.log(login, password, onConnect, onError,amqpHost);
          // if(amqpHost!=undefined){
          //   stompClient.connect(login, password, onConnect, onError,amqpHost);
          // }else{
          //   stompClient.connect(login, password, onConnect, onError);
          // }
        }
      }
      let amqpHost=env.AMQPHOST;
      if(amqpHost!=undefined){
        stompClient.connect(login, password, onConnect, onError,amqpHost);
      }else{
        stompClient.connect(login, password, onConnect, onError);
      }


    }
  });
})
