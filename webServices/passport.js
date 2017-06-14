var JwtStrategy = require('passport-jwt').Strategy;  
var ExtractJwt = require('passport-jwt').ExtractJwt;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;  
var User = require('./models/userModel'); 
var config = require('./models/configuration');
var jwtService = require('./jwtService')
// Setup work and export for the JWT passport strategy
module.exports = function(passport) {
  

    function generate_token(user) {
        const payload = {
            exp: moment().add(14, 'days').unix(),
            iat: moment().unix(),
            iss: user._id,
        }
        return jwt.sign(payload, config.secret);
    }

  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
      User.findOne({where: {id: jwt_payload.id}},function(err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  }));

  passport.use(new GoogleStrategy({
        clientID        : config.googleAuth.clientID,
        clientSecret    : config.googleAuth.clientSecret,
        callbackURL     : config.googleAuth.callbackURL,
    },
    function(token, refreshToken, profile, done) {
        // make the code asynchronous
        console.log('token', token);
        console.log('refreshToken', refreshToken);
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {
            // try to find the user based on their google id
            User.findOne({
              where: { 'googleid' : profile.id }
              }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {
                    user.googleToken = token
                    // if a user is found, log them in
                    user.save(function(err, res) {
                        if (err){
                            throw err;
                        }
                        return done(null, user);
                    });
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser  = new User();
                    // set all of the relevant information
                    newUser.googleToken = token
                    newUser.googleid = profile.id;
                    newUser.email = profile.emails[0].value; // pull the first email
                    // save the user
                    newUser.save(function(err, res) {
                        if (err){
                            throw err;
                        }
                        return done(null, newUser);
                    });
                }
            });
        });
    }));
};