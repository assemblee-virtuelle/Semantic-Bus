"use strict";

let userModel = require("../models/user_model");
let config = require("../../main/configuration.js");
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
  get: _get,
  update: _update,
};

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

function _get(filter) {
  return new Promise(function(resolve, reject) {
    userModel.getInstance().model
      .findOne(filter)
      .lean()
      .exec(function(err, userData) {
        if (err) {
          reject(err);
        } else {
          resolve(userData);
        }
      });
  });
} // <= _get

function _update(user, mailChange) {
  return new Promise(function(resolve, reject) {
    _is_google_user(user).then(function(boolean) {
      if (boolean == true) {
        if (config.quietLog != true) {
          //console.log("google user");
        }
        reject("google_user");
      } else {
        return _update_preprocess(user, mailChange);
      }
    }).then((preData) => {
      return _update_mainprocess(preData);
    }).then((user) => {
      resolve(user);
    }).catch(function(err) {
      reject(err);
    });;
  });
} // <= _update

// --------------------------------------------------------------------------------

function _update_mainprocess(preData) {
  //transformer le model business en model de persistance
  return new Promise(function(resolve, reject) {
    if (config.quietLog != true) {
      //console.log("update_mainprocess data");
    }
    var toUpdate = {};
    if (preData.email) {
      if (!toUpdate["$set"]) {
        toUpdate["$set"] = {};
      }

      toUpdate["$set"]["credentials.email"] = preData.email;
    }

    if (preData.hash_password) {
      if (!toUpdate["$set"]) {
        toUpdate["$set"] = {};
      }

      toUpdate["$set"]["credentials.hashed_password"] = preData.hash_password;
    }

    if (preData.stripeID) {
      if (!toUpdate["$set"]) {
        toUpdate["$set"] = {};
      }

      toUpdate["$set"]["stripeID"] = preData.stripeID;
    }

    if (preData.credit) {
      if (!toUpdate["$set"]) {
        toUpdate["$set"] = {};
      }

      toUpdate["$set"]["credit"] = preData.credit;
    }

    if (preData.job) {
      if (!toUpdate["$set"]) {
        toUpdate["$set"] = {};
      }
      toUpdate["$set"]["job"] = preData.job;
    }

    if (preData.secret_stripe) {
      if (!toUpdate["$set"]) {
        toUpdate["$set"] = {};
      }
      toUpdate["$set"]["secret_stripe"] = preData.secret_stripe;
    }

    if (preData.name) {
      if (!toUpdate["$set"]) {
        toUpdate["$set"] = {};
      }
      toUpdate["$set"]["name"] = preData.name;
    }

    if (preData.society) {
      if (!toUpdate["$set"]) {
        toUpdate["$set"] = {};
      }
      toUpdate["$set"]["society"] = preData.society;
    }

    if (preData.workspaces) {
      if (!toUpdate["$set"]) {
        toUpdate["$set"] = {};
      }
      toUpdate["$set"]["workspaces"] = preData.workspaces;
    }

    if (preData.active) {
      if (!toUpdate["$set"]) {
        toUpdate["$set"] = {};
      }
      toUpdate["$set"]["active"] = preData.active;
    }

    if (preData.resetpasswordtoken) {
      if (!toUpdate["$set"]) {
        toUpdate["$set"] = {};
      }
      toUpdate["$set"]["resetpasswordtoken"] = preData.resetpasswordtoken;
    }

    if (preData.resetpasswordmdp) {
      if (!toUpdate["$set"]) {
        toUpdate["$set"] = {};
      }
      toUpdate["$set"]["resetpasswordmdp"] = preData.resetpasswordmdp;
    }

    userModel.getInstance().model.findByIdAndUpdate(
      preData._id,
      toUpdate, {
        new: true
      },
      function(err, userData) {
        if (err) {
          reject("errorr_save");
        } else {
          if (config.quietLog != true) {
            //console.log("final update mainprocess data");
          }
          resolve(userData);
        }
      }
    );
  });
} // <= _update_mainprocess

// --------------------------------------------------------------------------------

function _update_preprocess(userParams, mailChange) {
  //controler les regles métier
  return new Promise(function(resolve, reject) {
    if (config.quietLog != true) {
      //console.log("update preprocess : userParams || ", "mailChange : ", mailChange);
    }
    if (mailChange) {
      userModel.getInstance().model
        .findOne({
          "credentials.email": userParams.credentials.email
        })
        .lean()
        .exec(function(user) {
          //console.log(" ---------- find one --------");
          if (!user) {
            var email = new Promise(function(resolve, reject) {
              if (!userParams.credentials.email) {
                resolve(null);
              } else {
                _check_email(userParams.credentials.email).then(function(
                  boolean
                ) {
                  if (config.quietLog != true) {
                    //console.log(boolean);
                  }
                  if (!boolean) {
                    reject("bad_format_email");
                  } else {
                    resolve(userParams.credentials.email);
                  }
                });
              }
            });
            var job = new Promise(function(resolve, reject) {
              if (!userParams.job) {
                resolve(null);
              } else {
                _check_job(userParams.job).then(function(boolean) {
                  if (!boolean) reject("bad_format_job");
                  else resolve(userParams.job);
                });
              }
            });

            var name = new Promise(function(resolve, reject) {
              if (!userParams.name) {
                resolve(null);
              } else {
                _check_name(userParams.name).then(function(boolean) {
                  if (!boolean) reject("bad_format_name");
                  else resolve(userParams.name);
                });
              }
            });

            var society = new Promise(function(resolve, reject) {
              if (!userParams.society) {
                resolve(null);
              } else {
                _check_job(userParams.society).then(function(boolean) {
                  if (!boolean) reject("bad_format_society");
                  else resolve(userParams.society);
                });
              }
            });

            var workspace = new Promise(function(resolve, reject) {
              if (!userParams.workspaces) {
                resolve(null);
              } else resolve(userParams.workspaces);
            });

            var resetpasswordtoken = new Promise(function(resolve, reject) {
              if (!userParams.resetpasswordtoken) {
                resolve(null);
              } else resolve(userParams.resetpasswordtoken);
            });

            var hash_password = new Promise(function(resolve, reject) {
              if (userParams.new_password) {
                _hash_password(userParams.new_password)
                  .then(function(hashedPassword) {
                    resolve(hashedPassword);
                  })
                  .catch(function(err) {
                    reject({
                      err: "bad_format_password"
                    });
                  });
              } else {
                resolve(null);
              }
            });

            Promise.all([
                email,
                job,
                society,
                workspace,
                name,
                resetpasswordtoken,
                hash_password
              ])
              .then(function(user_update_data) {
                var o = {};
                o["email"] = user_update_data[0];
                o["job"] = user_update_data[1];
                o["society"] = user_update_data[2];
                o["workspaces"] = user_update_data[3];
                o["name"] = user_update_data[4];
                o["resetpasswordtoken"] = user_update_data[5];
                o["hash_password"] = user_update_data[6];
                o._id = userParams._id;
                //console.log("final update preprocess data")
                resolve(o);
              })
              .catch(function(err) {
                reject(err);
              });
          } else {
            reject("email_already_use");
          }
        });
    } else {
      //console.log("IN UPDATE USER PARAMS")
      var stripeID = new Promise(function(resolve, reject) {
        if (!userParams.stripeID) {
          resolve(null);
        } else resolve(userParams.stripeID);
      });

      var secret_stripe = new Promise(function(resolve, reject) {
        if (!userParams.secret_stripe) {
          resolve(null);
        } else resolve(userParams.secret_stripe);
      });

      var credit = new Promise(function(resolve, reject) {
        if (!userParams.credit) {
          resolve(null);
        } else resolve(userParams.credit);
      });

      var job = new Promise(function(resolve, reject) {
        if (!userParams.job) {
          resolve(null);
        } else {
          _check_job(userParams.job).then(function(boolean) {
            if (!boolean) reject("bad_format_job");
            else resolve(userParams.job);
          });
        }
      });

      var society = new Promise(function(resolve, reject) {
        if (!userParams.society) {
          resolve(null);
        } else {
          _check_job(userParams.society).then(function(boolean) {
            if (!boolean) reject("bad_format_society");
            else resolve(userParams.society);
          });
        }
      });

      var name = new Promise(function(resolve, reject) {
        if (!userParams.name) {
          resolve(null);
        } else {
          _check_name(userParams.name).then(function(boolean) {
            if (!boolean) reject("bad_format_name");
            else resolve(userParams.name);
          });
        }
      });

      var workspace = new Promise(function(resolve, reject) {
        if (!userParams.workspaces) {
          resolve(null);
        } else resolve(userParams.workspaces);
      });

      var active = new Promise(function(resolve, reject) {
        if (userParams.active) {
          resolve(userParams.active);
        } else {
          resolve(null);
        }
      });

      var resetpasswordtoken = new Promise(function(resolve, reject) {
        if (!userParams.resetpasswordtoken) {
          resolve(null);
        } else resolve(userParams.resetpasswordtoken);
      });

      var resetpasswordmdp = new Promise(function(resolve, reject) {
        if (!userParams.resetpasswordmdp) {
          resolve(null);
        } else resolve(userParams.resetpasswordmdp);
      });

      var hash_password = new Promise(function(resolve, reject) {
        if (userParams.new_password) {
          _hash_password(userParams.new_password)
            .then(function(hashedPassword) {
              console.log("PASSWORD", userParams.new_password, hashedPassword);
              resolve(hashedPassword);
            })
            .catch(function(err) {
              reject({
                err: "bad_format_password"
              });
            });
        } else {
          resolve(null);
        }
      });

      Promise.all([
          job,
          society,
          workspace,
          name,
          active,
          resetpasswordtoken,
          resetpasswordmdp,
          hash_password,
          stripeID,
          credit,
          secret_stripe
        ])
        .then(function(user_update_data) {
          let o = {};
          o["email"] = userParams.credentials.email;
          o["job"] = user_update_data[0];
          o["society"] = user_update_data[1];
          o["workspaces"] = user_update_data[2];
          o["name"] = user_update_data[3];
          o["active"] = user_update_data[4];
          o["resetpasswordtoken"] = user_update_data[5];
          o["resetpasswordmdp"] = user_update_data[6];
          o["hash_password"] = user_update_data[7];
          o["stripeID"] = user_update_data[8];
          o["credit"] = user_update_data[9];
          o["secret_stripe"] = user_update_data[10];
          o._id = userParams._id;
          if (config.quietLog != true) {
            //console.log("final update preprocess data");
          }
          resolve(o);
        })
        .catch(function(err) {
          reject(err);
        });
    }
  });
} // <= _update_preprocess

