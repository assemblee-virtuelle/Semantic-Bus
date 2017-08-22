<<<<<<< HEAD
var auth_lib_jwt = require('../lib/core').authentification


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
=======
const jwt = require('jsonwebtoken');
const config = require('../configuration');
const moment = require('moment');
>>>>>>> 3f2738dee261e87dc7bb280d3a233b9ac45e464d

module.exports = {
    securityAPI: function (req, res, next) {
        auth_lib_jwt.security_API(req, res, next)
    },
    require_token: function (token) {
        return new Promise(function (resolve, reject) {
            auth_lib_jwt.require_token(token).then(function (res) {
                resolve(res)
            })
        })
    }
}

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------