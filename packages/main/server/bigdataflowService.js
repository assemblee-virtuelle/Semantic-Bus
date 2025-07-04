const bigdataflow_lib = require('@semantic-bus/core/lib/bigdataflow_lib')
const user_lib = require('@semantic-bus/core').user
const auth_lib_jwt = require('@semantic-bus/core/lib/auth_lib')
const technicalBDComponentDirectory = require('./services/technicalBDComponentDirectory.js')
const securityService = require('./services/security')

// --------------------------------------------------------------------------------

//TODO use sift or filter instead
function contains (a, obj) {
  if (obj != false) {
    var i = a.length
    while (i--) {
      // console.log(a[i]);
      // console.log(obj._id);
      if (a[i]._id == obj._id) {
        return true
      }
    }
    return false
  }
} // <= contains

//TODO move in securitylib
function UserIdFromToken (req) {
  const token = req.body.token || req.query.token || req.headers['authorization'];
  token.split('');
  let tokenAfter = token.substring(4, token.length);
  const decodeToken = auth_lib_jwt.get_decoded_jwt(tokenAfter);
  return decodeToken.iss;
}

module.exports = function (router) {
  // Get workspaces

  router.get('/bigdataflow/me', function (req, res, next) {
    bigdataflow_lib.getAll(UserIdFromToken(req), 'owner').then((workspaces) => {
      res.json(workspaces)
    }).catch(e => {
      next(e)
    })
  }) // <= list_owned_workspace

  // --------------------------------------------------------------------------------

  router.get('/bigdataflow/:id', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'bigdataflow'), (req, res, next) => {
    bigdataflow_lib.getOne(req.params.id).then((bigdataFlow)=>{
      // console.log(workspace);
      res.json(bigdataFlow)
    }).catch(e => {
      next(e)
    })
  }) // <= get_workspace

  // --------------------------------------------------------------------------------

  router.post('/bigdataflow/', function (req, res, next) {
    let bigdataflowBody = req.body.bigdataflow
    let userIdBody = UserIdFromToken(req)
      bigdataflow_lib.create(userIdBody, bigdataflowBody).then(function (workspace) {
        res.send(workspace)
      }).catch(e => {
        next(e)
      })

  }) // <= create_workspace

  // --------------------------------------------------------------------------------

  router.delete('/bigdataflow/:id/share', (req, res, next) => securityService.wrapperSecurity(req, res, next, 'owner','bigdataflow'), (req, res, next) => {
    const bigdataflow_id = req.params.id

    user_lib.get({
      'credentials.email': req.body.email
    }).then((user) => {
      if (user && UserIdFromToken(req) != user._id) {
        user.bigdataflow = user.bigdataflow || []
        // TODO sift or filter
        if (contains(user.bigdataflow, {
          _id: bigdataflow_id
        })) {
          //TODO sift or filter
          let newArray = []
          user.bigdataflow.forEach((bd) => {
            if (bd._id != bigdataflow_id) {
              newArray.push(wp)
            }
          })
          user.workspaces = newArray;

          user_lib.update(user).then((updatedUser) => {
            bigdataflow_lib.getOne(workspace_id).then(updatedBD => {
              res.send({
                user: updatedUser,
                workspace: updatedBD
              })
            })
          })
        } else {
          res.status(400).send({
            success: false,
            message: 'not_in_user'
          })
        }
      } else {
        res.status(400).send({
          success: false,
          message: 'no_delete_owner'
        })
      }
    }).catch(e => {
      next(e)
    })
  }) // <= delete_share/workspace #share

  // --------------------------------------------------------------------------------

  router.delete('/bigdataflow/:id', (req, res, next) => securityService.wrapperSecurity(req, res, next, 'owner','bigdataflow'), (req, res, next) => {
    bigdataflow_lib.destroy(UserIdFromToken(req), req.params.id).then((bigdataflow)=>{
      res.json(bigdataflow)
    }).catch(e => {
      next(e)
    })
  }) // <= delete_workspace #share

  // --------------------------------------------------------------------------------

  router.put('/bigdataflow/:id/share', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'bigdataflow'), (req, res, next) => {
    var bigdataflow_id = req.params.id;

    user_lib.get({
      'credentials.email': req.body.email
    }).then(function (user) {
      if (user) {
        user.bigdataflow = user.bigdataflow || [];

        //TODO sift or filter
        if (!contains(user.bigdataflow, {
          _id: bigdataflow_id
        })) {
          user.bigdataflow.push({
            _id: workspace_id,
            role: 'editor'
          })
          user_lib.update(user).then((updatedUser)=>{
            bigdataflow_lib.getOne(bigdataflow_id).then(updatedBD => {
              res.send({
                user: updatedUser,
                workspace: updatedBD
              })
            })
          })
        } else {
          res.send('already')
        }
      } else {
        res.send(false)
      }
    }).catch(e => {
      next(e)
    })
  }) // <= update_share/workspace #share

  // ---------------------------------------------------------------------------------

  router.put('/bigdataflow/:id', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'bigdataflow'), (req, res, next)=> {
    if (req.body != null) {
      bigdataflow_lib.update(req.body).then(workspaceUpdated => {
        res.send(workspaceUpdated)
      }).catch(e => {
        next(e)
      })
    } else {
      next(new Error('empty body'))
    }
  }) // <= update_workspace #share

}
