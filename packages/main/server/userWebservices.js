'use strict'

var user_lib = require('@semantic-bus/core/lib/user_lib')
const auth_lib_jwt = require('@semantic-bus/core/lib/auth_lib')
const certificate_lib = require('@semantic-bus/core/lib/auth_lib')
const mailService = require('./services/mail')
const jwt = require('jwt-simple')
const moment = require('moment')
const validations = require('./validations')
const userValidations = require('./validations/userValidations')
const config = require('../config.json')
// const upload = require('./workspaceComponentInitialize/upload')
const Busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const busboy = require('busboy')

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

  router.post('/users/mail', async (req, res, next) => {
    try {
      const token = encodeToken(req.query.mail, 'verify')
      const link = ('http://' + req.get('host') + '/data/auth/secure?code=' + token + '&mail=' + encodeURIComponent(req.query.mail))
      await user_lib.createUpdatePasswordEntity(req.query.mail, token)

      const mailOptions = {
        from: 'tech@data-players.com',
        to: req.query.mail,
        subject: 'Confirmez Votre compte',
        text: 'Bonjour,\nMerci de cliquer sur le lien suivant pour confirmer votre compte.\n' + link
      }

      mailService.sendMail(req, res, mailOptions).then((info) => {
        res.sendStatus(200)
      }).catch((error) => {
        console.error('Error sending email:', error)
      })
    } catch (e) {
      res.sendStatus(500)
    }
  }) // <-- mail_user

  // ---------------------------------------------------------------------------------

  router.get('/users/me', function (req, res, next) {
    // console.log('config', config);
    user_lib.getWithRelations(
      UserIdFromToken(req), config
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

  // todo dont update workspace and password here
  router.put('/users/me', function (req, res, next) {
    req.body.user._id = UserIdFromToken(req)
    user_lib.update(req.body.user, req.body.mailChange).then(function (result) {
      res.send(result)
    }).catch((e) => {
      next(e)
    })
  })

  router.patch('/users/me',
    validations.validateRequestInput(userValidations.userPatchType),
    (req, res, next) => {
      user_lib.updateProfil(UserIdFromToken(req), req.body)
        .then(result => res.send(result))
        .catch(error => next(error))
    }
  )
}
