const inscription_lib_user = require('../../core/lib/inscription_lib')
const auth_lib_user = require('../../core/lib/auth_lib')
const user_lib = require('../../core/lib/user_lib')
const mailService = require('./services/mail')
const jwt = require('jwt-simple')
const moment = require('moment')
const config = require('../configuration')
const errorHandling = require('./errorHandling')

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
  const secret = action == 'recovery_password' ? 'password' : 'mail'

  return jwt.encode(payload, secret)
}

module.exports = function (router) {
  router.get('/passwordforget', async (req, res) => {
    const token = encodeToken(req.query.mail, 'recovery_password')
    const link = ('http://' + req.get('host') + '/ihm/login.html#forgot_password/changePassword?code=' + token + '&mail=' + encodeURIComponent(req.query.mail))
    await user_lib.createUpdatePasswordEntity(req.query.mail, token)
    try {
      const mailOptions = {
        from: 'Grappe, Mot de passe oublié <tech@data-players.com>',
        to: req.query.mail,
        subject: 'Confirmer Votre compte',
        html: 'Bonjour,<br> Merci de cliquer sur le lien suivant pour resilier votre mot de passe. <br><a href=' + link + '>Ici </a>'
      }

      await mailService.sendMail(req, res, mailOptions)
      res.sendStatus(200)
    } catch (e) {
      console.log(e)
      res.sendStatus(500)
    }
  }) // <-- passwordforget

  // --------------------------------------------------------------------------------

  router.get('/secure', async (req, res) => {
    let decodeToken
    let updatePasswordEntity
    try {
      updatePasswordEntity = await user_lib.getPasswordEntity(req.query.mail)
    } catch (e) {
      res.status(404)
    }

    try {
      decodeToken = jwt.decode(updatePasswordEntity.token, 'password')
    } catch (e) {
      try {
        decodeToken = jwt.decode(updatePasswordEntity.token, 'mail')
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
        }
        user_lib.update(user, null)
        res.redirect('/ihm/application.html#profil//edit')
      } catch (e) {
        res.status(500)
      }
    }
  }) // <-- updatePassword

  // --------------------------------------------------------------------------------

  router.post('/inscription', async (req, res) => {
    // change verify for slid token for production
    const token = encodeToken(req.body.emailInscription, 'verify')
    const link = ('http://' + req.get('host') + '/data/auth/secure?code=' + token + '&mail=' + encodeURIComponent(req.body.emailInscription))

    const mailOptions = {
      from: 'Grappe, Confirmer votre email <tech@data-players.com>',
      to: req.body.emailInscription,
      subject: 'Confirmer Votre compte',
      html: 'Bonjour,<br> Merci de cliquer sur le lien suivant pour confirmer votre compte. <br><a href=' + link + '>Ici </a>'
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
      await user_lib.createUpdatePasswordEntity(req.body.emailInscription, token)
      await mailService.sendMail(req, res, mailOptions)
      res.send({ user: usercreate.user, token: usercreate.token.token })
    } catch (e) {
      errorHandling(e, res)
    }
  }) // <= inscription

  // --------------------------------------------------------------------------------

  router.post('/authenticate', async (req, res) => {
    try {
      const data = await auth_lib_user.create({ authentication: { email: req.body.email, password: req.body.password } })
      res.send({
        user: data.user,
        token: data.token
      })
    } catch (e) {
      errorHandling(e, res)
    }
  }) // <= authentification

  // <-------------------------------------   GOOGLE AUTH   ------------------------------------->

  auth_lib_user.google_auth(router)

  // --------------------------------------------------------------------------------

  auth_lib_user.google_auth_callbackURL(router)

  // --------------------------------------------------------------------------------

  auth_lib_user.google_auth_statefull_verification(router)
}
