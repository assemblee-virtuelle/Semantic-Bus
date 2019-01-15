'use strict';
var workspaceComponentModel = require('../models/workspace_component_model');
var workspaceModel = require('../models/workspace_model');
var historiqueEndModel = require("../models/historiqueEnd_model");
var historiqueStartModel = require("../models/historiqueStart_model");
var config = require('../../../configuration.js');
var sift = require('sift');
//var workspaceBusiness = require('../../../webServices/workspaceBusiness')

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
      console.log("workspaceComponents error",e);
      reject(e)
    });
  })
}

// --------------------------------------------------------------------------------


function _get(filter) {
  return new Promise(function(resolve, reject) {
    workspaceComponentModel.getInstance().model.findOne(filter)
      .lean().exec(function(err, worksapceComponent) {
        if (err) {
          reject(err)
        } else if (worksapceComponent == null) {
          resolve(undefined);
        } else {
          worksapceComponent.specificData = worksapceComponent.specificData || {}; //protection against empty specificData : corrupt data
          resolve(worksapceComponent);
        }
      });
  })
} // <= _get

// --------------------------------------------------------------------------------

function _get_all(filter) {
  return new Promise(function(resolve, reject) {
    workspaceComponentModel.getInstance().model.find(filter, {
        'consumption_history': 0
      })
      .lean()
      .exec(function(err, workspaceComponents) {
        if (err) {
          reject(err)
        } else {
          workspaceComponents.forEach(c => {
            c.specificData = c.specificData || {}
          }); //protection against empty specificData : corrupt data
          // for (let comp of workspaceComponents) {
          //   if(comp.specificData.transformObject!=undefined && comp.specificData.transformObject.desc!=undefined){
          //     console.log('YYYYYYYYYYYYYYYYY',encodeURI(comp.specificData.transformObject.desc));
          //   }
          // }
          resolve(workspaceComponents);
        }
      });
  })
} // <= _get_all


function _get_all_withConsomation(filter) {
  return new Promise(function(resolve, reject) {
    workspaceComponentModel.getInstance().model.find(filter)
    .lean()
    .exec(function(err, workspaceComponents) {
        if (err) {
          reject(err)
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
          reject(err)
        } else {
          worksapceComponent.specificData = worksapceComponent.specificData || {};
          ////console.log("connectionBefore", worksapceComponent)
          resolve(worksapceComponent);
        }
      });
  })
} // <= _get_connectBefore_connectAfter

// --------------------------------------------------------------------------------

function _update(componentToUpdate) {
  ////console.log('ALLLO',componentToUpdate);
  return new Promise((resolve, reject) => {
    if (config.quietLog != true) {
      ////console.log("update component");
    }
    try {
      //      resolve(componentToUpdate);
      workspaceComponentModel.getInstance().model.findOneAndUpdate({
        _id: componentToUpdate._id
      }, componentToUpdate, {
        upsert: true,
        new: true
      })
      .lean()
      .exec((err, componentUpdated) => {
        if (err) {
          if (config.quietLog != true) {
            ////console.log("update component failed");
          }
          reject(err);
        } else {
          if (config.quietLog != true) {
            //console.log("update component done", componentUpdated);
          }
          ////console.log("in resolve")
          resolve(componentUpdated)
        }
      });
    } catch (e) {
      if (config.quietLog != true) {
        ////console.log('EXCEPTION');
      }
    }
  });

} // <= _update

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
          reject(err != undefined ? err : new Error('no worksapce for this component'));
        } else {
          workspaceComponentModel.getInstance().model.remove({
            _id: componentToDelete._id
          }).exec((err, res) => {
            if (err) {
              reject(err)
            } else {
              workspace.links=sift({$and:[{source:{$ne:componentToDelete._id}},{target:{$ne:componentToDelete._id}}]},workspace.links);
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
  return new Promise((resolve, reject) => {
    historiqueEndModel.getInstance().model.findOne({
        processId: processId,
        componentId: componentId
      })
      .lean()
      .exec((err, historiqueEnd) => {
        if (err) {
          reject(err);
        } else {
          resolve(historiqueEnd);
        }
      })
  })
}
