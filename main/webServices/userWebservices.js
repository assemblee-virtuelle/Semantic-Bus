'use strict'

var user_lib = require('../../core/lib/user_lib')


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


module.exports = function (router, stompClient) {
  // ---------------------------------------  ALL USERS  -----------------------------------------

  router.get('/users', function (req, res, next) {
    user_lib.get_all({}).then(function (users) {
      res.send(users)
    }).catch(e => {
      next(e)
    })
  })

  // ---------------------------------------------------------------------------------

  router.get('/users/:id', function (req, res, next) {
    user_lib.getWithWorkspace(
      req.params.id, 'owner'
    ).then(function (result) {
      res.send(result)
    }).catch(e => {
      next(e)
    })
  })

  // ---------------------------------------------------------------------------------

  router.get('/users/:id/workspaces', function (req, res, next) {
    user_lib.userGraph(req.params.id).then(workspaceGraph => {
      res.json({workspaceGraph})
    }).catch(e => {
      next(e)
    })
  })

  // --------------------------------------------------------------------------------

  router.put('/users/:id', function (req, res) {
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
