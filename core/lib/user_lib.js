'use strict';

var UserModel = require('../models').user;
var pattern = require('../helpers').patterns;
const bcrypt = require('bcryptjs');


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
    create: _create,
    get: _get,
    get_all: _get_all,
    update: _update,
};

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

// create ==  1 + 2
// 1 - edit data encrypt password( send activation mail)
// 2 - save in bdd user model

function _create(bodyParams) {
    return new Promise(function (resolve, reject) {
        _create_preprocess(bodyParams.user).then(function (preData) {
            _create_mainprocess(preData).then(function (user) {
                resolve(user)
            })
        })
    })
} // <= _create

// --------------------------------------------------------------------------------

function _create_mainprocess(preData) {
    var user = new UserModel({
        credentials: {
            email: preData.email,
            hashed_password: preData.hashedPassword
        },
        name: preData.name,
        society: preData.society,
        job: preData.job,
        dates: {
            created_at: new Date(),
            updated_at: new Date()
        }
    })

    return new Promise(function (resolve, reject) {
        user.save(function (err, userData) {
            if(err){
                throw TypeError(err);
            }else{
                resolve(userData)
            }
        });
    })
} // <= _create_mainprocess

// --------------------------------------------------------------------------------

function _create_preprocess(userParams) {
    var user_final = {}
    var email = new Promise(function (resolve, reject) {
        if (!_check_email(userParams.email)) {
            console.log('fail mail')
            throw TypeError("bad format email");
        }
        resolve(userParams.email)
    })

    var name = new Promise(function (resolve, reject) {
        if (_check_name(userParams.name) == false) {
            console.log('fail name')
            throw TypeError("bad format name");
        }
        resolve(userParams.name)
    })
    var hash_password = new Promise(function (resolve, reject) {
        _hash_password(userParams.password, userParams.passwordConfirm).then(function (hashedPassword) {
            resolve(hashedPassword)
        })
    })
    var job = new Promise(function (resolve, reject) {
        if (userParams.job) {
            resolve(userParams.job)
        } else {
            resolve(null)
        }
    })
    var society = new Promise(function (resolve, reject) {
        if (userParams.society) {
            resolve(userParams.society)
        } else {
            resolve(null)
        }
    })
    return new Promise(function (resolve, reject) {
        Promise.all([email, name, hash_password, job, society]).then(function (user) {
            user_final['email'] = user[0];
            user_final['name'] = user[1];
            user_final['hashedPassword'] = user[2];
            user_final['job'] = user[3];
            user_final['society'] = user[4];
            resolve(user_final)
        }).catch(function (err) {
            reject(err)
        })
    })
} // <= _create_preprocess

// --------------------------------------------------------------------------------

// --------------------------------------------------------------------------------

function _get_all(options) {
    return new Promise(function (resolve, reject) {
        UserModel.find(options.filters)
            .limit(options.limit)
            .select(options.select)
            .skip(options.skip)
            .sort(options.sort)
            .exec(function (err, users) {
                if (err) {
                    reject(err)
                } else {
                    resolve(users);
                }
            });
    })
} // <= _get_all



function _get(options) {
    return new Promise(function (resolve, reject) {
        UserModel.findOne(options.filters)
            .select(options.select)
            .exec(function (err, userData) {
                if (err) {
                    reject(err)
                } else {
                    resolve(userData);
                }
            });
    })
} // <= _get


function _update(userId, bodyParams) {
    return new Promise(function (resolve, reject) {
        _update_preprocess(userId, bodyParams.user).then(function (preData) {
            _update_mainprocess(userId, preData).then(function (user) {
                resolve(user)
            }).catch(function (err) {
                reject(err)
            });
        }).catch(function (err) {
            reject(err)
        })
    })
} // <= _update

// --------------------------------------------------------------------------------

function _update_mainprocess(userId, preData) {
    var toUpdate = {};
    if (preData.email) {
        if (!toUpdate['$set']) {
            toUpdate['$set'] = {};
        }

        toUpdate['$set']['credentials.email'] = preData.email;
    }

    if (preData.job) {
        if (!toUpdate['$set']) {
            toUpdate['$set'] = {};
        }
        toUpdate['$set']['job'] = preData.job;
    }

    return new Promise(function (resolve, reject) {
        UserModel.findByIdAndUpdate(userId, toUpdate,
            function (err, userData) {
                if (err) {
                    reject(err)
                } else {
                    resolve(userData)
                }
            });
    })
} // <= _update_mainprocess

// --------------------------------------------------------------------------------

function _update_preprocess(userId, userParams) {
    var email = new Promise(function (resolve, reject) {
        if (!userParams.email) {
            resolve(null);
        }

        if (!_check_email(userParams.email)) {
            throw TypeError("bad format email");
        }
        resolve(userParams.email);
    })
    var job = new Promise(function (resolve, reject) {
        if (!userParams.job) {
            resolve(null);
        }

        if (!_check_job(userParams.job)) {
            throw TypeError("job is to long");
        }
        resolve(userParams.job);
    })
    return new Promise(function (resolve, reject) {
        Promise.all([email, job]).then(function (user_update_data) {
            var o = {}
            o['email'] = user_update_data[0]
            o['job'] = user_update_data[1]
            resolve(o)
        }).catch(function (err) {
            reject(err)
        })
    })
} // <= _update_preprocess

// --------------------------------------------------------------------------------

function _check_email(email) {
    return pattern.email.test(email);
} // <= _check_email


function _check_job(job) {
    return pattern.job.test(job);
} // <= _check_job

function _check_name(name) {
    return pattern.name.test(name);
} // <= _check_job

// --------------------------------------------------------------------------------

function _hash_password(password, passwordConfirm) {
    return new Promise(function (resolve, reject) {
        if (password != passwordConfirm) {
            console.log('password != password confirme')
            reject(403);
        }

        if (!pattern.password.test(password)) {
            console.log('password != password pattern')
            reject(403);
        }

        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                reject(err)
            }
            bcrypt.hash(password, salt, function (err, hash) {
                if (err) {
                    reject(err)
                } else {
                    resolve(hash)
                }
            });
        })
    })
} // <= _hash_password