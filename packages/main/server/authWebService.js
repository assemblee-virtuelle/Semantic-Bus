const inscription_lib_user = require('@semantic-bus/core/lib/inscription_lib')
const auth_lib_user = require('@semantic-bus/core/lib/auth_lib')
const user_lib = require('@semantic-bus/core/lib/user_lib')
const mailService = require('./services/mail')
const jwt = require('jwt-simple')
const moment = require('moment')
const config = require('../config.json')
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

const encodeToken = (mail, action) => {
  const payload = {
    exp: moment().add(600, 'seconds').unix(),
    iat: moment().unix(),
    iss: mail,
    subject: action
  }
  const secret = action == 'recovery_password' ? config.recorvery_passwordToken || 'secret' : config.verify_mailToken || 'secret'

  return jwt.encode(payload, secret)
}

module.exports = function (router) {
  router.get('/passwordforget', async (req, res, next) => {
    try {
      // Validate required field
      if (!req.query.mail) {
        return res.status(400).send({
          error: 'Email is required',
          details: 'Missing required mail parameter'
        })
      }

      const token = encodeToken(req.query.mail, 'recovery_password')
      const link = ('http://' + req.get('host') + '/ihm/login.html#forgot_password_changePassword?code=' + token + '&mail=' + encodeURIComponent(req.query.mail))
      await user_lib.createUpdatePasswordEntity(req.query.mail, token)

      const mailOptions = {
        from: 'tech@data-players.com',
        to: req.query.mail,
        subject: 'Mot de passe oublié',
        text: 'Bonjour,\nMerci de cliquer sur le lien suivant pour changer votre mot de passe.\n' + link
      }

      try {
        await mailService.sendMail(req, res, mailOptions)
        console.log('Password reset email sent successfully')
        res.sendStatus(200)
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        res.sendStatus(500)
      }
    } catch (e) {
      console.error('Error in password forget process:', e)
      res.sendStatus(500)
    }
  }) // <-- passwordforget

  // --------------------------------------------------------------------------------

  router.get('/secure', async (req, res, next) => {
    let decodeToken
    let updatePasswordEntity
    try {
      updatePasswordEntity = await user_lib.getPasswordEntity(req.query.mail)
    } catch (e) {
      res.status(404)
    }

    try {
      decodeToken = jwt.decode(updatePasswordEntity.token, config.recorvery_passwordToken || 'secret')
    } catch (e) {
      try {
        decodeToken = jwt.decode(updatePasswordEntity.token, config.verify_mailToken || 'secret')
      } catch (e) {
        res.sendStatus(403)
      }
    }

    if (decodeToken.subject == 'recovery_password') {
      if (Date.now() < decodeToken.exp * 1000) {
        let user = await user_lib.get({ 'credentials.email': req.query.mail })
        user.new_password = req.body.user.password
        await user_lib.update(user, null)
        res.sendStatus(200)
      } else {
        res.sendStatus(403)
      }
    } else {
      try {
        let user = await user_lib.get({ 'credentials.email': decodeToken.iss })
        if (!user.active) {
          user.active = true
          user.credit = 2000
          await user_lib.update(user, null)
        }
        res.redirect('/ihm/application.html#profil//edit')
      } catch (e) {
        res.sendStatus(500)
      }
    }
  }) // <-- updatePassword

  // --------------------------------------------------------------------------------

  router.post('/inscription', async (req, res, next) => {
    // Validate required fields
    if (!req.body.emailInscription || !req.body.passwordInscription || !req.body.confirmPasswordInscription) {
      return res.status(400).send({
        error: 'Email, password and password confirmation are required',
        details: 'Missing required inscription parameters'
      })
    }

    // change verify for slid token for production
    const token = encodeToken(req.body.emailInscription, 'verify')
    const link = ('http://' + req.get('host') + '/data/auth/secure?code=' + token + '&mail=' + encodeURIComponent(req.body.emailInscription))

    const mailOptions = {
      from: 'tech@data-players.com',
      to: req.body.emailInscription,
      subject: 'Confirmer Votre compte',
      text: 'Bonjour,\nMerci de cliquer sur le lien suivant pour confirmer votre compte Grappe.\n' + link
    }
    const user = {
      name: req.body.name,
      job: req.body.job,
      society: req.body.societe,
      email: req.body.emailInscription,
      passwordConfirm: req.body.confirmPasswordInscription,
      password: req.body.passwordInscription
    }
    try {
      let usercreate = await inscription_lib_user.create({ user })
      try {
        await user_lib.createUpdatePasswordEntity(req.body.emailInscription, token)
        // Send email but don't wait for response - let the main response happen
        mailService.sendMail(req, res, mailOptions).then((info) => {
            // console.log('Email sent successfully:', info)
        }).catch((error) => {
          console.error('Error sending email:', error)
        })
        // Send the main response immediately
        res.send({ user: usercreate.user, token: usercreate.token.token })
      } catch (e) {
        console.error('Error in password entity creation:', e)
        return res.sendStatus(500)
      }
    } catch (e) {
      next(e)
    }
  }) // <= inscription

  // --------------------------------------------------------------------------------

  router.post('/authenticate', async (req, res, next) => {
    try {
      // Validate required fields
      if (!req.body.email || !req.body.password) {
        return res.status(400).send({
          error: 'Email and password are required',
          details: 'Missing required authentication parameters'
        })
      }

      const data = await auth_lib_user.create({ authentication: { email: req.body.email, password: req.body.password } })
      res.send({
        user: data.user,
        token: data.token
      })
    } catch (e) {
      next(e)
    }
  }) // <= authentification

  // <-------------------------------------   GOOGLE AUTH   ------------------------------------->

  auth_lib_user.google_auth(router)

  // --------------------------------------------------------------------------------

  auth_lib_user.google_auth_callbackURL(router)

  // --------------------------------------------------------------------------------

  auth_lib_user.google_auth_statefull_verification(router)
}
