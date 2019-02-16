'use strict'

var user_lib = require('../../core/lib/user_lib')
const auth_lib_jwt = require('../../core/lib/auth_lib')

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

function UserIdFromToken (req) {
  const token = req.body.token || req.query.token || req.headers['authorization']
  token.split('')
  let tokenAfter = token.substring(4, token.length)
  const decodeToken = auth_lib_jwt.get_decoded_jwt(tokenAfter)
  return decodeToken.iss
}

module.exports = function (router) {
  // ---------------------------------------  ALL USERS  -----------------------------------------

  router.get('/users', function (req, res, next) {
    user_lib.get_all({}).then(function (users) {
      res.send(users)
    }).catch(e => {
      next(e)
    })
  })

  // ---------------------------------------------------------------------------------

  router.post('/users/mail?mail=:mail', async (req, res) => {
    try {
      let rand = Math.floor((Math.random() * 100000))
      await user_lib.createUpdatePasswordEntity(req.params.mail, rand)
      const link = 'http://' + req.get('host') + '/auth/secure?code=:' + rand + '&mail=' + req.params.mail
      const mailOptions = {
        from: 'Grappe, Confirmer votre email <tech@data-players.com>',
        to: req.params.mail,
        subject: 'Confirmer Votre compte',
        html: 'Bonjour,<br> Merci de cliquer sur le lien suivant pour confirmer votre compte. <br><a href=' + link + '>Ici </a>'
      }
      await mailService.sendMail(req, res, mailOptions)
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(500)
    }
  }) // <-- mail_user

  // ---------------------------------------------------------------------------------

  router.get('/users/me', function (req, res, next) {
    user_lib.getWithWorkspace(
      UserIdFromToken(req), 'owner'
    ).then(function (result) {
      res.send(result)
    }).catch(e => {
      next(e)
    })
  })

  // ---------------------------------------------------------------------------------

  router.get('/users/me/graph', function (req, res, next) {
    user_lib.userGraph(UserIdFromToken(req)).then(workspaceGraph => {
      res.json({ workspaceGraph })
    }).catch(e => {
      next(e)
    })
  })

  // --------------------------------------------------------------------------------

  router.put('/users/me', function (req, res) {
    req.body.user._id = UserIdFromToken(req)
    if (req.body.password) {
      if (Date.now() < user.resetpasswordtoken + 600000) {
        user.new_password = req.body.new_password
      }
    }
    user_lib.update(req.body.user, req.body.mailChange).then(function (result) {
      res.send(result)
    }).catch(function (err) {
      if (err === 'google_user') {
        res.send({ err: 'google_user' })
      }
      if (err === 'email_already_use') {
        res.send({ err: 'email_already_use' })
      }
      if (err === 'bad_format_email') {
        res.send({ err: 'bad_format_email' })
      }
      if (err === 'bad_format_job') {
        res.send({ err: 'bad_format_job' })
      }
      if (err === 'bad_format_society') {
        res.send({ err: 'bad_format_society' })
      }
    })
  })
}
