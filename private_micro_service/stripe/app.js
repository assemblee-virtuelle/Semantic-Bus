"use strict";

var express = require('express')
var cors = require('cors')
var app = express();
app.use(cors());

var http = require('http');
var server = http.Server(app);
var safe = express.Router();
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

const configUrl = env.CONFIG_URL

httpGet.makeRequest('GET', {
  url: configUrl
}).then(result => {
  const configJson = result.data;
  const content = 'module.exports = ' + JSON.stringify(result.data);

  fs.writeFile("configuration.js", content, 'utf8', function(err) {
    if (err) {
      throw err;
    } else {
      var jwtService = require('./webServices/jwtService')


      //Sécurisation des route de data
      safe.use(function(req, res, next) {
        jwtService.securityAPI(req, res, next);
      })


      app.disable('etag'); //what is that? cache desactivation in HTTP Header

      unSafeRouteur.use(cors());
      
      require('./webServices/userWebservices')(safe);
      app.use('/data/core', safe);

      let errorLib = require('../core/lib/error_lib');
      let jwtSimple = require('jwt-simple');
      let errorParser = require('error-stack-parser');
      app.use(function(err, req, res, next) {
        if (err) {
          var token = req.body.token || req.query.token || req.headers['authorization'];
          let user;
          if (token != undefined) {
            token.split("");
            let decodedToken = jwtSimple.decode(token.substring(4, token.length), configJson.secret);
            user = decodedToken.iss;
          }
          errorLib.create(err, user);
          if (!Array.isArray(err)) {
            err = [err];
          }
          res.status(500).send(
            err.map(e => {
              return {
                message: e.message,
                stack: errorParser.parse(e),
                displayMessage: e.displayMessage
              }
            })
          );
        }
      });

        app.listen(process.env.APP_PORT || 8080, function(err) {
          console.log('~~ server started at ', "port", process.env.APP_PORT || 8080, err, ':', this.address())
          require('../core/timerScheduler').run();
        })
      }
  });
})
