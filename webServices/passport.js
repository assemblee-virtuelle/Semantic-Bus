var JwtStrategy = require('passport-jwt').Strategy;  
var ExtractJwt = require('passport-jwt').ExtractJwt;  
var User = require('./models/userModel'); 
var config = require('./models/configuration');
// Setup work and export for the JWT passport strategy
module.exports = function(passport) {  
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
};