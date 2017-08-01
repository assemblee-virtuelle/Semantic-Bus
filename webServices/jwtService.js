const jwt = require('jsonwebtoken');
const config = require('../configuration');
const moment = require('moment');
var auth_lib_jwt = require('../core').authentification

module.exports = {
    securityAPI: function (req, res, next) {
        auth_lib_jwt.security_API(req, res, next)
        // console.log("in security")
        // var token = req.body.token || req.query.token || req.headers['authorization']
        // // // decode Tokken
        // if (token) {
        //     // console.log(token)
        //     token.split("");
        //     // verifies secret and checks exp
        //     jwt.verify(token.substring(4, token.length), config.secret, function (err, decoded) {
        //         // console.log(token.substring(4,token.length));     
        //         if (err) {
        //             console.log(err)
        //             return res.json({
        //                 success: false,
        //                 message: 'Failed to authenticate token.'
        //             });
        //         } else {
        //             // if everything is good, save to request for use in other routes
        //             req.decoded = decoded;
        //             next();
        //         }
        //     });
        // } else {
        //     // if there is no token
        //     // return an error
        //     return res.status(403).send({
        //         success: false,
        //         message: 'No token provided.'
        //     });
        // }
    },
    require_token: function (token) {
        return new Promise(function(resolve, reject){
        auth_lib_jwt.require_token(token).then(function(res){
            resolve(res)
        })
    })
    }
}