'use strict';

var user_lib = require('../lib/core/lib/user_lib');



// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


module.exports = function (router) {


 // ---------------------------------------  ALL USERS  -----------------------------------------


  router.get('/users', function (req, res) {
    user_lib.get_all({}).then(function (users) {
      console.log(users)
      res.send(users)
    })
  });


  // ---------------------------------------------------------------------------------

  router.get('/users/:id', function (req, res) {
    console.log("LOADING USER",req.params.id)
    user_lib.getWithWorkspace(
          req.params.id, "owner"
    ).then(function (result) {
      console.log("LOADING USER",result)
      res.send(result)
    })
  });

// --------------------------------------------------------------------------------

  router.put('/users/:id', function (req, res) {
      user_lib.update(req.body.user).then(function (result) {
        console.log(result)
        res.send(result)
      })
    });

  // ---------------------------------------  ADMIN  -----------------------------------------

  router.get('/cloneDatabase', function (req, res) {
    var mLabPromise = require('./mLabPromise');
    //console.log('mLabPromise |',mLabPromise);
    mLabPromise.cloneDatabase().then(data => {
      res.json(data)
    });
  });
}
