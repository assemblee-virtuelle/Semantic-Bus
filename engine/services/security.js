const auth_lib_jwt = require('../../core/lib/auth_lib');
const user_lib = require('../../core/lib/user_lib');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
const securityWorksapce = (req, role) => {
  return new Promise(resolve => {
    // here token is obligatory good because after first middleware
    const token = req.body.token || req.query.token || req.headers['authorization'];
    let workspaceId;
    token.split('');
    const tokenAfter = token.substring(4, token.length);
    const decodeToken = auth_lib_jwt.get_decoded_jwt(tokenAfter);
    // console.log(decodeToken)
    if (req.body && req.body.workspaceId) workspaceId = req.body.workspaceId;
    if (req.params && req.params.id) workspaceId = req.params.id;
    user_lib.getWithRelations(
      decodeToken.iss
    ).then((result) => {
      // !!!!!! Don't use ===  here because workspace Id is noT same type than params !!!!!
      let isAuthorized;
      if (role === 'owner') {
        isAuthorized =
          result.workspaces.filter((l) => l.workspace._id == workspaceId).length &&
          result.workspaces.filter((l) => l.workspace._id == workspaceId)[0].role == 'owner';
      } else {
        isAuthorized = result.workspaces.filter((l) => l.workspace._id == workspaceId).length > 0;
      }
      resolve(isAuthorized);
    });
  });
};

module.exports = {
  wrapperSecurity: (req, res, next, role) => {
    securityWorksapce(req, role)
      .then((authorized) => {
        if (authorized) {
          next();
        } else {
          res.status(403).send({
            success: false,
            message: 'No right'
          });
        }
      });
  },
  securityAPI: function (req, res, next) {
    auth_lib_jwt.security_API(req, res, next);
  },
  require_token: function (token) {
    return new Promise((resolve, reject) => {
      auth_lib_jwt.require_token(token).then((res) => {
        resolve(res);
      }).catch((err) => {
        // console.log(" ----- error jwt service ----")
        reject(err);
      });
    });
  }
};

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
