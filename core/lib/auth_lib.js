'use strict';

// const jwt = require('jsonwebtoken');
const jwt = require('jwt-simple');

const moment = require('moment');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const userModel = require('../models/user_model');
const authenticationModel = require('../models/auth_model');
require('../Oauth/google_auth_strategy')(passport);
/** @type Configuration */
const config = require('../../main/configuration');
const Error = require('../helpers/error.js');

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
    return this._is_google_user(bodyParams.authentication)
    .then((boolean) => {
      console.log('is google user', boolean)
      if (boolean == true) {
        throw new Error.PropertyValidationError('mail ( Utilisateur Google ) ')
      } else {
        return this._create_preprocess(bodyParams.authentication);
      }
    }).then(preData => {
      return this._create_mainprocess(preData, bodyParams.authentication)
    }).catch((e)=>{
      throw e
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
      .exec().then((res)=>{
        if(res == null){
          throw new Error.PropertyValidationError('mail')
        }
        return res
      })
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
        return isMatch
      })
      .catch(() => {
        throw new Error.PropertyValidationError('password')
      })
  }

  /**
   * @param {AuthenticationParam} authenticationParams
   * @return {Promise<User>}
   * @private
   */
  async _create_preprocess(authenticationParams) {
    let userData
    return new Promise(async (resolve, reject)=>{
      try {
        userData = await this._auth_find_promise(authenticationParams);
      } catch (e) {
        return reject(e)
      }
      try {
        let isMatch = await this._bcrypt_promise(authenticationParams, userData)
        return isMatch ? resolve(userData) : reject(new Error.PropertyValidationError('password'))
      } catch (e) {
        return reject(e)
      }
    })
  }


  /**
   * @param {User} user
   * @param {AuthenticationParam} authenticationParams
   * @return {Promise<Authentication>}
   * @private
   */
  _create_mainprocess(user) {

    const payload = {
      exp: moment().add(14, 'days').unix(),
      iat: moment().unix(),
      iss: user._id,
      subject: user.googleid,
    }
    
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
  google_auth_callbackURL(router) {
    const url = '../../ihm/login.html?google_token='
    router.get('/oauth-callback', passport.authenticate('google', {
      failureRedirect: '../../ihm/login.html',
      session: false
    }), (req, res) => {
      res.redirect(url + res.req.user.googleToken);
    });
  }


  /**
   * @param {Router} router
   * @public
   */
  google_auth_statefull_verification(router) {
    router.post('/google_auth_statefull_verification', (req, res) => {
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

              res.send({
                user: user_update,
                token: token
              });
            });
          })
          .catch(() => res.sendStatus('401'))
      } else {
        res.sendStatus('401');
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
    let decodedToken;
    if (!token) {
      res.statusMessage = 'Unauthorized: Token not found';
      res.sendStatus('401').end();
    } else {
      try {
        token.split("");
        decodedToken = jwt.decode(token.substring(4, token.length), config.secret);
        if (!decodedToken.iss || new Date(decodedToken.exp*1000) < Date.now()) {
          res.statusMessage = 'Unauthorized : Token is either invalid or expired';
          res.sendStatus('401');
        } else {
          next()
        }
      } catch(e) {
        res.statusMessage = 'Unauthorized: Invalid token';
        res.sendStatus('401');
        return;
      }
      

    }
  }
}

module.exports = new AuthLib()
