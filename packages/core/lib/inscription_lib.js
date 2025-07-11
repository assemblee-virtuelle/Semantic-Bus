const authenticationLib = require('./auth_lib');
const userLib = require('./user_lib');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
  create: _create
};


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

// create ==  identification + auth

function authenticationPromise(user) {
  return new Promise((resolve, reject) => {
    authenticationLib.create({
      authentication: {
        email: user.user.email,
        password: user.user.password
      }
    }).then((token) => {
      // //console.log(token)
      resolve(token);
    }).catch( (err) => {
      reject(err);
    });
  });
}

function _create(user_infos) {
  // console.log("---- user lib connection ---", user_infos)
  return new Promise((resolve, reject) => {
    if (user_infos.user == null) {
      reject('no user data');
    }else{
      userLib.create(user_infos).then((userLibResult) => {
        return authenticationPromise(user_infos);
      }).then(token => {
        resolve({
          token: token,
          user: user_infos
        });
      }).catch((err) => {
        reject(err);
      });
    }
  });
} // <= _create
