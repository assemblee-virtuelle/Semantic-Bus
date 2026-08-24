'use strict';
const workspaceComponentModel = require('../models/workspace_component_model');
const workspaceModel = require('../models/workspace_model');
const historiqueEndModel = require('../models/historiqueEnd_model');
// var fragment_lib = require('./fragment_lib.js');
const Error = require('../helpers/error.js');
const { validateSpecificData } = require('./specificDataValidator.js');
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
  get_component_result: _get_component_result,
  assertComponentInWorkspace: _assertComponentInWorkspace
};

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


async function _create(workspaceComponents) {
  const componentArray = Array.isArray(workspaceComponents) ? workspaceComponents : [workspaceComponents];
  const out = [];
  for (const component of componentArray ) {
    // SÉCURITÉ : sanitise le specificData à l'écriture (retrait clés dangereuses
    // __proto__/constructor/prototype + getters, profondeur/size bornées).
    if (component && component.specificData !== undefined) {
      component.specificData = validateSpecificData(component.specificData);
    }
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
    // SÉCURITÉ : sanitise le specificData à l'écriture (comme à la création).
    if (componentToUpdate.specificData !== undefined) {
      componentToUpdate.specificData = validateSpecificData(componentToUpdate.specificData);
    }
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

// SÉCURITÉ : vérifie qu'un composant appartient bien au workspace autorisé.
// Utilisé par les routes PUT/DELETE /workspaces/:id/components pour empêcher
// un confused deputy (autoriser sur req.params.id, écrire sur un body._id d'un
// autre workspace). Lève une erreur si le composant n'existe pas ou n'appartient
// pas au workspace donné.
async function _assertComponentInWorkspace(componentId, workspaceId) {
  if (!componentId) {
    const err = new global.Error('component_not_found');
    err.status = 404;
    throw err;
  }
  const component = await workspaceComponentModel.getInstance().model
    .findOne({ _id: componentId })
    .select('workspaceId')
    .lean()
    .exec();
  if (!component) {
    const err = new global.Error('component_not_found');
    err.status = 404;
    throw err;
  }
  if (component.workspaceId && component.workspaceId.toString() !== workspaceId.toString()) {
    const err = new global.Error('component_not_in_workspace');
    err.status = 403;
    throw err;
  }
  return component;
} // <= _assertComponentInWorkspace

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

  // Delete the component
  await workspaceComponentModel.getInstance().model.deleteOne({
    _id: componentToDelete._id
  }).exec();

  // Clean workspace links if workspace exists
  if (workspace) {
    const deletedId = componentToDelete._id.toString();
    workspace.links = workspace.links.filter(l => !(l.source && l.source.toString() === deletedId) && !(l.target && l.target.toString() === deletedId));
    await workspace.save();
  } else {
    console.log(`Orphan component ${componentToDelete._id} removed (workspace not found)`);
  }

  return componentToDelete;
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
