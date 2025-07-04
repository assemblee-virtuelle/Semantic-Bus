const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const UserModel = require('../models').user;
const config = require('../../main/config.json');
const error = require('../helpers/error');
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = (passport) => {
  if (config.googleAuth && config.googleAuth.clientID && config.googleAuth.clientID.length > 0 && config.googleAuth.clientSecret && config.googleAuth.clientSecret.length > 0) {
    passport.use(new GoogleStrategy({
      clientID: config.googleAuth.clientID,
      clientSecret: config.googleAuth.clientSecret,
      callbackURL: '/data/auth/oauth-callback',
      passReqToCallback: true,
      proxy: true
    },
    ((res, token, refreshToken, profile, done) => {
      process.nextTick(async() => {
        const user = await UserModel.getInstance().model.findOne({
          'googleId': profile.id
        });

        if (user) {
          user.googleToken = token;
          await UserModel.getInstance().model.findByIdAndUpdate(user._id, user);

          return done(null, user);
        } else {
          const UserModelInstance = UserModel.getInstance().model;
          const newUser = new UserModelInstance({
            name: profile.displayName,
            googleToken: token,
            googleId: profile.id,
            credit: 2000,
            credentials: {
              email: profile.emails[0].value
            }
          });
          await newUser.save();
          return done(null, newUser);
        }
      });
    })));
  } else {
    console.warn('googleAuth (clientID & clientSecret) config have to be set to use google authentification');
    // throw new Error('googleAuth (clientID & clientSecret) config have to be set to use google authentification')
  }
}; // <= passport_google_auth
