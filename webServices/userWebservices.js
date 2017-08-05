'use strict';

var user_lib = require('../lib/core').user


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


  // --------------------------------------------------------------------------------

  router.get('/users/:id', function (req, res) {
    console.log("LOADING USER",req.params.id)
    user_lib.get({
          _id: req.params.id
        }
    ).then(function (result) {
      console.log("LOADING USER",result)
      res.send(result)
    })
  });

// --------------------------------------------------------------------------------

  router.put('/users/:id', function (req, res) {
    console.log(req.params.id)
      user_lib.update(req.params.id, {user : {
        email: req.body.email
      }}).then(function (result) {
        console.log(result)
        res.send(result)
      })
    });

  // ---------------------------------------  ADMIN  -----------------------------------------

  router.get('/cloneDatabase', function (req, res) {
    mLabPromise.cloneDatabase().then(data => {
      res.json(data)
    });
  });
}