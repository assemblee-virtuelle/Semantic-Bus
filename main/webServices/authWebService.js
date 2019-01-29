var jwtService = require('./jwtService');
var inscription_lib_user = require('../../core/lib/inscription_lib')
var auth_lib_user = require('../../core/lib/auth_lib');
var user_lib = require('../../core/lib/auth_lib');
var configuration = require('../configuration')
var nodemailer = require("nodemailer");
var url = './login.html?google_token='
var user_lib = require('../../core/lib/user_lib');
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


module.exports = function (router,stompClient) {

  //TODO ugly
  this.stompClient=stompClient;

  let sendMail = function (rand, req, email, id, res) {
    return new Promise(function (resolve, reject) {
      host = req.get('host');
      console.log("SEND MAIL", email + " : " + id)
      link = "http://" + req.get('host') + "/auth/verify?id=" + rand + '&userid=' + id;
      // Create a SMTP transporter object
      console.log("SEND MAIL", link)
      let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          type: 'OAuth2',
          user: "semanticbusdev@gmail.com",
          clientId: "497545161510-jevr8h52tl51j5gsd208icp5bbbi9suq.apps.googleusercontent.com",
          clientSecret: "e-0uRyWiFqkbpCVWQGMh-EpW",
          refreshToken: "1/Xv9sWJCgiCUVX9q_9iYBQs4sMsi4wvxS35kfqudJW9A",
          expires: 12345
        },
        debug: true // include SMTP traffic in the logs
      }, {
        // default message fields
        // sender info
        from: 'Le bus, Confirmer votre email <semanticbusdev@gmail.com>',
        headers: {
          // 'X-Laziness-level': 1000 // just an example header, no need to use this
        }
      });
      var mailOptions = {
        to: email,
        subject: "Please confirm your Email account",
        html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
      }
      transporter.sendMail(mailOptions, function (error, response) {
        if (error) {
          console.log(error);
          reject(error)
        } else {
          resolve("mail sent");
        }
      });
    })
  } //<-- sendMail



  let sendMailPassword = function (rand, req, email, id, res, user) {
    return new Promise(function (resolve, reject) {
      host = req.get('host');
      console.log("SEND MAIL", email + " : " + id)
      //
      link = "http://" + req.get('host') + '/auth/login.html#forgot_password/changePassword?u=' + id + '&code=' + rand
      // Create a SMTP transporter object
      let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          type: 'OAuth2',
          user: "semanticbusdev@gmail.com",
          clientId: "497545161510-jevr8h52tl51j5gsd208icp5bbbi9suq.apps.googleusercontent.com",
          clientSecret: "e-0uRyWiFqkbpCVWQGMh-EpW",
          refreshToken: "1/Xv9sWJCgiCUVX9q_9iYBQs4sMsi4wvxS35kfqudJW9A",
          expires: 12345
        },
        debug: true // include SMTP traffic in the logs
      }, {
        // default message fields
        // sender info
        from: 'Le bus, Confirmer votre email <semanticbusdev@gmail.com>',
        headers: {
          // 'X-Laziness-level': 1000 // just an example header, no need to use this
        }
      });
      var mailOptions = {
        to: email,
        subject: "Please click here for reset your password",
        html: "Hello,<br> Please Click on the link to verify your email.<br> <br> Votre code est le suivant <h2>" + rand + "</h1><br><a href=" + link + ">Click here to verify</a>"
      }
      transporter.sendMail(mailOptions, function (error, response) {
        if (error) {
          console.log(error);
          reject(error)
        } else {
          resolve("mail sent");
        }
      });
    })
  } //<-- sendMailPassword


  router.get('/verify', function (req, res) {
    //console.log(req.query.userid)
    user_lib.get({
      _id: req.query.userid
    }).then((user) => {
      //console.log(user, req.query.id, user.mailid)
      if (req.query.id == user.mailid) {
        user.active = true
        user_lib.update(user, null).then(function (result) {
          res.redirect('https://semantic-bus.org/ihm/application.html')
        }).catch(function (err) {
          if (err) {
            res.send({
              err: "load error"
            })
          }
        })
      }
    })
  }); //<-- mailVerification


  router.get('/payement', function (req, res) {
    console.log("IN PAEMENT WEBHOOK", req.query)
    // user_lib.get({
    //   _id: req.query.userid
    // }).then((user) => {
    //   console.log(user, req.query.id, user.mailid)
    //   if (req.query.id == user.mailid) {
    //     user.active = true
    //     user_lib.update(user, null).then(function (result) {
    //       res.redirect('https://semantic-bus.org/ihm/application.html')
    //     }).catch(function (err) {
    //       if (err) {
    //         res.send({
    //           err: "load error"
    //         })
    //       }
    //     })
    //   }
    // })
  }); //<-- mailVerification


  router.post('/is_authorize_component', function (req, res) {
    console.log("is_authorize_component", req.body)
    let code = req.body[1].split("&code=")[1]
    let userId = req.body[1].split("&code=")[0].split("u=")[1]
    //console.log(userId, code)
    user_lib.get({
      _id: userId
    }).then((user) => {
      if (code == user.resetpasswordmdp) {
        res.send({
          state: "authorize",
          userId: userId
        })
      } else {
        res.send({
          state: "unauthorize"
        })
      }
    }).catch(function (err) {
      if (err) {
        res.send({
          state: "no_user"
        })
      }
    })
  }); //<-- mailVerification


  router.post('/updatepassword', function (req, res) {
    user_lib.get({
      _id: req.body.id
    }).then((user) => {
      console.log("UPDATE START", user)
      if (Date.now() < user.resetpasswordtoken + 600000) {
        user.new_password = req.body.new_password
        user_lib.update(user, null).then(function (result) {
          console.log("UPDATE DONE", result)
          res.send({
            state: "password_update"
          })
        }).catch(function (err) {
          if (err) {
            res.send({
              state: "bad_password"
            })
          }
        })
      }else{
        res.send({
          state: "token_expired"
        })
      }
    }).catch(function (err) {
      if (err) {
        res.send({
          state: "no_user"
        })
      }
    })
  }); //<-- updatePassword



  router.get('/verifycode/:id/:code', function (req, res) {
    console.log(req.params.id)
    user_lib.get({
      _id: req.params.id
    }).then((user) => {
      if (Date.now() < user.resetpasswordtoken + 600000) {
        if (req.params.code == user.resetpasswordmdp) {
          res.send({
            state: "good_code"
          })
        } else {
          res.send({
            state: "bad_code"
          })
        }
      } else {
        res.send({
          state: "token_expired"
        })
      }
    })
  }); //<-- mailVerification



  router.get('/sendbackmail/:id', function (req, res) {
    user_lib.get({
      _id: req.params.id
    }).then((user) => {
      sendMail(user.mailid, req, user.credentials.email, user._id, res).then((result) => {
        console.log("MAIL SENT", result)
        res.send('mail_sent')
      }).catch((err) => {
        res.send({
          err: "mail_not_sent |" + err
        })
      });
    })
  }) //<-- sendbackmail



  router.get('/passwordforget/:email', function (req, res) {
    console.log("IN SEND BACK END PASSWORD -", req.params.email)
    user_lib.get({
      "credentials.email": req.params.email
    }).then((user) => {
      let rand = Math.floor((Math.random() * 100000));
      user.resetpasswordtoken = Date.now()
      user.resetpasswordmdp = rand
      user_lib.update(user, null).then(function (result) {
        console.log("user update ===>", result)
        sendMailPassword(rand, req, user.credentials.email, user._id, res).then((result) => {
          console.log("MAIL SENT", result)
          res.send({
            user: user,
            state: 'mail_sent'
          })
        }).catch((err) => {
          res.send({
            state: "mail_not_sent"
          })
        });
      })
    }).catch((err) => {
      res.send({
        state: "no_user"
      })
    });
  }) //<-- passwordforget


  // -------------------------------------------------------------------------------

  router.post('/isTokenValid', function (req, res) {
    //console.log(this);
    //console.log('stompClient 1',this.stompClient);
    if (req.body.token) {
      //console.log("isTokenValid",req.body.token);
      jwtService.require_token(req.body.token).then(function (token_result) {
        //console.log('isTokenValid',token_result);
        if (token_result != false) {
          user_lib.getWithWorkspace(token_result.iss).then(u=>{
            token_result.profil=u;
            res.send(token_result);
          })
        }
      }).catch((err) => {
        console.log("error is token valid web service",err)
          res.send(false)
      })
    }
  }.bind(this)); // <= isTokenValid


  // --------------------------------------------------------------------------------

  router.post('/inscription', function (req, res) {
    let rand = Math.floor((Math.random() * 100) + 54);
    console.log("BODY", req.body)
    inscription_lib_user.create({
      user: {
        mailid: rand,
        name: req.body.name,
        job: req.body.job,
        society: req.body.societe,
        email: req.body.emailInscription,
        passwordConfirm: req.body.confirmPasswordInscription,
        password: req.body.passwordInscription
      }
    }).then(function (data) {
      // console.log("inscription data ====>", data.token)
      sendMail(rand, req, req.body.emailInscription, data.token.user)
      res.send({
        user: data.user,
        token: data.token.token
      });
    }).catch(function (err) {
      if (err == 'name_bad_format') {
        res.send({
          err: "name_bad_format"
        })
      }
      if (err == 'job_bad_format') {
        res.send({
          err: "job_bad_format"
        })
      }
      if (err == 'bad_email') {
        res.send({
          err: "bad_email"
        })
      }
      if (err == "user_exist") {
        res.send({
          err: "user_exist"
        })
      }
    })
  }); // <= inscription

  // --------------------------------------------------------------------------------

  router.post('/authenticate', function (req, res) {
    auth_lib_user.create({
      authentication: {
        email: req.body.email,
        password: req.body.password
      }
    }).then(function (data) {
      //console.log("authenticate =====>", data)
      res.send({
        user: data.user,
        token: data.token
      });
    }).catch(function (err) {
      if (err == "google_user") {
        res.send({
          err: "google_user"
        })
      } else if (err == "no_account_found") {
        res.send({
          err: "no_account_found"
        })
      } else if (err = "compare_bcrypt") {
        res.send({
          err: "probleme_procesus"
        })
      }
    })
  }); // <= authentification

  //<-------------------------------------   GOOGLE AUTH   ------------------------------------->

  auth_lib_user.google_auth(router)

  // --------------------------------------------------------------------------------


  auth_lib_user.google_auth_callbackURL(router, url)

  // --------------------------------------------------------------------------------


  auth_lib_user.google_auth_statefull_verification(router)

  // --------------------------------------------------------------------------------


}
