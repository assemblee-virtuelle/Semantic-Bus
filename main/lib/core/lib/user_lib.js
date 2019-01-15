"use strict";

let userModel = require("../models/user_model");
let workspaceModel = require("../models/workspace_model");
let pattern = require("../helpers").patterns;
let config = require("../../../configuration.js");
let bcrypt = require("bcryptjs");
let sift = require("sift");
let graphTraitement = require("../../../utils/graph-traitment");
let historiqueModel = require("../models").historiqueEnd;
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
  create: _create,
  get: _get,
  get_all: _get_all,
  update: _update,
  getWithWorkspace: _getWithWorkspace,
  userGraph: _userGraph
};

const decimalAdjust = function(type, value, exp) {
  // Si la valeur de exp n'est pas définie ou vaut zéro...
  if (typeof exp === "undefined" || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  // Si la valeur n'est pas un nombre ou si exp n'est pas un entier...
  if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
    return NaN;
  }
  // Si la valeur est négative
  if (value < 0) {
    return this.decimalAdjust(type, -value, exp);
  }

  // Décalage
  value = value.toString().split("e");
  value = Math[type](+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)));
  // Décalage inversé
  value = value.toString().split("e");
  return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp));
};

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

// create ==  1 + 2
// 1 - edit data encrypt password( send activation mail)
// 2 - save in bdd user model

function _create(bodyParams) {
  if (config.quietLog != true) {
    //console.log(bodyParams)
  }
  return new Promise(function(resolve, reject) {
    _create_preprocess(bodyParams.user).then((preData) => {
      return _create_mainprocess(preData);

    }).then(user => {
      resolve(user);
    }).catch(function(err) {
      reject(err);
    });
  });
} // <= _create

function _create_mainprocess(preData) {
  return new Promise(function(resolve, reject) {
    if (config.quietLog != true) {
      //console.log(" ------ Predata mainProcess ------- ", preData)
    }
    const userModelInstance= userModel.getInstance().model;
    var user = new userModelInstance({
      credentials: {
        email: preData.email,
        hashed_password: preData.hashedPassword
      },
      mailid: preData.mailid,
      name: preData.name,
      society: preData.society,
      job: preData.job,
      dates: {
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    user.save(function(err, userData) {
      if (err) {
        resolve(err);
      } else {
        resolve(userData);
      }
    });
  });
} // <= _create_mainprocess

function _create_preprocess(userParams) {
  if (config.quietLog != true) {
    //console.log(" ------- _create_preprocess -----", userParams);
  }
  var user_final = {};
  return new Promise(function(resolve, reject) {
    _get({
      "credentials.email": userParams.email
    }).then(function(user) {
      if (config.quietLog != true) {
        console.log("User start ----", user);
      }
      if (user == null) {
        var email = new Promise(function(resolve, reject) {
          if (!userParams.email) {
            reject("no_email_provided");
          }
          _check_email(userParams.email).then(function(boolean) {
            if (config.quietLog != true) {
              //console.log("email:", userParams.email, "check email :", boolean);
            }
            if (!boolean) {
              reject("bad_email");
            } else {
              resolve(userParams.email);
            }
          });
        });
        var job = new Promise(function(resolve, reject) {
          if (!userParams.job) {
            resolve(null);
          }
          _check_job(userParams.job).then(function(boolean) {
            if (config.quietLog != true) {
              //console.log("job:", userParams.job, "check job :", boolean);
            }
            if (!boolean) {
              reject("job_bad_format");
            } else {
              resolve(userParams.job);
            }
          });
        });
        var name = new Promise(function(resolve, reject) {
          if (!userParams.name) {
            resolve(null);
          }
          _check_name(userParams.name).then(function(boolean) {
            if (config.quietLog != true) {
              //console.log("name:", userParams.name, "check name :", boolean);
            }
            if (!boolean) {
              reject("name_bad_format");
            } else {
              resolve(userParams.name);
            }
          });
        });

        var hash_password = new Promise(function(resolve, reject) {
          _hash_password(userParams.password, userParams.passwordConfirm).then(
            function(hashedPassword) {
              resolve(hashedPassword);
            }
          );
        });

        var society = new Promise(function(resolve, reject) {
          if (userParams.society) {
            resolve(userParams.society);
          } else {
            resolve(null);
          }
        });

        var mailid = new Promise(function(resolve, reject) {
          if (userParams.mailid) {
            resolve(userParams.mailid);
          } else {
            resolve(null);
          }
        });
        // return new Promise(function (resolve, reject) {
        Promise.all([email, name, hash_password, job, society, mailid])
          .then(function(user) {
            //console.log('XXXXXXXXXXXXXXXXXX',user);
            user_final["email"] = user[0];
            user_final["name"] = user[1];
            user_final["hashedPassword"] = user[2];
            user_final["job"] = user[3];
            user_final["society"] = user[4];
            user_final["mailid"] = user[5];
            if (config.quietLog != true) {
              //console.log('---- promise all ---', user);
            }
            resolve(user_final);
          })
          .catch(function(err) {
            if (config.quietLog != true) {
              //console.log('---- promise all error---', err);
            }
            reject(err);
          });
      } else {
        if (config.quietLog != true) {
          //console.log(" ---------- User exist ------");
        }
        reject("user_exist");
      }
    });
  });
} // <= _create_preprocess

function _get_all(options) {
  if (config.quietLog != true) {
    //console.log("get_all");
  }
  return new Promise(function(resolve, reject) {
    userModel.getInstance().model
      .find(options.filters)
      .limit(options.limit)
      .select(options.select)
      .skip(options.skip)
      .sort(options.sort)
      .lean()
      .exec(function(err, users) {
        if (err) {
          reject(err);
        } else {
          if (config.quietLog != true) {
            //console.log("GET ALL", users);
          }
          resolve(users);
        }
      });
  });
} // <= _get_all

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

function _getWithWorkspace(userID, role) {
  return new Promise(function(resolve, reject) {
    try{
      //console.log(userID);
      userModel.getInstance().model
        .findOne({
          _id: userID
        })
        .populate({
          path: "workspaces._id",
          select: "name description"
        })
        .lean()
        .exec((error, data) => {
          //console.log("_getWithWorkspace error",error,data);
          //null wokspace protection
          data.workspaces = sift({
            _id: {
              $ne: null
            }
          }, data.workspaces);
          //console.log(data.workspaces);
          data.workspaces = data.workspaces.map(r => {
            return {
              workspace: r._id,
              role: r.role
            };
          });
          //  console.log(role);
          //let workspaces=sift({role:role},data.workspaces).map(r=>r.workspace);
          resolve(data);
        });
    }catch(e){
      reject(e);
    }

  });
} // <= _getWithWorkspace

function _userGraph(userId) {
  //console.log("LOADING USER1 bis")
  return new Promise((resolve, reject) => {
    historiqueModel.getInstance().model.aggregate(
      [{
          $match: {
            userId: userId
          }
        },
        {
          $group: {
            _id: {
              workspaceId: "$workspaceId",
              roundDate: "$roundDate"
            },
            totalPrice: {
              $sum: "$totalPrice"
            },
            totalMo: {
              $sum: "$moCount"
            },
            workspaces: {
              $push: "$$ROOT"
            }
          }
        }
      ],
      function(err, result) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          //console.log("LOADING USER2",result)
          graphTraitement.formatDataUserGraph().then(graphData => {
            let final_graph = [];
            let globalPrice = 0;
            let tableId = [];
            let workspaceNumber = 0;
            let globalMo = 0;
            let c = {};
            for (var month in graphData) {
              for (var day in graphData[month]) {
                let y0 = 0;
                let final_data_object = {};
                final_data_object.Day = day;
                final_data_object.total = 0;
                final_data_object.ages = [];
                let i = 0;
                result.forEach(res => {
                  let key;
                  if (
                    new Date(parseInt(res._id.roundDate)).getUTCMonth() + 1 == month &&
                    new Date(parseInt(res._id.roundDate)).getUTCDate() ==
                    day.split("-")[1]
                  ) {
                    tableId.push(res._id.workspaceId);
                    final_data_object.ages.push({
                      ID: res._id.workspaceId,
                      name: res.workspaces[res.workspaces.length - 1].workspaceName,
                      price: decimalAdjust("round", res.totalPrice, -2),
                      flow: decimalAdjust("round", res.totalMo, -2),
                      y0: +y0,
                      y1: (y0 += res.totalPrice)
                    });
                    final_data_object.total += res.totalPrice;
                    workspaceNumber += 1;
                    globalPrice += res.totalPrice;
                    globalMo += res.totalMo;
                  }
                });
                final_graph.push(final_data_object);
              }
            }
            resolve({
              tableId: tableId,
              globalPrice: globalPrice,
              data: final_graph,
              globalMo: globalMo,
              numberWorkspace: workspaceNumber
            });
          });
        }
      }
    );
  });
} // <= _userGraph

// function _getUserWorkspaceGraphData(userID, role) {
//   return new Promise(function(resolve, reject) {
//     userModel.getInstance().model.findOne({
//         _id: userID
//       })
//       .populate({path: 'workspaces._id'})
//       .lean()
//       .exec((error, data) => {
//         //console.log(data);
//         //null wokspace protection
//         data.workspaces=sift({'_id':{$ne:null}}, data.workspaces);
//         //console.log(data.workspaces);
//         data.workspaces = data.workspaces.map(r => {
//           return {
//             workspace: r._id,
//             role: r.role
//           }
//         })
//         //  console.log(role);
//         //let workspaces=sift({role:role},data.workspaces).map(r=>r.workspace);
//         workspaceGraphUserTraitement.formatDataUserGraph(data).then((workspaceAfterTraitment)=>{
//           resolve(workspaceAfterTraitment)
//         })
//       })
//   });

// var workspaces_owner = [];
// return new Promise(function (resolve, reject) {
//   _get({
//     _id: userID
//   }).then(function (user) {
//     if (user.workspaces.length > 0) {
//       user.workspaces.forEach(function (workspace) {
//         if (workspace.role == role) {
//           workspaces_owner.push(workspace._id);
//         }
//       })
//       workspaceModel.find({
//           '_id': {
//             $in: workspaces_owner
//           }
//         },
//         function (err, workspaces) {
//           if (workspaces) {
//             resolve({
//               user: user,
//               workspaces: workspaces
//             })
//           } else {
//             reject(err)
//           }
//         });
//     } else {
//       resolve({
//         user: user,
//         workspaces: []
//       })
//     }
//   })
// })
// <= _userGraph

// --------------------------------------------------------------------------------

// function _getUserWorkspaceGraphData(userID, role) {
//   return new Promise(function(resolve, reject) {
//     userModel.getInstance().model.findOne({
//         _id: userID
//       })
//       .populate({path: 'workspaces._id'})
//       .lean()
//       .exec((error, data) => {
//         //console.log(data);
//         //null wokspace protection
//         data.workspaces=sift({'_id':{$ne:null}}, data.workspaces);
//         //console.log(data.workspaces);
//         data.workspaces = data.workspaces.map(r => {
//           return {
//             workspace: r._id,
//             role: r.role
//           }
//         })
//         //  console.log(role);
//         //let workspaces=sift({role:role},data.workspaces).map(r=>r.workspace);
//         workspaceGraphUserTraitement.formatDataUserGraph(data).then((workspaceAfterTraitment)=>{
//           resolve(workspaceAfterTraitment)
//         })
//       })
//   });

// var workspaces_owner = [];
// return new Promise(function (resolve, reject) {
//   _get({
//     _id: userID
//   }).then(function (user) {
//     if (user.workspaces.length > 0) {
//       user.workspaces.forEach(function (workspace) {
//         if (workspace.role == role) {
//           workspaces_owner.push(workspace._id);
//         }
//       })
//       workspaceModel.find({
//           '_id': {
//             $in: workspaces_owner
//           }
//         },
//         function (err, workspaces) {
//           if (workspaces) {
//             resolve({
//               user: user,
//               workspaces: workspaces
//             })
//           } else {
//             reject(err)
//           }
//         });
//     } else {
//       resolve({
//         user: user,
//         workspaces: []
//       })
//     }
//   })
// })
// <= _getWithWorkspace

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

function _checkUserCredits(userId) {
  return new Promise((resolve, reject) => {
    user_lib.get({
      _id: userId
    }).then(user => {
      if (user.credit > 100) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// --------------------------------------------------------------------------------

function _check_email(email) {
  return new Promise(function(resolve, reject) {
    if (pattern.email.test(email)) {
      if (config.quietLog != true) {
        //console.log("email", true);
      }
      resolve(true);
    } else {
      resolve(false);
    }
  });
} // <= _check_email

function _check_name(name) {
  return new Promise(function(resolve, reject) {
    // if (pattern.name.test(name)) {
    // //console.log("name", true)
    resolve(true);
    // } else {
    // resolve(false)
    // };
  });
} // <= _check_name

function _check_job(job) {
  return new Promise(function(resolve, reject) {
    if (pattern.job.test(job)) {
      if (config.quietLog != true) {
        //console.log("job", true);
      }
      resolve(true);
    } else {
      resolve(false);
    }
  });
} // <= _check_job

// --------------------------------------------------------------------------------

function _hash_password(password, passwordConfirm) {
  return new Promise(function(resolve, reject) {
    if (passwordConfirm) {
      if (password != passwordConfirm) {
        if (config.quietLog != true) {
          //console.log("password != password confirme");
        }
        reject(403);
      }
    }
    if (!pattern.password.test(password)) {
      if (config.quietLog != true) {
        //console.log('password != password pattern');
      }
      reject(403);
    }

    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        throw err;
      }
      bcrypt.hash(password, salt, function(err, hash) {
        if (err) {
          throw err;
        } else {
          resolve(hash);
        }
      });
    });
  });
} // <= _hash_password

// --------------------------------------------------------------------------------

function _is_google_user(user) {
  return new Promise(function(resolve, reject) {
    userModel.getInstance().model
      .findOne({
        "credentials.email": user.email
      })
      .exec(function(err, userData) {
        if (userData) {
          if (userData.googleId != null) {
            if (config.quietLog != true) {
              //console.log("googleID");
            }
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
  });
} // <= _is_google_user

// --------------------------------------------------------------------------------
