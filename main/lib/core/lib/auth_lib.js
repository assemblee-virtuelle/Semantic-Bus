'use strict';

// const jwt = require('jsonwebtoken');
const jwt = require('jwt-simple');

const moment = require('moment');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const userModel = require('../models/user_model');
const authenticationModel = require('../models/auth_model');

/** @type Configuration */
const config = require('../../../configuration');

/** @typedef {{authentication: AuthenticationParam}} BodyParam */
/** @typedef {{email: string, password: string}} AuthenticationParam */
/** @typedef {{exp: number}} Token */


class AuthLib {
  /**
   * Create Auth
   * create == 1 + 2
   * 1 - password
   * 2 - token + authentication model
   * @param {BodyParam} bodyParams
   * @return {Promise<*>}
   * @public
   */
  create(bodyParams) {
    return this._is_google_user(bodyParams.authentication).then((boolean) => {
      if (boolean == true) {
        if (config.quietLog != true) {
          //console.log("google user");
        }
        return Promise.reject("google_user");
      } else {
        return this._create_preprocess(bodyParams.authentication);
      }
    }).then(preData => {
      return this._create_mainprocess(preData, bodyParams.authentication)
    })
  }


  /**
   * @param {AuthenticationParam} authenticationParams
   * @return {Promise<User>}
   * @private
   */
  _auth_find_promise(authenticationParams) {
    return userModel.getInstance().model
      .findOne({
        'credentials.email': authenticationParams.email
      })
      .lean()
      .exec()
      .catch(() => Promise.reject("no_account_found"))
  }

  /**
   * @param {AuthenticationParam} authenticationParams
   * @param userData
   * @return {Promise<any>}
   * @private
   */
  _bcrypt_promise(authenticationParams, userData) {
    return bcrypt.compare(authenticationParams.password, userData.credentials.hashed_password)
      .then(isMatch => {
        console.log("isMatch")
        return isMatch
      })
      .catch(() => {
        console.log("compare_bcrypt ERRO -------")
        return Promise.reject("compare_bcrypt");
      })
  }

  /**
   * @param {AuthenticationParam} authenticationParams
   * @return {Promise<User>}
   * @private
   */
  _create_preprocess(authenticationParams) {
    return this._auth_find_promise(authenticationParams)
      .then(userData => {
        return this._bcrypt_promise(authenticationParams, userData)
          .then(result => {
            if (result) {
              return userData
            } else {
              return Promise.reject("compare_bcrypt")
            }
          })
      })
  }


  /**
   * @param {User} user
   * @param {AuthenticationParam} authenticationParams
   * @return {Promise<Authentication>}
   * @private
   */
  _create_mainprocess(user, authenticationParams) {
    const payload = {
      exp: moment().add(14, 'days').unix(),
      iat: moment().unix(),
      iss: user._id,
      subject: user.googleid,

    }
    //console.log("in authentification")
    const token = jwt.encode(payload, config.secret);

    const authenticationModelInstance = authenticationModel.getInstance().model;
    /** @type AuthenticationDocument */
    const authentication = new authenticationModelInstance({
      user: user._id,
      token: token,
      dates: {
        created_at: new Date()
      }
    });
    //console.log(authentication)
    return authentication.save()
      .catch(err => Promise.reject(TypeError(err)))
  }

  /**
   * @param {Router} router
   * @public
   */
  google_auth(router) {
    router.get('/google',
      passport.authenticate('google', {
        scope: ['email', 'profile']
      }));
  }

  /**
   * @param {Router} router
   * @param {string} redirect_url
   * @public
   */
  google_auth_callbackURL(router, redirect_url) {
    router.get('/', passport.authenticate('google', {
      failureRedirect: '/login.html',
      session: false
    }), (req, res) => {
      //console.log('final request',req);
      res.redirect(redirect_url + res.req.user.googleToken);
    });
  }


  /**
   * @param {Router} router
   * @public
   */
  google_auth_statefull_verification(router) {
    router.post('/google_auth_statefull_verification', (req, res) => {
      if (config.quietLog != true) {
        //console.log("in callback")
        //console.log(req.body)
      }
      if (req.body.token != null) {
        userModel.getInstance().model
          .findOne({
            googleToken: req.body.token
          })
          .lean()
          .exec()
          .then(user => {
            if (config.quietLog != true) {
              //console.log("--- google user find ---", user)
            }
            user.googleToken = null;
            user.active = true
            //console.log(user)
            userModel.getInstance().model.findByIdAndUpdate(user._id, user, (err, user_update) => {
              if (err) {
                throw err;
              }
              const payload = {
                exp: moment().add(14, 'days').unix(),
                iat: moment().unix(),
                iss: user._id,
                subject: user.googleid,
              }
              const token = jwt.encode(payload, config.secret);
              if (config.quietLog != true) {
                //console.log("--- token user ---", token)
              }
              res.send({
                user: user_update,
                token: token
              });
            });
          })
          .catch(() => res.send("create account please"))
      }
    })
  }


  // <-------------------------------------------  Security  ------------------------------------------->

  /**
   * @param {AuthenticationParam} user
   * @returns {Promise<boolean>}
   * @private
   */
  _is_google_user(user) {
    return userModel.getInstance().model
      .findOne({
        'credentials.email': user.email
      })
      .exec()
      .then(userData => !!userData && userData.googleId != null)
  }

  /**
   * @param {Object} token
   * @return {Object|false}
   * @public
   */
  get_decoded_jwt(token) {
    try {
      const decodedToken = jwt.decode(token, config.secret);

      if (token.exp <= Date.now()) {
        return false;
      }
      return decodedToken;
    } catch (err) {
      return false;
    }
  }

  /**
   * @param {Object} token
   * @return {Promise<Object|false>}
   * @public
   */
  require_token(token) {
    return new Promise((resolve, reject) => {
      ////console.log(token);
      try {
        if (token == null) {
          resolve(false)
        } else {
          ////console.log("in service jwt", token );
          const decodedToken = jwt.decode(token, config.secret)
          ////console.log(decodedToken)
          if (token.exp <= Date.now()) {
            resolve(false);
          } else {
            resolve(decodedToken);
          }
        }
      } catch (e) {
        reject(false)
      }
    })
  }

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {*} next
   * @return {*}
   * @public
   */
  security_API(req, res, next) {
    const token = req.body.token || req.query.token || req.headers['authorization']
    if (token != undefined) {
      token.split("");
      const decodedToken = jwt.decode(token.substring(4, token.length), config.secret);
      if (decodedToken.iss == null) {
        res.json({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        req.decoded = decodedToken;
        next();
      }
    } else {
      if (config.quietLog != true) {
        //console.log('No token provided');
      }
      return res.status(403).send({
        success: false,
        message: 'No token provided'
      });
    }
  }
}

module.exports = new AuthLib()
