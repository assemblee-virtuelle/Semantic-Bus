var jwtService = require('./jwtService');
var inscription_lib_user = require('../lib/core/lib/inscription_lib')
var auth_lib_user = require('../lib/core/lib/auth_lib')


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------



module.exports = function (router) {

  // -------------------------------------------------------------------------------

  router.post('/isTokenValid', function (req, res) {
    if (req.body.token) {
      jwtService.require_token(req.body.token).then(function (token_result) {
        if (token_result != false) {
          res.send(token_result);
        } else {
          res.send(false)
        }
      })
    }
  }); // <= isTokenValid

  // --------------------------------------------------------------------------------

  router.post('/inscription', function (req, res) {
    console.log(req.body)
    inscription_lib_user.create({
      user: {
        name: req.body.name,
        job: req.body.job,
        society: req.body.societe,
        email: req.body.emailInscription,
        passwordConfirm: req.body.confirmPasswordInscription,
        password: req.body.passwordInscription
      }
    }).then(function (data) {
      console.log("inscription data ====>", data)
      res.send({
        user: data.user,
        token: data.token.token
      });
    }).catch(function (err) {
      console.log(err)
      console.log(" ----- error during connexion -----")
      if (err == 'name_bad_format') {
        res.send({
          err: "name_bad_format"
        })
      }
      if (err == 'job_bad_format') {
        res.send({
          err: "job_bad_format"
        })
      }
      if (err == 'bad_email') {
        res.send({
          err: "bad_email"
        })
      }
      if (err == "user_exist") {
        res.send({
          err: "user_exist"
        })
      }
    })
  }); // <= inscription

  // --------------------------------------------------------------------------------

  router.post('/authenticate', function (req, res) {
    auth_lib_user.create({
      authentication: {
        email: req.body.email,
        password: req.body.password
      }
    }).then(function (data) {
      console.log("authenticate =====>", data)
      res.send({
        user: data.user,
        token: data.token
      });
    }).catch(function (err) {
      if (err == "google_user") {
        res.send({
          err: "google_user"
        })
      } else if (err == "no_account_found") {
        res.send({
          err: "no_account_found"
        })
      }else if (err = "compare_bcrypt"){
        res.send({
          err: "probleme_procesus"
        })
      }
    })
  }); // <= authentification

  //<-------------------------------------   GOOGLE AUTH   ------------------------------------->

  auth_lib_user.google_auth(router)

  // --------------------------------------------------------------------------------


  auth_lib_user.google_auth_callbackURL(router, './login.html?google_token=')

  // --------------------------------------------------------------------------------


  auth_lib_user.google_auth_statefull_verification(router)

  // --------------------------------------------------------------------------------


}