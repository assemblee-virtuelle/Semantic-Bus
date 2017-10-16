'use strict';

var user_lib = require('../lib/core/lib/user_lib');



// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


module.exports = function (router) {


 // ---------------------------------------  ALL USERS  -----------------------------------------


  router.get('/users', function (req, res,next) {
    user_lib.get_all({}).then(function (users) {
      console.log(users)
      res.send(users)
    }).catch(e => {
      next(e);
    });
  });


  // ---------------------------------------------------------------------------------

  router.get('/users/:id', function (req, res,next) {
  //  console.log("LOADING USER",req.params.id)
    user_lib.getWithWorkspace(
          req.params.id, "owner"
    ).then(function (result) {
      //console.log("LOADING USER",result)
      res.send(result)
    }).catch(e => {
      next(e);
    });
  });

// --------------------------------------------------------------------------------

  router.put('/users/:id', function (req, res) {
    console.log("req body -----------------", req.body.mailChange)
      user_lib.update(req.body.user, req.body.mailChange).then(function (result) {
        console.log("update done")
        res.send(result)
      }).catch(function(err){
        console.log("update error", err)
        if(err == "google_user"){
          res.send({err: "google_user"})
        }
        if(err == "email_already_use"){
          res.send({err: "email_already_use"})
        }
        if(err = "bad_format_email"){
          res.send({err: "bad_format_email"})
        }
        if(err == "bad_format_job"){
          res.send({err: "bad_format_job"})
        }
        if(err == "bad_format_society"){
          res.send({err: "bad_format_society"})
        }
      })
    });

  // ---------------------------------------  ADMIN  -----------------------------------------

  router.get('/cloneDatabase', function (req, res,next) {
    var mLabPromise = require('./mLabPromise');
    //console.log('mLabPromise |',mLabPromise);
    mLabPromise.cloneDatabase().then(data => {
      res.json(data)
    }).catch(e => {
      next(e);
    });
  });
}
