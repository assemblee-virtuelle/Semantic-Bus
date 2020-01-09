"use strict";


var bigdataflowModel = require("../models/bigdataflow_model");
var userModel = require("../models/user_model");
var config = require("../getConfiguration.js")();
var sift = require("sift").default;
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

  return new Promise((resolve, reject)=> {
    bigdataflow.save(function (err, work) {
      if (err) {
        throw reject(new Error.DataBaseProcessError(err))
      } else {
        userModel.getInstance().model.findByIdAndUpdate({
            _id: userId
          }, {
            $push: {
              bigdataflow: {
                _id: bigdataflow._id,
                role: "owner"
              }
            }
          },
          function (err, user) {
            if (err){
              reject(new Error.DataBaseProcessError(err));
            } else{
              resolve(work)
            };
          }
        );
      }
    });
  });
} // <= _create

// --------------------------------------------------------------------------------
function _destroy(userId, bigdataflowId) {
  return new Promise((resolve, reject)=> {
    userModel.getInstance().model.findByIdAndUpdate({
        _id: userId
      }, {
        $pull: {
          bigdataflow: {
            _id: bigdataflow
          }
        }
      },
      function (err, user) {
        if (err){
          throw TypeError(err);
        } else {
          bigdataflowModel.getInstance().model.find({
              _id: bigdataflowId
            },
            function (err, bigdataflow) {
              if (err){
                throw TypeError(err);
              }
              else {
                bigdataflowModel.getInstance().model.findOneAndRemove({
                    _id: bigdataflowId
                  },
                  function (err) {
                    if (err){
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
        path: "bigdataflow._id",
        select: "name description updatedAt"
      })
      .lean()
      .exec(async (_error, data) => {
        data.bigdataflow=data.bigdataflow||[];
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
            role: r.role,
          };
        }): data.bigdataflow = [];
        const bigdataflows = data.bigdataflow.filter(sift({
            role: role
          }
        )).map(r => r.bigdataflow);


        resolve(bigdataflows);
      });
  });
} // <= _get_all_by_role

// --------------------------------------------------------------------------------

function _update(bigdataflow) {
  return new Promise(async (resolve, reject) => {
    bigdataflowModel.getInstance().model
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
      .exec((err, bigdataflowUpdated) => {
        if (err) {
          return reject(new Error.DataBaseProcessError(e))
        } else {
          resolve(bigdataflowUpdated);
        }
      });
  });
} // <= _update

// --------------------------------------------------------------------------------
function _get_one(bigdataflow_id) {
  return new Promise(function (resolve, reject) {
    bigdataflowModel.getInstance().model.findOne({
        _id: bigdataflow_id
      })
      .then((bigdataflow) => {
        if (bigdataflow == null) {
          return reject(new Error.EntityNotFoundError('bigdataflowModel'))
        }
        resolve(bigdataflow);
      })
      .catch(e => {
        reject(new Error.DataBaseProcessError(e))
      })
  });
} // <= _get_workspace
