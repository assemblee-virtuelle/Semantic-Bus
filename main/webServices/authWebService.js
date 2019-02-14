const securityService = require('./securityService')
const inscription_lib_user = require('../../core/lib/inscription_lib')
const auth_lib_user = require('../../core/lib/auth_lib')
const configuration = require('../configuration')
const nodemailer = require('nodemailer')
const url = './login.html?google_token='
const user_lib = require('../../core/lib/user_lib')
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = function (router, stompClient) {
  // TODO ugly
  this.stompClient = stompClient

  const sendMail = function (rand, req, email, id, res) {
    return new Promise(function (resolve, reject) {
      const link = 'http://' + req.get('host') + '/auth/verify?id=' + rand + '&userid=' + id
      let transporter = nodemailer.createTransport(configuration.smtp, {
        from: 'Grappe, Confirmer votre email <tech@data-players.com>',
        headers: {
          'X-Laziness-level': 1000 // just an example header, no need to use this
        }
      })
      var mailOptions = {
        to: email,
        subject: 'Confirmer Votre compte',
        html: 'Bonjour,<br> Merci de cliquer sur le lien suivant pour confirmer votre compte. <br><a href=' + link + '>Ici </a>'
      }
      transporter.sendMail(mailOptions, function (error) {
        if (error) {
          reject(error)
        } else {
          resolve('mail sent')
        }
      })
    })
  } // <-- sendMail

  const sendMailPassword = function (rand, req, email, id, res, user) {
    return new Promise(function (resolve, reject) {
      const link = 'http://' + req.get('host') + '/auth/login.html#forgot_password/changePassword?u=' + id + '&code=' + rand

      // Create a SMTP transporter object
      const transporter = nodemailer.createTransport(configuration.smtp, {
        from: 'Grappe, Mettez à jour votre mot de Passe <tech@data-players.com>',
        headers: {
          'X-Laziness-level': 1000 // just an example header, no need to use this
        }
      })

      var mailOptions = {
        to: email,
        subject: 'Mettez à jour votre mot de Passe',
        html: 'Bonjour ,<br> Mettez à jour votre mot de Passe, <br> <br> Votre code est le suivant <h2>' + rand + '</h1><br><a href=' + link + '>Cliquez ici </a>'
      }

      transporter.sendMail(mailOptions, function (error, response) {
        if (error) {
          reject(error)
        } else {
          resolve('mail sent')
        }
      })
    })
  } // <-- sendMailPassword

  router.get('/verify', function (req, res) {
    // console.log(req.query.userid)
    user_lib.get({
      _id: req.query.userid
    }).then((user) => {
      // console.log(user, req.query.id, user.mailid)
      if (req.query.id == user.mailid) {
        user.active = true
        user.credit = 2000
        user_lib.update(user, null).then(function (result) {
          res.redirect('https://semantic-bus.org/ihm/application.html')
        }).catch(function (err) {
          if (err) {
            res.send({
              err: 'load error'
            })
          }
        })
      }
    })
  }) // <-- mailVerification

  router.post('/is_authorize_component', function (req, res) {
    let code = req.body[1].split('&code=')[1]
    let userId = req.body[1].split('&code=')[0].split('u=')[1]
    // console.log(userId, code)
    user_lib.get({
      _id: userId
    }).then((user) => {
      if (code == user.resetpasswordmdp) {
        res.send({
          state: 'authorize',
          userId: userId
        })
      } else {
        res.send({
          state: 'unauthorize'
        })
      }
    }).catch(function (err) {
      if (err) {
        res.send({
          state: 'no_user'
        })
      }
    })
  }) // <-- mailVerification

  router.post('/updatepassword', function (req, res) {
    user_lib.get({
      _id: req.body.id
    }).then((user) => {
      if (Date.now() < user.resetpasswordtoken + 600000) {
        user.new_password = req.body.new_password
        user_lib.update(user, null).then(function (result) {
          console.log('UPDATE DONE', result)
          res.send({
            state: 'password_update'
          })
        }).catch(function (err) {
          if (err) {
            res.send({
              state: 'bad_password'
            })
          }
        })
      } else {
        res.send({
          state: 'token_expired'
        })
      }
    }).catch(function (err) {
      if (err) {
        res.send({
          state: 'no_user'
        })
      }
    })
  }) // <-- updatePassword

  router.get('/verifycode/:id/:code', function (req, res) {
    console.log(req.params.id)
    user_lib.get({
      _id: req.params.id
    }).then((user) => {
      if (Date.now() < user.resetpasswordtoken + 600000) {
        if (req.params.code == user.resetpasswordmdp) {
          res.send({
            state: 'good_code'
          })
        } else {
          res.send({
            state: 'bad_code'
          })
        }
      } else {
        res.send({
          state: 'token_expired'
        })
      }
    })
  }) // <-- mailVerification

  router.get('/sendbackmail/:id', function (req, res) {
    user_lib.get({
      _id: req.params.id
    }).then((user) => {
      sendMail(user.mailid, req, user.credentials.email, user._id, res).then((result) => {
        res.send('mail_sent')
      }).catch((err) => {
        res.send({
          err: 'mail_not_sent |' + err
        })
      })
    })
  }) // <-- sendbackmail

  router.get('/passwordforget/:email', function (req, res) {
    user_lib.get({
      'credentials.email': req.params.email
    }).then((user) => {
      let rand = Math.floor((Math.random() * 100000))
      user.resetpasswordtoken = Date.now()
      user.resetpasswordmdp = rand
      user_lib.update(user, null).then(function (result) {
        sendMailPassword(rand, req, user.credentials.email, user._id, res).then((result) => {
          res.send({
            user: user,
            state: 'mail_sent'
          })
        }).catch((err) => {
          res.send({
            state: 'mail_not_sent'
          })
        })
      })
    }).catch((err) => {
      res.send({
        state: 'no_user'
      })
    })
  }) // <-- passwordforget

  // -------------------------------------------------------------------------------

  router.post('/isTokenValid', function (req, res) {
    // console.log(this);
    if (req.body.token) {
      // console.log("isTokenValid",req.body.token);
      securityService.require_token(req.body.token).then(function (token_result) {
        // console.log('isTokenValid',token_result);
        if (token_result != false) {
          user_lib.getWithWorkspace(token_result.iss).then(u => {
            token_result.profil = u
            res.send(token_result)
          })
        }
      }).catch((err) => {
        res.send(false)
      })
    }
  }) // <= isTokenValid

  // --------------------------------------------------------------------------------

  router.post('/inscription', function (req, res) {
    let rand = Math.floor((Math.random() * 100) + 54)
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
      })
    }).catch(function (err) {
      if (err == 'name_bad_format') {
        res.send({
          err: 'name_bad_format'
        })
      }
      if (err == 'job_bad_format') {
        res.send({
          err: 'job_bad_format'
        })
      }
      if (err == 'bad_email') {
        res.send({
          err: 'bad_email'
        })
      }
      if (err == 'user_exist') {
        res.send({
          err: 'user_exist'
        })
      }
    })
  }) // <= inscription

  // --------------------------------------------------------------------------------

  router.post('/authenticate', function (req, res) {
    auth_lib_user.create({
      authentication: {
        email: req.body.email,
        password: req.body.password
      }
    }).then(function (data) {
      // console.log("authenticate =====>", data)
      res.send({
        user: data.user,
        token: data.token
      })
    }).catch(function (err) {
      if (err == 'google_user') {
        res.send({
          err: 'google_user'
        })
      } else if (err == 'no_account_found') {
        res.send({
          err: 'no_account_found'
        })
      } else if (err = 'compare_bcrypt') {
        res.send({
          err: 'probleme_procesus'
        })
      }
    })
  }) // <= authentification

  // <-------------------------------------   GOOGLE AUTH   ------------------------------------->

  auth_lib_user.google_auth(router)

  // --------------------------------------------------------------------------------

  auth_lib_user.google_auth_callbackURL(router, url)

  // --------------------------------------------------------------------------------

  auth_lib_user.google_auth_statefull_verification(router)

  // --------------------------------------------------------------------------------
}
