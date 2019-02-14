"use strict";

let userModel = require("../models/user_model");
let pattern = require("../helpers").patterns;
let config = require("../../main/configuration.js");
let bcrypt = require("bcryptjs");
let sift = require("sift");
let graphTraitement = require("../../main/utils/graph-traitment");
let historiqueModel = require("../models").historiqueEnd;
let workspaceModel = require("../models").workspace;
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
  return new Promise(function (resolve, reject) {
    _create_preprocess(bodyParams.user).then((preData) => {
      return _create_mainprocess(preData);

    }).then(user => {
      resolve(user);
    }).catch(function (err) {
      reject(err);
    });
  });
} // <= _create

function _create_mainprocess(preData) {
  return new Promise(function (resolve, reject) {
    if (config.quietLog != true) {
      //console.log(" ------ Predata mainProcess ------- ", preData)
    }
    const userModelInstance = userModel.getInstance().model;
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
    user.save(function (err, userData) {
      if (err) {
        resolve(err);
      } else {
        resolve(userData);
      }
    });
  });
} // <= _create_mainprocess

function _create_preprocess(userParams) {
  var user_final = {};
  return new Promise(function (resolve, reject) {
    _get({
      "credentials.email": userParams.email
    }).then((user) => {
      if (user == null) {
        var mail = new Promise(function (resolve, reject) {
          const Usermail = Object.assign({}, userParams)
          if (!Usermail.email) {
            reject("no_email_provided");
          } else if (!_check_email(Usermail.email)) {
            reject("bad_email")
          } else {
            resolve(Usermail.email)
          }
        });
        var job = new Promise(function (resolve, reject) {
          if (!userParams.job) {
            resolve(null);
          }
          _check_job(userParams.job).then(function (boolean) {
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
        var name = new Promise(function (resolve, reject) {
          if (!userParams.name) {
            resolve(null);
          }
          _check_name(userParams.name).then(function (boolean) {
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

        var hash_password = new Promise(function (resolve, reject) {
          _hash_password(userParams.password, userParams.passwordConfirm).then(
            function (hashedPassword) {
              resolve(hashedPassword);
            }
          );
        });

        var society = new Promise(function (resolve, reject) {
          if (userParams.society) {
            resolve(userParams.society);
          } else {
            resolve(null);
          }
        });

        var mailid = new Promise(function (resolve, reject) {
          if (userParams.mailid) {
            resolve(userParams.mailid);
          } else {
            resolve(null);
          }
        });
        // return new Promise(function (resolve, reject) {
        Promise.all([mail, name, hash_password, job, society, mailid])
          .then((userPromise) => {
            //console.log('XXXXXXXXXXXXXXXXXX',user);
            user_final["email"] = userPromise[0];
            user_final["name"] = userPromise[1];
            user_final["hashedPassword"] = userPromise[2];
            user_final["job"] = userPromise[3];
            user_final["society"] = userPromise[4];
            user_final["mailid"] = userPromise[5];
            resolve(user_final);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject("user_exist");
      }
    });
  });
} // <= _create_preprocess

function _get_all(options) {
  if (config.quietLog != true) {
    //console.log("get_all");
  }
  return new Promise(function (resolve, reject) {
    userModel.getInstance().model
      .find(options.filters)
      .limit(options.limit)
      .select(options.select)
      .skip(options.skip)
      .sort(options.sort)
      .lean()
      .exec(function (err, users) {
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
  return new Promise(function (resolve, reject) {
    userModel.getInstance().model
      .findOne(filter)
      .lean()
      .exec(function (err, userData) {
        if (err) {
          reject(err);
        } else {
          resolve(userData);
        }
      });
  });
} // <= _get

function _getWithWorkspace(userID) {
  return new Promise(function (resolve, reject) {
    try {
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
          data.workspaces = sift({
            _id: {
              $ne: null
            }
          }, data.workspaces);
          data.workspaces = data.workspaces.map(r => {
            return {
              workspace: r._id,
              role: r.role
            };
          });
          resolve(data);
        });
    } catch (e) {
      reject(e);
    }

  });
} // <= _getWithWorkspace

function _userGraph(userId) {
  return new Promise(resolve => {
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
      }],
      (_err, result) => {
        if(result && result[0]){
          const c = {}
          const array = []
          result[0].workspaces.forEach((histo) => {
            // console.log(histo)
            if (c[histo.workflowId]) {
              c[histo.workflowId].totalPrice += histo.totalPrice;
              c[histo.workflowId].totalMo += histo.moCount
            } else {
              c[histo.workflowId] = {};
              c[histo.workflowId].totalPrice = histo.totalPrice
              c[histo.workflowId].roundDate = histo.roundDate
              c[histo.workflowId].totalMo = histo.moCount
              c[histo.workflowId].id = histo.workflowId
            }
          })
          for (const workspaceId in c) {
            array.push(new Promise(resolve => {
              workspaceModel.getInstance().model.find({ _id: workspaceId })
                .then((workspace) => {
                    if(c[workspaceId] && workspace[0]){
                      c[workspaceId].name = workspace[0].name
                      c[workspaceId].componentNumber = workspace[0].components ? workspace[0].components.length : 0
                      c[workspaceId].description = workspace[0].description
                      resolve(c[workspaceId])
                    }else {
                      resolve(c)
                    }
                });
            }))
          }

          Promise.all(array)
          .then(WorspaceWithConsuption => (graphTraitement.formatDataUserGraph(WorspaceWithConsuption)))
          .then(worspaceTraited => (resolve(worspaceTraited)))
        } else {
          resolve(null)
        }
      }
    );
  });
} // <= _userGraph

function _update(user, mailChange) {
  return new Promise(function (resolve, reject) {
    _is_google_user(user).then(function (boolean) {
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
    }).catch(function (err) {
      reject(err);
    });;
  });
} // <= _update

// --------------------------------------------------------------------------------

function _update_mainprocess(preData) {
  //transformer le model business en model de persistance
  return new Promise(function (resolve, reject) {
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
      function (err, userData) {
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

function _update_preprocess(userParams) {
  //controler les regles métier
  return new Promise(function (resolve, reject) {
    var credit = new Promise(function (resolve, reject) {
      if (!userParams.credit) {
        resolve(null);
      } else resolve(userParams.credit);
    });

    var job = new Promise(function (resolve, reject) {
      if (!userParams.job) {
        resolve(null);
      } else {
        _check_job(userParams.job).then(function (boolean) {
          if (!boolean) reject("bad_format_job");
          else resolve(userParams.job);
        });
      }
    });

    var society = new Promise(function (resolve, reject) {
      if (!userParams.society) {
        resolve(null);
      } else {
        _check_job(userParams.society).then(function (boolean) {
          if (!boolean) reject("bad_format_society");
          else resolve(userParams.society);
        });
      }
    });

    var name = new Promise(function (resolve, reject) {
      if (!userParams.name) {
        resolve(null);
      } else {
        _check_name(userParams.name).then(function (boolean) {
          if (!boolean) reject("bad_format_name");
          else resolve(userParams.name);
        });
      }
    });

    var workspace = new Promise(function (resolve, reject) {
      if (!userParams.workspaces) {
        resolve(null);
      } else resolve(userParams.workspaces);
    });

    var active = new Promise(function (resolve, reject) {
      if (userParams.active) {
        resolve(userParams.active);
      } else {
        resolve(null);
      }
    });

    var resetpasswordtoken = new Promise(function (resolve, reject) {
      if (!userParams.resetpasswordtoken) {
        resolve(null);
      } else resolve(userParams.resetpasswordtoken);
    });

    var resetpasswordmdp = new Promise(function (resolve, reject) {
      if (!userParams.resetpasswordmdp) {
        resolve(null);
      } else resolve(userParams.resetpasswordmdp);
    });

    var hash_password = new Promise(function (resolve, reject) {
      if (userParams.new_password) {
        _hash_password(userParams.new_password)
          .then(function (hashedPassword) {
            console.log("PASSWORD", userParams.new_password, hashedPassword);
            resolve(hashedPassword);
          })
          .catch(function (err) {
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
      credit,
    ])
      .then(function (user_update_data) {
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
        o["credit"] = user_update_data[8];
        o._id = userParams._id;
        if (config.quietLog != true) {
          //console.log("final update preprocess data");
        }
        resolve(o);
      })
      .catch(function (err) {
        reject(err);
      });
  })
} // <= _update_preprocess

// --------------------------------------------------------------------------------

function _check_email(email) {
  return pattern.email.test(email)
} // <= _check_email

function _check_name(name) {
  return new Promise(function (resolve, reject) {
    // if (pattern.name.test(name)) {
    // //console.log("name", true)
    resolve(true);
    // } else {
    // resolve(false)
    // };
  });
} // <= _check_name

function _check_job(job) {
  return new Promise(function (resolve, reject) {
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
  return new Promise(function (resolve, reject) {
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

    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        throw err;
      }
      bcrypt.hash(password, salt, function (err, hash) {
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
  return new Promise(function (resolve, reject) {
    userModel.getInstance().model
      .findOne({
        "credentials.email": user.email
      })
      .exec(function (err, userData) {
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
