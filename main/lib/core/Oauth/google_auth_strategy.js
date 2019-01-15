var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var UserModel = require('../models').user;
var config = require('../../../configuration');


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = function(passport) {
  passport.use(new GoogleStrategy({
      clientID: config.googleAuth.clientID,
      clientSecret: config.googleAuth.clientSecret,
      callbackURL: config.googleAuth.callbackURL,
      passReqToCallback: true,
      proxy: true
    },
    function(request, token, refreshToken, profile, done) {

      process.nextTick(function() {
        //console.log('request',request);
        UserModel.getInstance().model.findOne({
          'googleId': profile.id
        }, function(err, user) {

          //console.log("google user passeport", user)
          if (err){
            return done(err);
          }
          if (user) {

            user.googleToken = token
            //console.log("google user passeport 2", user)
            UserModel.getInstance().model.findByIdAndUpdate(user._id, user, function(err, res) {
              if (err) {
                throw err;
              }
              return done(null, user);
            });
          } else {
            const UserModelInstance = UserModel.getInstance().model;
            var newUser = new UserModelInstance({
              name: profile.displayName,
              googleToken: token,
              googleId: profile.id,
              credentials: {
                email: profile.emails[0].value
              }
            })
            newUser.save(function(err, res) {
              if (err) {
                throw err;
              }
              return done(null, newUser);
            });
          }
        });
      });
    }))
} //<= passport_google_auth
