"use strict";
//memory leak tool, code is here to don't forget
// var memwatch = require('memwatch-next');
// var hd = new memwatch.HeapDiff();
// var diff = hd.end();
// var WebSocket = require('ws');
var express = require('express')
var cors = require('cors')
var app = express();
app.use(cors());

var passport = require('passport');
var http = require('http');
http.globalAgent.maxSockets = 1000000000;
var server = http.Server(app);
var amqp = require('amqplib/callback_api');
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
const configUrl = env.CONFIG_URL || 'http://data-players.com/config/devOutOfDocker.json';

httpGet.makeRequest('GET', {
  url: configUrl
}).then(result => {
  const configJson = result.data;
  const content = 'module.exports = ' + JSON.stringify(result.data);


  fs.writeFile("configuration.js", content, 'utf8', function(err) {
    if (err) {
      throw err;
    } else {

      require('./lib/core/Oauth/google_auth_strategy')(passport);

      var jwtService = require('./webServices/jwtService')


      //Sécurisation des route de data
      safe.use(function(req, res, next) {
        jwtService.securityAPI(req, res, next);
      })


      app.disable('etag'); //what is that? cache desactivation in HTTP Header

      unSafeRouteur.use(cors());


      let url;
      console.log('Starting Environnement', process.env.NODE_ENV);
      if(process.env.NODE_ENV === "production"  || process.env.NODE_ENV === "docker"){
        url = "amqp://rabbitmq:5672";
      }else {
        url = configJson.socketServer
      }
      
      amqp.connect(url + '/' + configJson.amqpHost, function(err, conn) {
        console.log('AMQP status : ', conn? "connected": "no connected", err? "error": "no error");
        conn.createChannel(function(err, ch) {
          onConnect(ch);
          if(process.env.ENGINE === true){
            ch.assertQueue('work-ask', {
              durable: true
            });
          }
        });

      });
      var onConnect = function(amqpClient) {
        //TODO it's ugly!!!! sytem function is increment with stompClient
        require('./webServices/initialise')(unSafeRouteur, amqpClient);
        require('./webServices/authWebService')(unSafeRouteur, amqpClient);
        require('./webServices/workspaceWebService')(safe, amqpClient);
        require('./webServices/workspaceComponentWebService')(safe, amqpClient);
        require('./webServices/technicalComponentWebService')(safe, unSafeRouteur, app, amqpClient);
        require('./webServices/userWebservices')(safe, amqpClient);
        require('./webServices/rightsManagementWebService')(safe, amqpClient);
        require('./webServices/adminWebService')(safe, amqpClient);
        require('./webServices/fragmentWebService')(safe, amqpClient);

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
        app.use('/ihm', express.static('static', {
          etag: false
        }));
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
            if (!Array.isArray(err)) {
              err = [err];
            }
            res.status(500).send(
              err.map(e => {
                console.log(e);
                return {
                  message: e.message,
                  stack: errorParser.parse(e),
                  displayMessage: e.displayMessage
                }
              })
            );
          }
          //able to centralise response using res.data ans res.send(res.data)
        });

        app.listen(80, function(err) {
          console.log('~~ server started at ', err, ':', this.address())
          //console.log('ALLO');
          require('./lib/core/timerScheduler').run();
        })

        server.on('error', function(err) {
          console.log(err)
        })
      }
    }
  });
})
