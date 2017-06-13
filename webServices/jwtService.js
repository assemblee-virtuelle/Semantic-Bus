const jwt = require('jsonwebtoken');
const config = require('./models/configuration');
const moment = require('moment');

module.exports = {
    securityAPI: function (req, res, next) {
        console.log("in security")
        var token = req.body.token || req.query.token || req.headers['authorization']
        // // decode Tokken
        if (token) {
            console.log(token)
            token.split("");
            // verifies secret and checks exp
            jwt.verify(token.substring(4, token.length), config.secret, function (err, decoded) {
                // console.log(token.substring(4,token.length));     
                if (err) {
                    console.log(err)
                    return res.json({
                        success: false,
                        message: 'Failed to authenticate token.'
                    });
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            // if there is no token
            // return an error
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    },
    require_token: function (token) {
        // const token = req.query.token || req.body
        //const token  = req.get('Authorization');
        return new Promise(function(resolve, reject){
            if (!token)
                return false
            else {
                console.log("in service jwt");
                jwt.verify(token, config.secret, (err, decoded) => {
                    if (decoded){
                        console.log("in true service jwt")
                        resolve(decoded)
                    }
                    else{
                        resolve(false)
                    }
                });
            }
        })
    }
}