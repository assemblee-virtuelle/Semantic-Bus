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

  router.get('/me', function (req, res, next) {
    user_lib.getWithWorkspace(
      UserIdFromToken(req), 'owner'
    ).then(function (result) {
      res.send(result)
    }).catch(e => {
      next(e)
    })
  })

  // ---------------------------------------------------------------------------------

  router.get('/me/graph', function (req, res, next) {
    user_lib.userGraph(UserIdFromToken(req)).then(workspaceGraph => {
      res.json({ workspaceGraph })
    }).catch(e => {
      next(e)
    })
  })

  // --------------------------------------------------------------------------------

  router.put('/me', function (req, res) {
    req.body.user._id = UserIdFromToken(req)
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
