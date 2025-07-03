const auth_lib_jwt = require('@semantic-bus/core/lib/auth_lib');
const user_lib = require('@semantic-bus/core/lib/user_lib');
const config = require('../../config.json');

// --------------------------------------------------------------------------------
class Security {
  wrapperSecurity(req, res, next, role, entity) {
    // console.log('wrapperSecurity',role,entity);
    switch (entity) {
    case 'workflow':
      this.securityWorkspace(req, role)
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
      break;
    case 'bigdataflow':
      this.securityBigdataflow(req, role)
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
      break;
    default:
    }
  }

  securityWorkspace(req, role) {
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
        decodeToken.iss, config
      ).then((result) => {
        // !!!!!! Don't use ===  here because workspace Id is noT same type than params !!!!!
        let isAuthorized;
        if (result.admin) {
          isAuthorized = true;
        } else {
          // console.log('XXXX securityWorkspace user',workspaceId,result.credentials.email)
          if (role === 'owner') {
            isAuthorized =
              result.workspaces.filter((l) => l.workspace._id == workspaceId).length &&
              result.workspaces.filter((l) => l.workspace._id == workspaceId)[0].role == 'owner';
          } else {
            isAuthorized = result.workspaces.filter((l) => l.workspace._id == workspaceId).length > 0;
          }
          // console.log(role,isAuthorized)
        }

        resolve(isAuthorized);
      });
    });
  }

  securityBigdataflow(req, role) {
    return new Promise(resolve => {
      // here token is obligatory good because after first middleware
      const token = req.body.token || req.query.token || req.headers['authorization'];
      let bigdataflowId;
      token.split('');
      const tokenAfter = token.substring(4, token.length);
      const decodeToken = auth_lib_jwt.get_decoded_jwt(tokenAfter);
      // console.log(decodeToken)
      if (req.body && req.body.bigdataflowId) bigdataflowId = req.body.workspaceId;
      if (req.params && req.params.id) bigdataflowId = req.params.id;
      user_lib.getWithRelations(
        decodeToken.iss, config
      ).then((result) => {
        // console.log('result',JSON.stringify(result));
        // !!!!!! Don't use ===  here because workspace Id is noT same type than params !!!!!
        let isAuthorized;
        if (role === 'owner') {
          isAuthorized =
            result.bigdataflow.filter((l) => l.bigdataflow._id == bigdataflowId).length &&
            result.bigdataflow.filter((l) => l.bigdataflow._id == bigdataflowId)[0].role == 'owner';
        } else {
          isAuthorized = result.bigdataflow.filter((l) => l.bigdataflow._id == bigdataflowId).length > 0;
        }
        resolve(isAuthorized);
      });
    });
  }

  securityAPI(req, res, next) {
    auth_lib_jwt.security_API(req, res, next);
  }

  require_token(token) {
    return new Promise((resolve, reject) => {
      auth_lib_jwt.require_token(token).then((res) => {
        resolve(res);
      }).catch((err) => {
        // console.log(" ----- error jwt service ----")
        reject(err);
      });
    });
  }
}

module.exports = new Security();

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
