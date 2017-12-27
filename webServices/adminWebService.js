var error_lib = require('../lib/core').error;
var mLabPromise = require('./mLabPromise');
var configuration = require('../configuration');
var sift = require('sift');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------



module.exports = function(router) {


  // --------------------------------------------------------------------------------

  router.get('/errors', function(req, res, next) {
    error_lib.getAll().then(function(errors) {
      res.json(errors)
    }).catch(e => {
      next(e);
    })
  });

  router.get('/cloneDatabase', function(req, res, next) {
    var mLabPromise = require('./mLabPromise');
    //console.log('mLabPromise |',mLabPromise);
    res.json({
      message: 'work in progress'
    });
    mLabPromise.cloneDatabase().then(data => {
      //res.json(data)
    }).catch(e => {
      next(e);
    });
  });

  router.get('/dbScripts', function(req, res, next) {
    //console.log(configuration);
    let scripts = [];
    if (configuration.importScripts != undefined) {
      scripts = configuration.importScripts.map(r => {
        return {
          identifier: r.identifier,
          desc: r.desc
        }
      });
    }
    res.json(scripts);

  });

  router.post('/dbScripts', function(req, res, next) {
console.log('EXECUTION');
    //console.log(configuration);
    res.json({message:'in progress'});
    var token = req.body.token || req.query.token || req.headers['authorization'];
    //console.log('token |',token);
    let user;
    let jwtSimple = require('jwt-simple');
    if (token != undefined) {
      token.split("");
      let decodedToken = jwtSimple.decode(token.substring(4, token.length), configuration.secret);
      user = decodedToken.iss;
      //console.log('user |',user);
    }
    let scripts=req.body;
    for(script of scripts){
      let scriptConfig = sift({identifier:script.identifier},configuration.importScripts)[0];
      let scriptObject= require('../scripts/'+scriptConfig.script);
      scriptObject.work(user);
    }

  });

  router.get('/workspaceOwnAll/:userId', function(req, res, next) {
    console.log('ownAll');
    var userId = req.params.userId;
    var userPromise = mLabPromise.request('GET', 'users/' + userId);
    var workspacePromise = mLabPromise.request('GET', 'workspaces');
    var promises = [userPromise, workspacePromise]
    Promise.all(promises).then(function(res) {
      //console.log('ALLO');
      var user = res[0];
      var workspaces = res[1];
      var workspacesTable = [];
      //console.log(workspaces);
      for (workspace of workspaces) {
        workspacesTable.push({
          _id: workspace._id.$oid,
          role: "owner"
        });
      }
      user.workspaces = workspacesTable;
      //console.log(workspaces);
      //return new Promise((resolve,reject)=>{resolve({})});
      return mLabPromise.request('PUT', 'users/' + user._id.$oid, user);
    }).then(function(data) {
      console.log('own all done');
      res.json(data);
    }).catch(e => {
      next(e);
    });
  });
}
