const auth_lib_jwt = require('../../core/lib/auth_lib')
const workspace_lib = require('../../core/lib/workspace_lib')
const user_lib = require('../../core/lib/user_lib')
const jwt = require('jwt-simple')

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
const securityWorksapce = req => {
  return new Promise(resolve => {
    const token = req.body.token || req.query.token || req.headers['authorization']
    token.split('')
    let tokenAfter = token.substring(4, token.length)
    const decodeToken = auth_lib_jwt.get_decoded_jwt(tokenAfter)
    let workspaceId
    if (req.body && req.body.workspaceId) workspaceId = req.body.workspaceId
    if (req.params && req.params.id) workspaceId = req.params.id
    user_lib.getWithWorkspace(
      decodeToken.iss
    ).then((result) => {
      // Don't use ===  here because workspace Id is noT same type than params
      let isAuthorized = result.workspaces.filter((l) => l.workspace._id == workspaceId).length > 0;
      resolve(isAuthorized)
    })
  })
}

module.exports = {
  wrapperSecurity: (req, res, next) => {
    securityWorksapce(req)
      .then((authorized) => {
        if (authorized) {
          next()
        } else {
          res.status(403).send({
            success: false,
            message: 'No right'
          })
        }
      })
  },
  securityAPI: function (req, res, next) {
    auth_lib_jwt.security_API(req, res, next)
  },
  require_token: function (token) {
    return new Promise(function (resolve, reject) {
      auth_lib_jwt.require_token(token).then(function (res) {
        resolve(res)
      }).catch((err) => {
        // console.log(" ----- error jwt service ----")
        reject(err)
      })
    })
  }
}

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
