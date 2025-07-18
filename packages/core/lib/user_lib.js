'use strict';

const userModel = require('../models/user_model');
const pattern = require('../helpers').patterns;
const bcrypt = require('bcryptjs');
const sift = require('sift').default;
const graphTraitement = require('../helpers/graph-traitment');
const historiqueModel = require('../models').historiqueEnd;
const SecureMailModel = require('../models/security_mail');
const workspaceModel = require('../models').workspace;
const certificateModel = require('../models').certificate;
// let bigdataflowModel = require("../models").bigdataflow;
const Error = require('../helpers/error.js');
const validator = require('validator');


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
  updateProfil,
  getWithRelations: _getWithRelations,
  userGraph: _userGraph,
  createUpdatePasswordEntity: _createUpdatePasswordEntity,
  getPasswordEntity: _getPasswordEntity
};

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

// create ==  1 + 2
// 1 - edit data encrypt password( send activation mail)
// 2 - save in bdd user model

function _create(bodyParams) {
  return new Promise((resolve, reject) => {
    _create_preprocess(bodyParams.user).then((preData) => {
      return _create_mainprocess(preData);
    }).then(user => {
      resolve(user);
    }).catch((err) => {
      reject(err);
    });
  });
} // <= _create

async function _create_mainprocess(preData) {
  const userModelInstance = userModel.getInstance().model;
  try {
    const user = new userModelInstance({
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
    const userData = await user.save();
    return userData;
  } catch (error) {
    if (error.code == 11000) {
      throw new Error.UniqueEntityError('User');
    }
    throw error;
  }
} // <= _create_mainprocess

function _create_preprocess(userParams) {
  const user_final = {};
  return new Promise((resolve, reject) => {
    const mail = new Promise((resolve, reject) => {
      const Usermail = Object.assign({}, userParams);
      const check = _check_email(Usermail.email);
      if (validator.isEmail(Usermail.email) === false) {
        reject(new Error.PropertyValidationError('mail'));
      } else {
        resolve(Usermail.email);
      }
    });
    const job = new Promise((resolve, reject) => {
      if (!userParams.job) {
        resolve(null);
      }
      _check_job(userParams.job).then((boolean) => {
        if (!boolean) {
          reject(new Error.PropertyValidationError('job'));
        } else {
          resolve(userParams.job);
        }
      });
    });
    const name = new Promise((resolve, reject) => {
      if (!userParams.name) {
        resolve(null);
      }
      _check_name(userParams.name).then((boolean) => {
        if (!boolean) {
          reject(new Error.PropertyValidationError('name'));
        } else {
          resolve(userParams.name);
        }
      });
    });
    const hash_password = new Promise((resolve) => {
      _hash_password(userParams.password, userParams.passwordConfirm).then(
        (hashedPassword) => {
          resolve(hashedPassword);
        }
      );
    });
    const society = new Promise((resolve, reject) => {
      if (userParams.society) {
        resolve(userParams.society);
      } else {
        resolve(null);
      }
    });
    const mailid = new Promise((resolve, reject) => {
      if (userParams.mailid) {
        resolve(userParams.mailid);
      } else {
        resolve(null);
      }
    });

    Promise.all([mail, name, hash_password, job, society, mailid])
      .then((userPromise) => {
        user_final['email'] = userPromise[0];
        user_final['name'] = userPromise[1];
        user_final['hashedPassword'] = userPromise[2];
        user_final['job'] = userPromise[3];
        user_final['society'] = userPromise[4];
        user_final['mailid'] = userPromise[5];
        resolve(user_final);
      })
      .catch((err) => {
        reject(err);
      });
  });
} // <= _create_preprocess

async function _get_all(options) {
  const users = await userModel.getInstance().model
    .find(options.filters)
    .limit(options.limit)
    .select(options.select)
    .skip(options.skip)
    .sort(options.sort)
    .lean()
    .exec();
  return users;
} // <= _get_all

async function _get(filter) {
  try {
    const userData = await userModel.getInstance().model
      .findOne(filter)
      .lean()
      .exec();
    if( userData == null) {
      throw new Error.EntityNotFoundError();
    } else {
      return userData;
    }
  } catch (error) {
    if (error instanceof Error.EntityNotFoundError) {
      throw error;
    }
    throw new Error.DataBaseProcessError(error);
  }
  // userModel.getInstance().model
  //   .findOne(filter)
  //   .lean()
  //   .exec(function (err, userData) {
  //     if(err){
  //       return reject(new Error.DataBaseProcessError(err))
  //     } if( userData == null){
  //       reject(new Error.EntityNotFoundError(err))
  //     } else {
  //       resolve(userData);
  //     }
  //   });
} // <= _get

async function _getWithRelations(userID, config) {
  const data = await userModel.getInstance().model
    .findOne({
      _id: userID
    })
  // .populate({
  //   path: "workspaces._id",
  //   select: "name description"
  // })
  // .populate({
  //   path: "bigdataflow._id",
  //   select: "name description"
  // })
    .lean()
    .exec();

  const InversRelationWorkspaces = await workspaceModel.getInstance().model.find({
    'users.email': data.credentials.email
  }).lean().exec();
  // console.log('XXXX InversRelationWorkspaces',InversRelationWorkspaces)
  data.workspaces = InversRelationWorkspaces;
  data.workspaces = data.workspaces.filter(sift({
    _id: {
      $ne: null
    }
  }));

  data.workspaces = data.workspaces.map(w => {
    const userOfWorkspace = w.users.find(u => u.email === data.credentials.email);
    // console.log("XXXX workspace",w)
    return {
      workspace: w,
      role: userOfWorkspace.role
    };
  });
  if (config.adminUsers) {
    let adminUsers = config.adminUsers;
    if (!Array.isArray(config.adminUsers)) {
      adminUsers = [adminUsers];
    }
    if (adminUsers.includes(data.credentials.email)) {
      data.admin = true;
    } else {
      data.admin = false;
    }
  }else {
    data.admin = true;
  }
  // TODO REFACTORING and suppression
  // if(data.bigdataflow!=undefined){
  //   data.bigdataflow = data.bigdataflow.filter(sift({
  //     _id: {
  //       $ne: null
  //     }
  //   }));
  //   Array.isArray(data.bigdataflow) ?
  //   data.bigdataflow = data.bigdataflow.map(r => {
  //     return {
  //       bigdataflow: r._id,
  //       role: r.role
  //     };
  //   }) : data.bigdataflow = []
  // }else {
  //   data.bigdataflow = []
  // }

  return data;

  // userModel.getInstance().model
  //   .findOne({
  //     _id: userID
  //   })
  //   // .populate({
  //   //   path: "workspaces._id",
  //   //   select: "name description"
  //   // })
  //   // .populate({
  //   //   path: "bigdataflow._id",
  //   //   select: "name description"
  //   // })
  //   .lean()
  //   .exec(async (error, data) => {

  //   });
} // <= _getWithWorkspace

function _userGraph(userId) {
  return new Promise(resolve => {
    historiqueModel.getInstance().model.aggregate([
      {
        $match: {
          userId: userId
        }
      },
      {
        $group: {
          _id: { workspaceId: '$workspaceId', roundDate: { $dayOfMonth: '$date' } },
          totalPrice: {
            $sum: '$totalPrice'
          },
          totalMo: {
            $sum: '$moCount'
          },
          workspaces: {
            $push: '$$ROOT'
          }
        }
      }
    ])
      .then(result => {
        if (result && result[0]) {
          const c = {};
          const array = [];

          result[0].workspaces.forEach(histo => {
            const id = histo.workflowId + histo.roundDate;
            if (c[id]) {
              c[id].totalPrice += histo.totalPrice;
              c[id].totalMo += histo.moCount;
            } else {
              c[id] = {};
              c[id].totalPrice = histo.totalPrice;
              c[id].roundDate = histo.roundDate;
              c[id].totalMo = histo.moCount;
              c[id].id = histo.workflowId;
            }
          });

          for (const workspaceId in c) {
            array.push(
              workspaceModel.getInstance().model.find({ _id: c[workspaceId].id })
                .then(workspace => {
                  if (c[workspaceId] && workspace[0]) {
                    c[workspaceId].name = workspace[0].name;
                    c[workspaceId].componentNumber = workspace[0].components ? workspace[0].components.length : 0;
                    c[workspaceId].description = workspace[0].description;
                    return c[workspaceId];
                  } else {
                    return c;
                  }
                })
            );
          }

          Promise.all(array)
            .then(WorspaceWithConsuption => graphTraitement.formatDataUserGraph(WorspaceWithConsuption))
            .then(worspaceTraited => resolve(worspaceTraited))
            .catch(error => {
              console.error('Error in processing workspaces:', error);
              resolve(null);
            });
        } else {
          resolve(null);
        }
      })
      .catch(error => {
        console.error('Error in aggregating data:', error);
        resolve(null);
      });
  });
}


/**
 * @param {string} id
 * @param {ProfilPatch} userPatch
 * @return {Promise<UserDocument>}
 */
function updateProfil(id, userPatch) {
  return userModel.getInstance().model
    .findById(id)
    .exec()
    .then(user => {
      if (user.googleId != null) {
        return Promise.reject(new Error('google_user'));
      } else {
        return userModel.getInstance().model
          .findByIdAndUpdate(
            id,
            { '$set': userPatch },
            { new: true }
          )
          .exec()
          .catch(error => Promise.reject(new Error.DataBaseProcessError(error)));
      }
    });
}

function _update(user, mailChange) {
  return new Promise((resolve, reject) => {
    _is_google_user(user).then((boolean) => {
      if (boolean == true) {
        reject('google_user');
      } else {
        return _update_preprocess(user, mailChange);
      }
    }).then((preData) => {
      return _update_mainprocess(preData);
    }).then((user) => {
      resolve(user);
    }).catch((err) => {
      reject(err);
    });
  });
} // <= _update

// --------------------------------------------------------------------------------

async function _update_mainprocess(preData) {
  // transformer le model business en model de persistance
  const toUpdate = {};
  if (preData.email) {
    if (!toUpdate['$set']) {
      toUpdate['$set'] = {};
    }

    toUpdate['$set']['credentials.email'] = preData.email;
  }

  if (preData.hash_password) {
    if (!toUpdate['$set']) {
      toUpdate['$set'] = {};
    }

    toUpdate['$set']['credentials.hashed_password'] = preData.hash_password;
  }

  if (preData.credit) {
    if (!toUpdate['$set']) {
      toUpdate['$set'] = {};
    }

    toUpdate['$set']['credit'] = preData.credit;
  }

  if (preData.job) {
    if (!toUpdate['$set']) {
      toUpdate['$set'] = {};
    }
    toUpdate['$set']['job'] = preData.job;
  }


  if (preData.name) {
    if (!toUpdate['$set']) {
      toUpdate['$set'] = {};
    }
    toUpdate['$set']['name'] = preData.name;
  }

  if (preData.society) {
    if (!toUpdate['$set']) {
      toUpdate['$set'] = {};
    }
    toUpdate['$set']['society'] = preData.society;
  }

  if (preData.workspaces) {
    if (!toUpdate['$set']) {
      toUpdate['$set'] = {};
    }
    toUpdate['$set']['workspaces'] = preData.workspaces;
  }

  if (preData.bigdataflow) {
    if (!toUpdate['$set']) {
      toUpdate['$set'] = {};
    }
    toUpdate['$set']['bigdataflow'] = preData.bigdataflow;
  }

  if (preData.active) {
    if (!toUpdate['$set']) {
      toUpdate['$set'] = {};
    }
    toUpdate['$set']['active'] = preData.active;
  }

  if (preData.resetpasswordtoken) {
    if (!toUpdate['$set']) {
      toUpdate['$set'] = {};
    }
    toUpdate['$set']['resetpasswordtoken'] = preData.resetpasswordtoken;
  }

  if (preData.resetpasswordmdp) {
    if (!toUpdate['$set']) {
      toUpdate['$set'] = {};
    }
    toUpdate['$set']['resetpasswordmdp'] = preData.resetpasswordmdp;
  }

  try {
    const userData = await userModel.getInstance().model.findByIdAndUpdate(
      preData._id,
      toUpdate, {
        new: true
      }).exec();
    return userData;
  } catch (error) {
    throw new Error.DataBaseProcessError(error);
  }
  // userModel.getInstance().model.findByIdAndUpdate(
  //   preData._id,
  //   toUpdate, {
  //     new: true
  //   },
  //   function (err, userData) {
  //     if (err) {
  //       return reject(new Error.DataBaseProcessError(err))
  //     } else {

  //       resolve(userData);
  //     }
  //   }
  // );
} // <= _update_mainprocess

// --------------------------------------------------------------------------------

function _update_preprocess(userParams) {
  // controler les regles métier
  return new Promise((resolve, reject) => {
    const credit = new Promise((resolve, reject) => {
      if (!userParams.credit) {
        resolve(null);
      } else resolve(userParams.credit);
    });

    const job = new Promise((resolve, reject) => {
      if (!userParams.job) {
        resolve(null);
      } else {
        _check_job(userParams.job).then((boolean) => {
          if (!boolean) reject('bad_format_job');
          else resolve(userParams.job);
        });
      }
    });

    const society = new Promise((resolve, reject) => {
      if (!userParams.society) {
        resolve(null);
      } else {
        _check_job(userParams.society).then((boolean) => {
          if (!boolean) reject('bad_format_society');
          else resolve(userParams.society);
        });
      }
    });

    const name = new Promise((resolve, reject) => {
      if (!userParams.name) {
        resolve(null);
      } else {
        _check_name(userParams.name).then((boolean) => {
          if (!boolean) reject('bad_format_name');
          else resolve(userParams.name);
        });
      }
    });

    const workspace = new Promise((resolve, reject) => {
      if (!userParams.workspaces) {
        resolve(null);
      } else resolve(userParams.workspaces);
    });

    const bigdataflow = new Promise((resolve, reject) => {
      if (!userParams.bigdataflow) {
        resolve(null);
      } else resolve(userParams.bigdataflow);
    });

    const active = new Promise((resolve, reject) => {
      if (userParams.active) {
        resolve(userParams.active);
      } else {
        resolve(null);
      }
    });

    const resetpasswordtoken = new Promise((resolve, reject) => {
      if (!userParams.resetpasswordtoken) {
        resolve(null);
      } else resolve(userParams.resetpasswordtoken);
    });

    const resetpasswordmdp = new Promise((resolve, reject) => {
      if (!userParams.resetpasswordmdp) {
        resolve(null);
      } else resolve(userParams.resetpasswordmdp);
    });

    const hash_password = new Promise((resolve, reject) => {
      if (userParams.new_password) {
        _hash_password(userParams.new_password)
          .then((hashedPassword) => {
            resolve(hashedPassword);
          })
          .catch((err) => {
            reject({
              err: 'bad_format_password'
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
      bigdataflow
    ])
      .then((user_update_data) => {
        const o = {};
        o['email'] = userParams.credentials.email;
        o['job'] = user_update_data[0];
        o['society'] = user_update_data[1];
        o['workspaces'] = user_update_data[2];
        o['name'] = user_update_data[3];
        o['active'] = user_update_data[4];
        o['resetpasswordtoken'] = user_update_data[5];
        o['resetpasswordmdp'] = user_update_data[6];
        o['hash_password'] = user_update_data[7];
        o['credit'] = user_update_data[8];
        o['bigdataflow'] = user_update_data[9];
        o._id = userParams._id;

        resolve(o);
      })
      .catch((err) => {
        reject(err);
      });
  });
} // <= _update_preprocess

// --------------------------------------------------------------------------------

function _check_email(email) {
  return pattern.email.test(email);
} // <= _check_email

function _check_name(name) {
  return new Promise((resolve, reject) => {
    // if (pattern.name.test(name)) {
    resolve(true);
    // } else {
    // resolve(false)
    // };
  });
} // <= _check_name

function _check_job(job) {
  return new Promise((resolve, reject) => {
    if (pattern.job.test(job)) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
} // <= _check_job

// --------------------------------------------------------------------------------

function _hash_password(password, passwordConfirm) {
  return new Promise((resolve, reject) => {
    if (passwordConfirm) {
      if (password != passwordConfirm) {
        reject(403);
        return reject(new Error.PropertyValidationError('password'));
      }
    }
    if (!pattern.password.test(password)) {
      return reject('Le mot de passe doit avoir entre 6 et 20 caractères.');
    }

    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return reject(new Error.PropertyValidationError('password'));
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          return reject(new Error.PropertyValidationError('password'));
        } else {
          resolve(hash);
        }
      });
    });
  });
} // <= _hash_password

// --------------------------------------------------------------------------------

async function _is_google_user(user) {
  try {
    const userData = await userModel.getInstance().model
      .findOne({
        'credentials.email': user.email
      })
      .exec();
    if (userData) {
      if (userData.googleId != null) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    throw new Error.DataBaseProcessError(error);
  }
  // userModel.getInstance().model
  //   .findOne({
  //     "credentials.email": user.email
  //   })
  //   .exec(function (err, userData) {
  //     if (userData) {
  //       if (userData.googleId != null) {
  //         resolve(true);
  //       } else {
  //         resolve(false);
  //       }
  //     } else {
  //       resolve(false);
  //     }
  //   });
} // <= _is_google_user

// --------------------------------------------------------------------------------

async function _createUpdatePasswordEntity(userMail, token) {
  try {
    const result = await SecureMailModel.updateOne(
      { userMail },
      { userMail, token },
      { upsert: true, setDefaultsOnInsert: true }
    );
    return result;
  } catch (error) {
    reject(new Error('DataBaseProcessError', error));
  }
}

// --------------------------------------------------------------------------------

function _getPasswordEntity(mail) {
  return new Promise((resolve, reject) => {
    SecureMailModel.get()
      .findOne({ userMail: mail })
      .exec((err, data) => {
        if(err) {
          return reject(new Error.DataBaseProcessError(err));
        }
        if( data == null) {
          reject(new Error.EntityNotFoundError(err));
        } else {
          resolve(data);
        }
      });
  });
} // <= _createUpdatePasswordEntity
