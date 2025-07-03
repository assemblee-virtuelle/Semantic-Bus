'use strict';


const bigdataflowModel = require('../models/bigdataflow_model');
const userModel = require('../models/user_model');
const config = require('../getConfiguration.js')();
const sift = require('sift').default;
const Error = require('../helpers/error.js');

// --------------------------------------------------------------------------------
module.exports = {
  create: _create,
  destroy: _destroy,
  update: _update,
  getAll: _get_all,
  getOne: _get_one
};

// --------------------------------------------------------------------------------
async function _create(userId, bigdataflowData) {
  const bigdataflowModelInstance = bigdataflowModel.getInstance().model;
  const bigdataflow = new bigdataflowModelInstance({
    name: bigdataflowData.name,
    description: bigdataflowData.description
  });

  return new Promise((resolve, reject) => {
    bigdataflow.save((err, work) => {
      if (err) {
        throw reject(new Error.DataBaseProcessError(err));
      } else {
        userModel.getInstance().model.findByIdAndUpdate({
          _id: userId
        }, {
          $push: {
            bigdataflow: {
              _id: bigdataflow._id,
              role: 'owner'
            }
          }
        },
        (err, user) => {
          if (err) {
            reject(new Error.DataBaseProcessError(err));
          } else{
            resolve(work);
          }
        }
        );
      }
    });
  });
} // <= _create

// --------------------------------------------------------------------------------
function _destroy(userId, bigdataflowId) {
  return new Promise((resolve, reject) => {
    userModel.getInstance().model.findByIdAndUpdate({
      _id: userId
    }, {
      $pull: {
        bigdataflow: {
          _id: bigdataflow
        }
      }
    },
    (err, user) => {
      if (err) {
        throw TypeError(err);
      } else {
        bigdataflowModel.getInstance().model.find({
          _id: bigdataflowId
        },
        (err, bigdataflow) => {
          if (err) {
            throw TypeError(err);
          }
          else {
            bigdataflowModel.getInstance().model.findOneAndRemove({
              _id: bigdataflowId
            },
            (err) => {
              if (err) {
                throw TypeError(err);
              }
              else {
                resolve(bigdataflow);
              }
            }
            );
          }
        }
        );
      }
    }
    );
  });
} // <= _destroy

// --------------------------------------------------------------------------------

function _get_all(userID, role) {
  return new Promise((resolve, reject) => {
    userModel.getInstance().model
      .findOne({
        _id: userID
      })
      .populate({
        path: 'bigdataflow._id',
        select: 'name description updatedAt'
      })
      .lean()
      .exec(async(_error, data) => {
        data.bigdataflow = data.bigdataflow || [];
        data.bigdataflow = data.bigdataflow.filter(sift({
          _id: {
            $ne: null
          }
        }
        ));
        Array.isArray(data.bigdataflow) ?
          data.bigdataflow = data.bigdataflow.map(r => {
            return {
              bigdataflow: r._id,
              role: r.role
            };
          }) : data.bigdataflow = [];
        const bigdataflows = data.bigdataflow.filter(sift({
          role: role
        }
        )).map(r => r.bigdataflow);


        resolve(bigdataflows);
      });
  });
} // <= _get_all_by_role

// --------------------------------------------------------------------------------

async function _update(bigdataflow) {
  try {
    const bigdataflowUpdated = await bigdataflowModel.getInstance().model
      .findOneAndUpdate({
        _id: bigdataflow._id
      },
      bigdataflow, {
        upsert: true,
        new: true,
        fields: {
          consumption_history: 0
        }
      }
      )
      .lean()
      .exec();
    return bigdataflowUpdated;
  } catch (err) {
    throw new Error.DataBaseProcessError(err);
  }
} // <= _update

// --------------------------------------------------------------------------------
function _get_one(bigdataflow_id) {
  return new Promise((resolve, reject) => {
    bigdataflowModel.getInstance().model.findOne({
      _id: bigdataflow_id
    })
      .then((bigdataflow) => {
        if (bigdataflow == null) {
          return reject(new Error.EntityNotFoundError('bigdataflowModel'));
        }
        resolve(bigdataflow);
      })
      .catch(e => {
        reject(new Error.DataBaseProcessError(e));
      });
  });
} // <= _get_workspace
