'use strict';
const workspaceComponentModel = require('../models/workspace_component_model');
const workspaceModel = require('../models/workspace_model');
const historiqueEndModel = require('../models/historiqueEnd_model');
const sift = require('sift').default;
// var fragment_lib = require('./fragment_lib.js');
const Error = require('../helpers/error.js');
// const mongoose = require('mongoose');

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


async function _create(workspaceComponents) {
  const componentArray = Array.isArray(workspaceComponents) ? workspaceComponents : [workspaceComponents];
  const out = [];
  for (const component of componentArray ) {
    let newComponent = new (workspaceComponentModel.getInstance().model)(component);
    newComponent = await newComponent.save();
    // const workspace = await workspaceModel.getInstance().model.findOne({_id:component.workspaceId});
    // workspace.components.push(newComponent._id);
    // await workspace.save();
    out.push(newComponent);
  }
  return out;
}

// --------------------------------------------------------------------------------


async function _get(filter) {
  try {
    const workspaceComponent = await workspaceComponentModel.getInstance().model.findOne(filter).lean().exec();
    if(workspaceComponent == null) {
      throw new Error.EntityNotFoundError('workspaceComponent');
    } else {
      workspaceComponent.specificData = workspaceComponent.specificData || {};
      return workspaceComponent;
    }
  } catch (error) {
    if (error instanceof Error.EntityNotFoundError) {
      throw error;
    }
    throw new Error.DataBaseProcessError(error);
  }
} // <= _get

// --------------------------------------------------------------------------------
async function _get_all(filter) {
  try {
    const workspaceComponents = await workspaceComponentModel.getInstance().model.find(filter, {
      'consumption_history': 0
    })
      .lean()
      .exec();
    workspaceComponents.forEach(c => {
      c.specificData = c.specificData || {};
    });
    return workspaceComponents;
  } catch (error) {
    throw new Error.DataBaseProcessError(error);
  }
} // <= _get_all

// --------------------------------------------------------------------------------
function _get_all_withConsomation(filter) {
  return new Promise((resolve, reject) => {
    workspaceComponentModel.getInstance().model.find(filter)
      .lean()
      .exec()
      .then(workspaceComponents => {
        workspaceComponents.forEach(c => {
          c.specificData = c.specificData || {};
        });
        resolve(workspaceComponents);
      })
      .catch(err => {
        reject(new Error.DataBaseProcessError(err));
      });
  });
}


// --------------------------------------------------------------------------------
function _get_connectBefore_connectAfter(filter) {
  return new Promise((resolve, reject) => {
    workspaceComponentModel.getInstance().model.findOne(filter, {
      'consumption_history': 0
    })
      .populate('connectionsBefore')
      .populate('connectionsAfter')
      .lean().exec((err, worksapceComponent) => {
        if (err) {
          reject(new Error.DataBaseProcessError(err));
        } else {
          worksapceComponent.specificData = worksapceComponent.specificData || {};
          resolve(worksapceComponent);
        }
      });
  });
} // <= _get_connectBefore_connectAfter

// --------------------------------------------------------------------------------
async function _update(componentToUpdate) {
  if (componentToUpdate) {
    // console.log('componentToUpdate', componentToUpdate);
    const componentUpdated = await workspaceComponentModel.getInstance().model.findOneAndUpdate({
      _id: componentToUpdate._id
    }, componentToUpdate, {
      upsert: true,
      new: true
    })
      .lean()
      .exec();
    // console.log('componentUpdated', componentUpdated);
    return componentUpdated;
  }
} // <= _update

// --------------------------------------------------------------------------------

async function _remove(componentToDelete) {
  const component = await workspaceComponentModel.getInstance().model.findOne({
    _id: componentToDelete._id
  }).exec();
  const workspace = await workspaceModel.getInstance().model.findOne({
    _id: component.workspaceId
  }, {
    'consumption_history': 0
  })
    .exec();
  if (workspace) {
    const res = await workspaceComponentModel.getInstance().model.deleteOne({
      _id: componentToDelete._id
    }).exec();


    workspace.links = workspace.links.filter(sift({
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
    await workspace.save();
    return componentToDelete;
  } else {
    throw new Error.DataBaseProcessError('workflow not finded');
  }
} // <= remove

// --------------------------------------------------------------------------------
async function _get_component_result(componentId, processId) {
  try {
    const historiqueEnd = await historiqueEndModel.getInstance().model.findOne({
      processId: processId,
      componentId: componentId
    })
      .lean()
      .exec();
    return historiqueEnd;
  } catch (error) {
    throw new Error.DataBaseProcessError(error);
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
}
