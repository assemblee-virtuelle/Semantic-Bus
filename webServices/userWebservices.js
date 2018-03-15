'use strict';

var user_lib = require('../lib/core/lib/user_lib');
var payment_lib = require('../lib/core/lib/payment_lib');
var test = require('../scripts/requestTest')


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


module.exports = function (router,stompClient) {


 // ---------------------------------------  ALL USERS  -----------------------------------------


  router.get('/users', function (req, res,next) {
    user_lib.get_all({}).then(function (users) {
      //console.log(users)
      res.send(users)
    }).catch(e => {
      next(e);
    });
  });

  router.post('/users/stripe/:id', function (req, res,next) {
    console.log("IN STRIPE WEBSERVICE", JSON.parse(req.body.card))
    payment_lib.initStripePayement(req.params.id, JSON.parse(req.body.card), req.body.amout).then(function (payment) {
      console.log("IN STRIPE WEBSERVICE RESULT", payment)
      if(payment.state == "done"){
        res.send(payment.data)
      }else if(payment.state =="error"){
        if(payment.err == "user_no_validate"){
          res.send("user_no_validate")
        }else{
          res.send("error")
        }
      }
    }).catch(e => {
      next(e);
    });
  });


  router.post('/users/stripecharge/:id', function (req, res,next) {
    // console.log(req.body.amount, req.body.source, req.params.id)
    payment_lib.addStripePayement(req.body.amount, req.body.source, req.body.secret, req.params.id).then(function (user) {
      console.log("IN STRIPE WEBSERVICE RESULT", user)
      if(user.state == "done"){
        res.send(user.data)
      }else if(user.state =="error"){
        if(user.err == "user_no_validate"){
          res.send("user_no_validate")
        }else{
          res.send("error")
        }
      }
    }).catch(e => {
      next(e);
    });
  });





  router.get('/users/transactions/:id', function (req, res,next) {
    console.log("in web service transaction", req.params.id)
    payment_lib.getAllTransactionList(req.params.id).then(function (user_charges) {
      if(user_charges.state == "done"){
        res.send(user_charges.data)
      }else{
        res.send("error")
      }
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
      //console.log('stompClient',stompClient);
      //console.log("LOADING USER",result)
      res.send(result)
    }).catch(e => {
      next(e);
    });
  });

  router.get('/users/:id/workspaces', function (req, res,next) {
     //console.log("LOADING USER",req.params.id)
     user_lib.userGraph(req.params.id).then((result)=>{
      res.send(result)
     }).catch(e => {
      next(e);
    });
  });


// --------------------------------------------------------------------------------

  router.put('/users/:id', function (req, res) {
    //console.log("req body -----------------", req.body.mailChange)
      user_lib.update(req.body.user, req.body.mailChange).then(function (result) {
        //console.log("update done")
        res.send(result)
      }).catch(function(err){
        //console.log("update error", err)
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


}
