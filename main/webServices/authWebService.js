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

  // --------------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------------

  router.get('/passwordforget?mail=:mail', function (req, res) {
    user_lib.get({
      'credentials.email': req.params.mail
    }).then(async (user) => {
      let rand = Math.floor((Math.random() * 100000))
      console.log("RAND", rand)
      await user_lib.createUpdatePasswordEntity(req.params.mail, rand)
      try {
        await sendMailPassword(rand, req, user.credentials.mail, user._id, res)
        res.send({ user })
      } catch (e) {
        console.log(e)
        res.send(e)
      }
    })
  }) // <-- passwordforget

  // --------------------------------------------------------------------------------

  router.post('/update-password?code=:code&mail=:mail', async (req, res) => {
    let updatePasswordEntity = await user_lib.getPasswordEntity({ userMail: req.params.mail })
    console.log('sds', req.params.code, updatePasswordEntity.token)
    if (req.params.code === updatePasswordEntity.token && Date.now() < updatePasswordEntity.timeStamp + 600000) {
      let user = await user_lib.get({ 'credentials.email': req.params.email })
      user.new_password = req.body.new_password
      await user_lib.update(user, null)
      console.log('200')
      res.send({
        state: 'password_update'
      })
    } else {
      console.log('401')
    }
  }) // <-- updatePassword

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
    }).then((data) => {
      // console.log("inscription data ====>", data.token)
      sendMail(rand, req, req.body.emailInscription, data.token.user)
      res.send({
        user: data.user,
        token: data.token.token
      })
    }).catch(function (err) {
      console.log(err)
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
}
