var auth_lib_jwt = require('../lib/core/lib/auth_lib')


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
    securityAPI: function (req, res, next) {
        auth_lib_jwt.security_API(req, res, next)
    },
    require_token: function (token) {
        return new Promise(function (resolve, reject) {
            auth_lib_jwt.require_token(token).then(function (res) {
                resolve(res)
            }).catch((err) => {
                console.log(" ----- error jwt service ----")
                reject(err)
            })
        })
    }
}

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------