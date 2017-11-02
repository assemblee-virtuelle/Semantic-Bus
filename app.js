"use strict";
var express = require('express')
var cors = require('cors')
var app = express();
app.use(cors());
var jenkins = process.env.JENKINS_DEPLOY || false;

var passport = require('passport');

var server = require('http').Server(app);
var https = require('https');
var http = require('http');


var safe = express.Router();
var unSafeRouteur = express.Router();

var bodyParser = require("body-parser");
app.use(bodyParser.json({
  limit: '5mb'
}));
app.use(bodyParser.urlencoded({
  limit: '5mb',
  extended: true
}));
safe.use(bodyParser.json()); // used to parse JSON object given in the request body
var env = process.env;



var httpGet = require('./webServices/workSpaceComponentDirectory/restGetJson.js');
var fs = require('fs');
const configUrl = env.CONFIG_URL || 'http://app-cee3fd62-a81e-48b2-a766-a8be305d5fa9.cleverapps.io/file/master';
//console.log("before http config",configUrl);
httpGet.makeRequest('GET', configUrl).then(result => {
  console.log('~~ remote config | ', result);
  const configJson = result.data;
  const content = 'module.exports = ' + JSON.stringify(result.data);



  fs.writeFile("configuration.js", content, 'utf8', function (err) {
    if (err) {
      return console.log(err);
    } else {

      //console.log("~~ remote configuration saved");
      require('./lib/core/Oauth/google_auth_strategy')(passport);

      var jwtService = require('./webServices/jwtService')


      //Sécurisation des route de data
      safe.use(function (req, res, next) {
        // ensureSec(req,res,next)
        jwtService.securityAPI(req, res, next);
      })



      app.disable('etag'); //what is that? cache desactivation in HTTP Header

      unSafeRouteur.use(cors());

      require('./webServices/initialiseHTTPS')(unSafeRouteur);
      require('./webServices/authWebService')(unSafeRouteur);
      require('./webServices/workspaceWebService')(safe);
      require('./webServices/workspaceComponentWebService')(safe);
      require('./webServices/technicalComponentWebService')(safe, unSafeRouteur);
      require('./webServices/userWebservices')(safe);
      require('./webServices/rightsManagementWebService')(safe);
      require('./webServices/adminWebService')(safe);

      ///OTHER APP COMPONENT
      ///SECURISATION DES REQUETES

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
      app.use(function (err, req, res, next) {
        if (err) {
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
          console.log('XXXXXXXXXXX',res);
          res.status(500).send({
            message: err.message,
            stack: errorParser.parse(err),
            displayMessage: err.displayMessage
          });
        }
        //able to centralise response using res.data ans res.send(res.data)
      });

      server.listen(process.env.PORT || 8080, function () {
        console.log('~~ server started at ', this.address().address, ':', this.address().port)
        require('./timerScheduler').run(this.address());

        if (jenkins) {
          console.log("jenkins is true");
          http.get('http://bkz2jalw7c:3bdcf7bc40f582a4ae7ff52f77e90b24@tvcntysyea-jenkins.services.clever-cloud.com:4003/job/semanticbus-pic-3/build?token=semantic_bus_token', function (res) {
            console.log("jenkins JOB 3 is trigger")
          })
        }
        // console.log('Listening on port  ');
        // console.log(this.address().port);
        //console.log('new message from master 18');
        //console.log(this.address());
      })

      // Lets encrypt response

      app.get('/.well-known/acme-challenge/:challengeHash', function (req, res) {
        var params = req.params.challengeHash.substr(0, req.params.challengeHash.length)
        var hash = params + ".rCIAnB6OZN-jvB1XIOagkbUTKQQmQ1ogeb5DUVFNUko";
        res.send(hash)
      });

      /// Nous Securisons desormais IHM par un appel AJAX
      /// à lentrée sur la page application.html

      server.on('error', function (err) {
        console.log(err)
      })
    }
  });
})
