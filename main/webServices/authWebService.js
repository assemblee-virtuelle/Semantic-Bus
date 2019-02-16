const inscription_lib_user = require('../../core/lib/inscription_lib')
const auth_lib_user = require('../../core/lib/auth_lib')
const user_lib = require('../../core/lib/user_lib')
const mailService = require('./services/mail')
const jwt = require('jwt-simple')
const moment = require('moment')
const config = require('../configuration')
const Error = require('../../core/helpers/error')

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

const encodeToken = (mail, action) => {
  const payload = {
    exp: moment().add(14, 'days').unix(),
    iat: moment().unix(),
    iss: mail,
    subject: action
  }
  // const secret = action == 'recovery_password' ? config.scretMailPassword : config.secretMailVerify
  const secret = action == 'recovery_password' ? 'password' : 'mail'

  return jwt.encode(payload, secret)
}

const errorHandling = (e, res) => {
  console.log(e instanceof Error.UniqueEntityError)
  if (e instanceof Error.DataBaseProcessError) {
    console.log('DataBaseProcessError', e)
    res.status(500).send({
      success: false,
      message: 'Erreur Interne'
    })
  }
  if (e instanceof Error.UniqueEntityError) {
    console.log('UniqueEntityError', e)
    res.status(400).send({
      success: false,
      message: 'Un ' + e.details + ' existe déjà'
    })
  }
  if (e instanceof Error.PropertyValidationError) {
    console.log('PropertyValidationError', e)
    res.status(400).send({
      success: false,
      message: 'La propieté ' + e.details + ' n\'estpas correct'
    })
  }
  if (e instanceof Error.EntityNotFoundError) {
    console.log('EntityNotFoundError', e)
    res.status(404).send({
      success: false,
      message: e.details + ' not found'
    })
  }
  if (e instanceof Error.InternalProcessError) {
    console.log('InternalProcessError', e)
    res.status(500).send({
      success: false,
      message: 'Erreur Interne'
    })
  }
}

module.exports = function (router) {
  router.get('/passwordforget', function (req, res) {
    user_lib.get({
      'credentials.email': req.query.mail
    }).then(async (user) => {
      let rand = Math.floor((Math.random() * 100000))
      await user_lib.createUpdatePasswordEntity(req.query.mail, rand)
      try {
        const link = 'http://' + req.get('host') + '/auth/secure?code=:' + rand + '&mail=' + req.query.mail
        const mailOptions = {
          from: 'Grappe, Confirmer votre email <tech@data-players.com>',
          to: user.credentials.mail,
          subject: 'Confirmer Votre compte',
          html: 'Bonjour,<br> Merci de cliquer sur le lien suivant pour confirmer votre compte. <br><a href=' + link + '>Ici </a>'
        }
        await mailService.sendMail(req, res, mailOptions)
        res.sendStatus(200)
      } catch (e) {
        res.sendStatus(500)
      }
    })
  }) // <-- passwordforget

  // --------------------------------------------------------------------------------

  router.get('/secure', async (req, res) => {
    let updatePasswordEntity = await user_lib.getPasswordEntity(req.query.mail)
    let decodeToken
    try {
      decodeToken = jwt.decode(updatePasswordEntity.token, 'password')
    } catch (e) {
      decodeToken = jwt.decode(updatePasswordEntity.token, 'mail')
    }
    if (decodeToken.subject === 'recovery_password') {
      if (req.params.code === updatePasswordEntity.token && Date.now() < updatePasswordEntity.timeStamp + 600000) {
        let user = await user_lib.get({ 'credentials.email': req.query.email })
        user.new_password = req.body.new_password
        await user_lib.update(user, null)
        res.status(200).redirect('/ihm/login.htmll#connexion')
      } else {
        res.status(403).redirect('/ihm/login.htmll#connexion')
      }
    } else {
      try {
        let user = await user_lib.get({ 'credentials.email': req.query.mail })
        if (!user.active) {
          user.active = true
          user.credit = 2000
        }
        user_lib.update(user, null)
        res.redirect('/ihm/application.html#profil//edit')
      } catch (e) {
        res.status(500).redirect('/ihm/application.html#profil//edit')
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

  auth_lib_user.google_auth_callbackURL(router)

  // --------------------------------------------------------------------------------

  auth_lib_user.google_auth_statefull_verification(router)
}
