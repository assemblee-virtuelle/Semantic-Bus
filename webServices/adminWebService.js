var error_lib = require('../lib/core').error;
var mLabPromise = require('./mLabPromise');

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

  router.get('/cloneDatabase', function (req, res,next) {
    var mLabPromise = require('./mLabPromise');
    //console.log('mLabPromise |',mLabPromise);
    res.json({message:'work in progress'});
    mLabPromise.cloneDatabase().then(data => {
      //res.json(data)
    }).catch(e => {
      next(e);
    });
  });

  router.get('/workspaceOwnAll/:userId', function(req, res,next) {
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
