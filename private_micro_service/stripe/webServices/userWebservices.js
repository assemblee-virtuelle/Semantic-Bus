'use strict';

var payment_lib = require('../core/lib/payment_lib');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


module.exports = function (router,stompClient) {


 // ---------------------------------------  ALL USERS  -----------------------------------------

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

}
