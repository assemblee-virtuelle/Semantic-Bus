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
const getConfiguration = require('../getConfiguration.js');
const config = getConfiguration() || { secret: 'test-secret-for-testing' }; // Fallback pour les tests
const Error = require('../helpers/error.js');

/** @typedef {{authentication: AuthenticationParam}} BodyParam */
/** @typedef {{email: string, password: string}} AuthenticationParam */
/** @typedef {{exp: number}} Token */


class AuthLib {
  /**
   * Create authentication token for user
   * Steps: 1 - verify credentials, 2 - generate token + authentication model
   * @param {BodyParam} bodyParams
   * @return {Promise<*>}
   * @public
   */
  async create(bodyParams) {
    // Validate authentication parameters
    if (!bodyParams || !bodyParams.authentication) {
      throw new Error.PropertyValidationError('authentication object is required');
    }

    if (!bodyParams.authentication.email) {
      throw new Error.PropertyValidationError('email is required');
    }

    if (!bodyParams.authentication.password) {
      throw new Error.PropertyValidationError('password is required');
    }

    // Check if user is a Google user (should use OAuth instead)
    const isGoogleUser = await this._is_google_user(bodyParams.authentication);
    if (isGoogleUser) {
      throw new Error.PropertyValidationError('mail ( Utilisateur Google ) ');
    }

    // Authenticate user (verify email and password)
    const userData = await this._authenticateUser(bodyParams.authentication);

    // Generate authentication token
    return await this._create_mainprocess(userData, bodyParams.authentication);
  }

  /**
   * Find user by email for authentication
   * @param {AuthenticationParam} authenticationParams
   * @return {Promise<User>}
   * @private
   */
  async _findUserByEmail(authenticationParams) {
    const user = await userModel.getInstance().model
      .findOne({
        'credentials.email': authenticationParams.email
      })
      .lean()
      .exec();

    if (!user) {
      throw new Error.EntityNotFoundError('User not found');
    }

    return user;
  }

  /**
   * Verify password using bcrypt
   * @param {AuthenticationParam} authenticationParams
   * @param userData
   * @return {Promise<boolean>}
   * @private
   */
  async _verifyPassword(authenticationParams, userData) {
    try {
      return await bcrypt.compare(authenticationParams.password, userData.credentials.hashed_password);
    } catch (error) {
      throw new Error.PropertyValidationError('password');
    }
  }

  /**
   * Authenticate user by verifying email and password
   * @param {AuthenticationParam} authenticationParams
   * @return {Promise<User>}
   * @private
   */
  async _authenticateUser(authenticationParams) {
    // Find user by email
    const userData = await this._findUserByEmail(authenticationParams);

    // Verify password
    const isPasswordValid = await this._verifyPassword(authenticationParams, userData);

    if (!isPasswordValid) {
      throw new Error.PropertyValidationError('password');
    }

    return userData;
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
      subject: user.googleid
    };

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
      .catch(err => Promise.reject(TypeError(err)));
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
    const url = '../../ihm/login.html?google_token=';
    router.get('/oauth-callback', passport.authenticate('google', {
      failureRedirect: '../../ihm/login.html',
      session: false
    }), (req, res) => {
      console.log('res.req.user', res.req.user);
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
          .then(async user => {
            user.googleToken = null;
            user.active = true;
            const user_update = userModel.getInstance().model.findByIdAndUpdate(user._id, user).lean().exec();
            const payload = {
              exp: moment().add(14, 'days').unix(),
              iat: moment().unix(),
              iss: user._id,
              subject: user.googleid
            };
            const token = jwt.encode(payload, config.secret);
            res.send({
              user: user_update,
              token: token
            });
          })
          .catch((e) => {
            console.error(e);
            res.sendStatus('401');
          });
      } else {
        res.sendStatus('401');
      }
    });
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
      .then(userData => !!userData && userData.googleId != null);
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
      // //console.log(token);
      try {
        if (token == null) {
          resolve(false);
        } else {
          // //console.log("in service jwt", token );
          const decodedToken = jwt.decode(token, config.secret);
          // //console.log(decodedToken)
          if (token.exp <= Date.now()) {
            resolve(false);
          } else {
            resolve(decodedToken);
          }
        }
      } catch (e) {
        reject(false);
      }
    });
  }

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {*} next
   * @return {*}
   * @public
   */
  security_API(req, res, next) {
    const token = req.body.token || req.query.token || req.headers['authorization'];
    let decodedToken;
    if (!token) {
      res.statusMessage = 'Unauthorized: Token not found';
      res.sendStatus('401').end();
    } else {
      try {
        token.split('');
        decodedToken = jwt.decode(token.substring(4, token.length), config.secret);
        if (!decodedToken.iss || new Date(decodedToken.exp * 1000) < Date.now()) {
          res.statusMessage = 'Unauthorized : Token is either invalid or expired';
          res.sendStatus('401');
        } else {
          next();
        }
      } catch(e) {
        res.statusMessage = 'Unauthorized: Invalid token';
        res.sendStatus('401');
        return;
      }
    }
  }
}

module.exports = new AuthLib();
