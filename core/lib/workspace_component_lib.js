'use strict';
var workspaceComponentModel = require('../models/workspace_component_model');
var workspaceModel = require('../models/workspace_model');
var historiqueEndModel = require("../models/historiqueEnd_model");
var sift = require('sift').default;
var fragment_lib = require('./fragment_lib.js');
const Error = require('../helpers/error.js');
const mongoose = require('mongoose');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
  create: _create,
  get: _get,
  update: _update,
  getConnectBeforeConnectAfter: _get_connectBefore_connectAfter,
  get_all_withConsomation: _get_all_withConsomation,
  get_all: _get_all,
  remove: _remove,
  get_component_result: _get_component_result
};

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


function _create(workspaceComponents) {
  return new Promise(function(resolve, reject) {
    var componentArray = workspaceComponents
    if (Array.isArray(workspaceComponents) == false) {
      componentArray = []
      componentArray.push(workspaceComponents)
    }
    workspaceComponentModel.getInstance().model.collection.insertMany(componentArray).then(savedComponents => {
      resolve(savedComponents.ops)
    }).catch(e => {
      return reject(new Error.DataBaseProcessError(e))
    });
  })
}

// --------------------------------------------------------------------------------


function _get(filter) {
  return new Promise(async function(resolve, reject) {
    try {
      const workspaceComponent = await workspaceComponentModel.getInstance().model.findOne(filter).lean().exec();
      if(workspaceComponent == null){
        reject(new Error.EntityNotFoundError('workspaceComponent'))
      } else {
        workspaceComponent.specificData = workspaceComponent.specificData || {};
        resolve(workspaceComponent)
      }

    } catch (error) {
      reject(new Error.DataBaseProcessError(error))
    }
  })
} // <= _get

// --------------------------------------------------------------------------------
function _get_all(filter) {
  return new Promise(async function(resolve, reject) {
      try {
            const workspaceComponents = await workspaceComponentModel.getInstance().model.find(filter, {
              'consumption_history': 0
            })
            .lean()
            .exec();
            workspaceComponents.forEach(c => {
              c.specificData = c.specificData || {}
            });
            resolve(workspaceComponents);
      } catch (error) {
            reject(new Error.DataBaseProcessError(err))
      }
  })
} // <= _get_all

// --------------------------------------------------------------------------------
function _get_all_withConsomation(filter) {
  return new Promise(function(resolve, reject) {
    workspaceComponentModel.getInstance().model.find(filter)
      .lean()
      .exec(function(err, workspaceComponents) {
        if (err) {
          reject(new Error.DataBaseProcessError(err))
        } else {
          workspaceComponents.forEach(c => {
            c.specificData = c.specificData || {}
          }); //protection against empty specificData : corrupt data
          resolve(workspaceComponents);
        }
      });
  })
} // <= _get_all


// --------------------------------------------------------------------------------
function _get_connectBefore_connectAfter(filter) {
  return new Promise(function(resolve, reject) {
    workspaceComponentModel.getInstance().model.findOne(filter, {
        'consumption_history': 0
      })
      .populate('connectionsBefore')
      .populate('connectionsAfter')
      .lean().exec(function(err, worksapceComponent) {
        if (err) {
          reject(new Error.DataBaseProcessError(err))
        } else {
          worksapceComponent.specificData = worksapceComponent.specificData || {};
          resolve(worksapceComponent);
        }
      });
  })
} // <= _get_connectBefore_connectAfter

// --------------------------------------------------------------------------------
function _update(componentToUpdate) {
  return new Promise((resolve, reject) => {
    // console.log('componentToUpdate ----', componentToUpdate)
    // if (componentToUpdate && componentToUpdate.module === "restApiGet" &&
    //   componentToUpdate.specificData &&
    //   componentToUpdate.specificData.url) {
    //   (componentToUpdate.specificData.url = componentToUpdate._id + '-' + componentToUpdate.specificData.url)
    // }
    if (componentToUpdate) {
      workspaceComponentModel.getInstance().model.findOneAndUpdate({
          _id: componentToUpdate._id
        }, componentToUpdate, {
          upsert: true,
          new: true
        })
        .lean()
        .exec((err, componentUpdated) => {
          if (err) {
            reject(new Error.DataBaseProcessError(err))
          } else {
            resolve(componentUpdated)
          }
        });
    }
  });

} // <= _update

// --------------------------------------------------------------------------------

function _remove(componentToDelete) {
  return new Promise((resolve, reject) => {
    //console.log(componentToDelete);
    workspaceModel.getInstance().model.findOne({
        "components": componentToDelete._id
      }, {
        'consumption_history': 0,
      })
      .exec((err, workspace) => {
        if (err || workspace == null) {
          reject(new Error.DataBaseProcessError(err))
        } else {
          workspaceComponentModel.getInstance().model.remove({
            _id: componentToDelete._id
          }).exec((err, res) => {
            if (err) {
              reject(new Error.DataBaseProcessError(err))
            } else {
              workspace.links =workspace.links.filter(sift({
                $and: [{
                  source: {
                    $ne: componentToDelete._id
                  }
                }, {
                  target: {
                    $ne: componentToDelete._id
                  }
                }]
              }));
              workspace.save();
              resolve(componentToDelete);
            }
          })
        }
      });
  });
} // <= remove

// --------------------------------------------------------------------------------
function _get_component_result(componentId, processId) {
  return new Promise(async (resolve, reject) => {
    try {
      const historiqueEnd = await  historiqueEndModel.getInstance().model.findOne({
        processId: processId,
        componentId: componentId
      })
      .lean()
      .exec();
      resolve(historiqueEnd);
    } catch (error) {
      reject(new Error.DataBaseProcessError(error))
    }
    // historiqueEndModel.getInstance().model.findOne({
    //     processId: processId,
    //     componentId: componentId
    //   })
    //   .lean()
    //   .exec(async (err, historiqueEnd) => {
    //     if (err) {
    //       reject(new Error.DataBaseProcessError(err))
    //     } else {
    //       // console.log('historiqueEnd ',historiqueEnd);
    //       // if(historiqueEnd.data._frag){
    //       //   historiqueEnd.data = await fragment_lib.get(historiqueEnd.data._frag);
    //       // }
    //       resolve(historiqueEnd);
    //     }
    //   })
  })
}
