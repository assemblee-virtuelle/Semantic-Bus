"use strict";

const express = require('express')
const cors = require('cors')
const app = express();
const http = require('http');
const amqp = require('amqplib/callback_api');
const safe = express.Router();
const unSafeRouteur = express.Router();
const bodyParser = require("body-parser");
const env = process.env;
const httpGet = require('./webServices/workSpaceComponentDirectory/restGetJson.js');
const fs = require('fs');
const url = env.CONFIG_URL || 'https://data-players.github.io/StrongBox/public/dev-docker.json';

app.use(cors());
app.use(bodyParser.json({
  limit: '10mb'
}));
app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: true
}));
safe.use(bodyParser.json()); // used to parse JSON object given in the request body
http.globalAgent.maxSockets = 1000000000;
httpGet.makeRequest('GET', {
  url
}).then(result => {
  const configJson = result.data;
  const content = 'module.exports = ' + JSON.stringify(result.data);

  fs.writeFile("configuration.js", content, 'utf8', function(err) {
    if (err) {
      throw err;
    } else {
      
      const jwtService = require('./webServices/jwtService')

      safe.use(function(req, res, next) {
        jwtService.securityAPI(req, res, next);
      })
      app.disable('etag'); //add this in RP ( traeffik )
      unSafeRouteur.use(cors());
      amqp.connect(configJson.socketServer + '/' + configJson.amqpHost, function(err, conn) {
        console.log('AMQP status : ', conn ? "connected" : "no connected", err ? err : "no error");
        conn.createChannel(function(err, ch) {
          onConnect(ch);
          if (process.env.NOTENGINE != true) {
            ch.assertQueue('work-ask', {
              durable: true
            });
          }
        });
      });
      const onConnect = function(amqpClient) {


        app.use('/auth', express.static('static'));
        app.use('/auth', unSafeRouteur);
        app.use('/configuration', unSafeRouteur);
        app.use('/data/specific', unSafeRouteur);
        app.use('/data/api', unSafeRouteur);
        app.all('/data/core/*', safe);

        require('./webServices/initialise')(unSafeRouteur, amqpClient);
        require('./webServices/authWebService')(unSafeRouteur, amqpClient);
        require('./webServices/workspaceWebService')(safe, amqpClient);
        require('./webServices/workspaceComponentWebService')(safe, amqpClient);
        require('./webServices/technicalComponentWebService')(safe, unSafeRouteur, app, amqpClient);
        require('./webServices/userWebservices')(safe, amqpClient);
        require('./webServices/rightsManagementWebService')(safe, amqpClient);
        require('./webServices/adminWebService')(safe, amqpClient);
        require('./webServices/fragmentWebService')(safe, amqpClient);

        ///SECURISATION DES REQUETES

        app.get('/', function(req, res, next) {
          res.redirect('/ihm/application.html#myWorkspaces');
        });
        app.use('/ihm', express.static('static', {
          etag: false
        }));

        app.use('/browserify', express.static('browserify'));
        app.use('/npm', express.static('node_modules'));

        let errorLib = require('../core/lib/error_lib');
        let jwtSimple = require('jwt-simple');
        let errorParser = require('error-stack-parser');
        app.use(function(err, req, res, next) {
          if (err) {
            const token = req.body.token || req.query.token || req.headers['authorization'];
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

        app.listen(process.env.APP_PORT || 8080, function(err) {
          console.log('~~ server started at ', "port", process.env.APP_PORT || 8080, err, ':', this.address())
          require('../core/timerScheduler').run();
        })
      }
    }
  });
})
