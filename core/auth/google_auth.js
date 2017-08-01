var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('./models/userModel'); 


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
            clientID: config.googleAuth.clientID,
            clientSecret: config.googleAuth.clientSecret,
            callbackURL: config.googleAuth.callbackURL,
        },
        function (token, refreshToken, profile, done) {
            // make the code asynchronous
            console.log('token', token);
            console.log('refreshToken', refreshToken);
            // User.findOne won't fire until we have all our data back from Google
            process.nextTick(function () {
                // try to find the user based on their google id
                User.findOne({
                    where: {
                        'googleid': profile.id
                    }
                }, function (err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        user.googleToken = token
                        // if a user is found, log them in
                        user.save(function (err, res) {
                            if (err) {
                                throw err;
                            }
                            return done(null, user);
                        });
                    } else {
                        // if the user isnt in our database, create a new user
                        var newUser = new User();
                        // set all of the relevant information
                        newUser.googleToken = token
                        newUser.googleid = profile.id;
                        newUser.email = profile.emails[0].value; // pull the first email
                        // save the user
                        newUser.save(function (err, res) {
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