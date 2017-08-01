'use strict';

// const jwt = require('jsonwebtoken');
var jwt = require('jwt-simple');
var config = require('../../configuration');
var moment = require('moment');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var userModel = require('../models').user;
var authenticationModel = require('../models').authentication;

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
    create: _create,
    get_decoded_jwt: _get_decoded_jwt,
    require_token: _require_token,
    security_API: _security_API
};

// --------------------------------------------------------------------------------
// create ==  1 + 2
// 1 - password
// 2 -  token + authentication model


function _create(bodyParams) {
    return new Promise(function (resolve, reject) {
        _create_preprocess(bodyParams.authentication).then(function (preData) {
            _create_mainprocess(preData, bodyParams.authentication).then(function (token) {
                resolve(token)
            }).catch(function (err) {
                reject(err)
            })
        }).catch(function (err) {
            reject(err)
        })
    })
} // <= _create


// --------------------------------------------------------------------------------

function _create_preprocess(authenticationParams) {
    function auth_find_promise() {
        return new Promise(function (resolve, reject) {
            userModel.findOne({
                    'credentials.email': authenticationParams.email
                })
                .exec(function (err, userData) {
                    if (userData) {
                        console.log("auth_find_promise")
                        resolve(userData)
                    } else {
                        if (err == null) {
                            throw TypeError("no account found");
                        } else {
                            reject(err)
                        }
                    }
                });
        });
    }

    function bcrypt_promise(userData) {
        return new Promise(function (resolve, reject) {
            bcrypt.compare(authenticationParams.password, userData.credentials.hashed_password, function (err, isMatch) {
                if (err) {
                    reject(err);
                } else {
                    resolve(isMatch)
                }
            });
        })
    }

    return new Promise(function (resolve, reject) {
        auth_find_promise().then(function (userData) {
            bcrypt_promise(userData).then(function (result) {
                if (result) {
                    console.log(result)
                    resolve(userData)
                } else {
                    reject("error connection")
                }
            })
        })
    })
} // <= _create_preprocess


// --------------------------------------------------------------------------------

function _create_mainprocess(user, authenticationParams) {
    console.log('_create_mainprocess')
    const payload = {
        exp: moment().add(14, 'days').unix(),
        iat: moment().unix(),
        iss: user._id,
        subject: user.googleid,
    }

    var token = jwt.encode(payload, config.secret);

    var authentication = new authenticationModel({
        user: user._id,
        token: token,
        dates: {
            created_at: new Date()
        }
    });
    return new Promise(function (resolve, reject) {
        authentication.save(function (err, authenticationData) {
            if (err) {
                reject(err)
            } else {
                console.log(authenticationData)
                resolve(authenticationData)
            }
        });
    })
} // <= _create_mainprocess


// function _google_auth_callbackURL(router) {
//     router.get('/google',
//         passport.authenticate('google', {
//             scope: ['email', 'profile']
//         }));
// } // <= _google_auth_callbackURL


// function _google_auth(router, redirect_url) {
//     router.get('/',
//         passport.authenticate('google', {
//             failureRedirect: '/login.html',
//             session: false
//         }),
//         function (req, res) {
//             const token = generate_token(res.req.user);
//             var result = {
//                 token: token,
//                 user: res.req.user
//             };
//             console.log(res.req.user)
//             res.redirect(redirect_url + res.req.user.googleToken);
//         });
// }

// --------------------------------------------------------------------------------

function _get_decoded_jwt(token) {
    try {
        var decodedToken = jwt.decode(token, config.secret);

        if (token.exp <= Date.now()) {
            return false;
        }

        return decodedToken;
    } catch (err) {
        return false;
    }
} // <= _get_decoded_jwt


// --------------------------------------------------------------------------------

function _require_token(token) {
    return new Promise(function (resolve, reject) {
         console.log(token);
        if (token == null){
            resolve(false)
        }
        else {
            console.log("in service jwt");
            var decodedToken = jwt.decode(token, config.secret);
            if (token.exp <= Date.now()) {
                resolve(false);
            }
            resolve(decodedToken)
        }
    })
} // <= require_token


// --------------------------------------------------------------------------------

function _security_API(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['authorization']
    if (token) {
        // console.log(token)
        token.split("");
        // verifies secret and checks exp
        var decodedToken = jwt.decode(token.substring(4, token.length), config.secret);
        if (decodedToken.iss == null) {
            return res.json({
                success: false,
                message: 'Failed to authenticate token.'
            });
        } else {
            // if everything is good, save to request for use in other routes
            req.decoded = decodedToken;
            next();
        }
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
} // <= _security_API