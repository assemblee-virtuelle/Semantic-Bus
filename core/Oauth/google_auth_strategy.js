var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
var UserModel = require('../models').user
var config = require('../../main/config.json')
var error = require('../helpers/error')
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = (passport) => {
  if (config.googleAuth && config.googleAuth.clientID && config.googleAuth.clientID.length>0 && config.googleAuth.clientSecret && config.googleAuth.clientSecret.length>0) {
    console.log('GOOGLE auth activ');
    passport.use(new GoogleStrategy({
      clientID: config.googleAuth.clientID,
      clientSecret: config.googleAuth.clientSecret,
      callbackURL: '/data/auth/oauth-callback',
      passReqToCallback: true,
      proxy: true
    },
    function (res, token, refreshToken, profile, done) {
      console.log('____________________NEXT TICK');
      process.nextTick(async function () {
        const user = await UserModel.getInstance().model.findOne({
          'googleId': profile.id
        });

        if (user) {
          user.googleToken = token
          await UserModel.getInstance().model.findByIdAndUpdate(user._id,user);
          console.log('user',user)
          return done(null, user)
          // return done(new error.OauthError())
          // UserModel.getInstance().model.findByIdAndUpdate(user._id, user, function (err, resp) {
          //   if (err) {
          //     // res.status(500).send()
          //     return done(new error.OauthError())
          //   }
          //   return done(null, user)
          // })
        } else {
          const UserModelInstance = UserModel.getInstance().model
          var newUser = new UserModelInstance({
            name: profile.displayName,
            googleToken: token,
            googleId: profile.id,
            credit: 2000,
            credentials: {
              email: profile.emails[0].value
            }
          })
          await newUser.save();
          return done(null, newUser)

        }
      })
    }))
  } else {
    console.warn('googleAuth (clientID & clientSecret) config have to be set to use google authentification')
    // throw new Error('googleAuth (clientID & clientSecret) config have to be set to use google authentification')
  }
} // <= passport_google_auth
