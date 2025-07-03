'use strict';

const fragment_lib = require('./fragment_lib_scylla.js');
const file_lib_scylla = require('./file_lib_scylla.js');
const user_lib = require('./user_lib.js');
const workspaceComponentModel = require('../models/workspace_component_model');
const workspaceModel = require('../models/workspace_model');
// var fragmentModel = require("../models/fragment_model");
const fragmentModel = require('../models/fragments_model_scylla');
const userModel = require('../models/user_model');
const cacheModel = require('../models/cache_model');

// var config = require("../getConfiguration.js")();
const historiqueEndModel = require('../models/historiqueEnd_model');
const processModel = require('../models/process_model');
const sift = require('sift').default;
const graphTraitement = require('../helpers/graph-traitment');
const fetch = require('node-fetch');
const Error = require('../helpers/error.js');
const ObjectID = require('bson').ObjectID;
const { validate: uuidValidate } = require('uuid');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
  create: _create,
  destroy: _destroy,
  update: _update,
  updateSimple: _update_simple,
  getAll: _get_all,
  getWorkspace: _get_workspace,
  get_workspace_simple: _get_workspace_simple,
  get_workspace_graph_data: _get_workspace_graph_data,
  createOrUpdateHistoriqueEnd: _createOrUpdateHistoriqueEnd,
  addDataHistoriqueEnd: _addDataHistoriqueEnd,
  addFragHistoriqueEnd: _addFragHistoriqueEnd,
  createProcess: _createProcess,
  get_process_byWorkflow: _get_process_byWorkflow,
  addConnection: _addConnection,
  removeConnection: _removeConnection,
  cleanOldProcessByWorkflow: _cleanOldProcessByWorkflow,
  markProcessAsResolved: _markProcessAsResolved,
  cleanAllOldProcess: _cleanAllOldProcess,
  cleanGarbage: _cleanGarbage,
  cleanGarbageForgotten: _cleanGarbageForgotten,
  executeAllTimers: _executeAllTimers,
  getCurrentProcess: _getCurrentProcess,
  updateCurrentProcess: _updateCurrentProcess
};

async function _createOrUpdateHistoriqueEnd(historique) {
  if (historique.error != undefined) {
    historique.error = {
      message: historique.error.message
    };
  }

  try {
    const persisted = await historiqueEndModel.getInstance().model.findOneAndUpdate({
      processId: historique.processId,
      componentId: historique.componentId
    }, historique, {
      new: true,
      upsert: true
    }).lean().exec();
    return persisted;
  } catch (e) {
    throw new Error.DataBaseProcessError(e);
  }
}

async function _addDataHistoriqueEnd(historicId, data) {
  try {
    const frag = await fragment_lib.persist(data);
    const result = await historiqueEndModel.getInstance().model.findOneAndUpdate({
      _id: historicId
    }, {
      frag: frag._id.toString()
    }, {
      new: true,
      upsert: true
    }).lean().exec();
    return result;
  } catch (e) {
    console.error(e);
    throw new Error.DataBaseProcessError(e);
  }
}

async function _addFragHistoriqueEnd(historicId, frag) {
  try {
    const result = await historiqueEndModel.getInstance().model.findOneAndUpdate({
      _id: historicId
    }, {
      frag: (frag.id || frag._id).toString()
    }, {
      new: true,
      upsert: true
    }).lean().exec();
    return result;
  } catch (e) {
    console.error(e);
    throw new Error.DataBaseProcessError(e);
  }
}

async function _createProcess(process) {
  const processModelObject = processModel.getInstance().model({
    workflowId: process.workflowId,
    roundDate: process.roundDate,
    ownerId: process.ownerId,
    callerId: process.callerId,
    originComponentId: process.originComponentId,
    steps: process.steps
  });

  try {
    const work = await processModelObject.save();
    return work;
  } catch (error) {
    throw new Error.DataBaseProcessError(error);
  }
}

async function _getCurrentProcess(processId) {
  try {
    const process = await processModel.getInstance().model.findById(processId).lean().exec();
    return process;
  } catch (error) {
    throw new Error.DataBaseProcessError(error);
  }

  // processModel.getInstance().model.findOne(processId, (err, process) => {
  //   if (err) {
  //     reject(new Error.DataBaseProcessError(err))
  //   } else {
  //     resolve(process);
  //   }
  // });
}

async function _updateCurrentProcess(processId, workspaceId, state) {
  if (processId != undefined) {
    await processModel.getInstance().model.findByIdAndUpdate(processId, {
      state
    });
  }
  if (state == 'stop' && workspaceId != undefined) {
    await workspaceModel.getInstance().model.findByIdAndUpdate(workspaceId, {
      status: 'stoped'
    });
  }
  return processId;
}

// --------------------------------------------------------------------------------

// clenGarbage not use fragmentLib.cleanFrag and it is normal. clean gargabe don't have to depend of cleanFrag execution
async function _cleanGarbage() {
  // console.log("_cleanGarbage Normal");

  try {
    // console.log('-------- START normal clean fragment garbage');
    await fragmentModel.deleteManyFragments({
      garbageTag: true
    }, true);
    // console.log('-------- END normal clean fragment garbage');
  } catch (e) {
    throw new Error.DataBaseProcessError(e);
  }
}

async function _cleanGarbageForgotten() {
  await _cleanGarbage();

  // console.log("--- cleanGarbage Forgotten");

  try {
    const workspaces = await workspaceModel.getInstance().model.find({}).lean().exec();
    let totalProcessToRemove = [];
    let totalHistoriqueEndToRemove = [];

    const processGarbageId = Math.floor(Math.random() * 10000);
    // const processGarbageId = 777;

    // const count = await fragmentModel.countDocuments({});
    console.log('--- start tag all fragment as garbage');
    await fragmentModel.updateMultipleFragments({}, { garbageProcess: processGarbageId }, true);
    console.log('--- end tag all fragment as garbage');
    for (const workflow of workspaces) {
      console.log('--- stack data to keep ', workflow.name);
      const {
        keepedProcesses,
        oldProcesses,
        keepedHistoriqueEnds,
        oldHistoriqueEnds
      } = await _getOldProcessAndHistoriqueEnd(workflow);

      let fragsToKeepId = keepedHistoriqueEnds.map(h => h.frag);
      // console.log('Historique frags', keepedHistoriqueEnds.map(h => h.frag))

      const cacheComponents = await workspaceComponentModel.getInstance().model.find({
        module: 'cacheNosql',
        workspaceId: workflow._id
      }).lean().exec();


      const caches = await cacheModel.getInstance().model.find({
        _id: {
          $in: cacheComponents.map(c => c._id)
        }
      }).lean().exec();
        // console.log('caches frags', caches.map(c => c.frag))

      fragsToKeepId = fragsToKeepId.concat(caches.map(c => c.frag));
      fragsToKeepId = fragsToKeepId.filter(id => uuidValidate(id));

      for (const fragId of fragsToKeepId) {
        try {
          const frag = await fragmentModel.getFragmentById(fragId);
          if (frag.rootFrag != undefined && frag.rootFrag != null) {
            await fragmentModel.updateMultipleFragments({
              originFrag: frag.rootFrag
            }, {
              garbageProcess: 0
            });
          }

          await fragmentModel.updateMultipleFragments({
            id: frag.id
          }, {
            garbageProcess: 0
          });
        } catch (e) {
          console.warn('error tag fragment to keep', fragId, e);
        }
      }

      totalHistoriqueEndToRemove = totalHistoriqueEndToRemove.concat(oldHistoriqueEnds.map(h => h._id));
      totalProcessToRemove = totalProcessToRemove.concat(oldProcesses.map(p => p._id));
    }

    // const totalFragmentsBeforeDeletion = await fragmentModel.countDocuments({
    //   garbageProcess: processGarbageId
    // });

    console.log('--- START total fragment garbage collector');
    await fragmentModel.deleteManyFragments({
      garbageProcess: processGarbageId
    }, true);
    console.log('--- END total fragment garbage collector');

    console.log('--- remove garbage historic');
    await historiqueEndModel.getInstance().model.deleteMany({
      _id: {
        $in: totalHistoriqueEndToRemove
      }
    });
    console.log('--- remove garbage process');
    await processModel.getInstance().model.deleteMany({
      _id: {
        $in: totalProcessToRemove
      }
    });

    // console.log(`${allFragKeeped.length} fragments keeped and ${notReferencedFragsCount} fragments removed`);
    // console.log(`${allFragKeeped.length} fragments keeped`);
    console.log(`--- ${totalHistoriqueEndToRemove.length} historic removed`);
    console.log(`--- ${totalProcessToRemove.length} process removed`);

    return workspaces;
  } catch (e) {
    console.error('cleanGarbageForgotten Canceled du to error');
    throw new Error.DataBaseProcessError(e);
  }
}

async function _cleanAllOldProcess() {
  try {
    const workspaces = await workspaceModel.getInstance().model.find({}).lean().exec();
    const keepedProcessesIds = [];
    for (const workflow of workspaces) {
      // console.log(workflow.name);
      const processNormalCleaned = await _cleanOldProcessByWorkflow(workflow);
      // console.log('processNormalCleaned',processNormalCleaned);
      // keepedProcessesIds = keepedProcessIds.concat(processNormalCleaned);
    }

    return workspaces;
  } catch (e) {
    throw new Error(e);
  }
}

async function _executeAllTimers(config) {
  try {
    const cacheComponents = await workspaceComponentModel.getInstance().model.find({
      module: 'timer'
    }).lean().exec();
    // console.log(cacheComponents.length);
    for (const component of cacheComponents) {
      // console.log("component",component);
      const wokspace = await workspaceModel.getInstance().model.findOne({
        _id: component.workspaceId
      }).lean().exec();
      if (wokspace != null) {
        // console.log("wokspace",wokspace.name,'-',wokspace.status);
        // console.log("wokspace",wokspace.name,'-',wokspace.status);
        const execution = await fetch(config.engineUrl + '/work-ask/' + component._id, {
          method: 'POST'
        });
        const result = await execution.text();
        // console.log("result",result);
      } else {
        'orphan timer';
      }
    }
  } catch (e) {
    console.error(e);
    throw new Error.DataBaseProcessError(e);
  }
}

async function _getOldProcessAndHistoriqueEnd(workflow) {
  try {
    const limit = workflow.limitHistoric || 1;
    const allProcesses = await processModel.getInstance().model.find({
      workflowId: workflow._id
    })
      .sort({
        timeStamp: -1
      })
      .select({
        _id: 1,
        state: 1,
        timeStamp: 1
      })
      .lean().exec();

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const keepedProcessesRun = allProcesses.filter(process =>
      process.state === 'run' && new Date(process.timeStamp) > twentyFourHoursAgo
    );
    const keepedProcessesHistoric = allProcesses.filter(process => process.state !== 'run').slice(0, limit);
    const keepedProcesses = keepedProcessesHistoric.concat(keepedProcessesRun);

    // Détermination de oldProcesses
    const oldProcesses = allProcesses.filter(process => !keepedProcesses.some(keeped => keeped._id.equals(process._id)));

    // Nouvelle requête pour déterminer keepedHistoriqueEnds et oldHistoriqueEnds
    const historiqueEnds = await historiqueEndModel.getInstance().model.find({
      processId: {
        $in: allProcesses.map(p => p._id)
      }
    })
      .select({
        _id: 1,
        frag: 1,
        processId: 1
      })
      .lean().exec();

    const keepedHistoriqueEnds = historiqueEnds.filter(h => keepedProcesses.some(p => p._id.equals(h.processId)));
    const oldHistoriqueEnds = historiqueEnds.filter(h => oldProcesses.some(p => p._id.equals(h.processId)));

    return {
      keepedProcesses,
      oldProcesses,
      keepedHistoriqueEnds,
      oldHistoriqueEnds
    };
  } catch (e) {
    throw new Error.DataBaseProcessError(e);
  }
}


async function _cleanOldProcessByWorkflow(workflow) {
  try {
    console.log(`--------- start clean By Workflow ${workflow.name}`);
    const {
      keepedProcesses,
      oldProcesses,
      keepedHistoriqueEnds,
      oldHistoriqueEnds
    } = await _getOldProcessAndHistoriqueEnd(workflow);

    for (const oldHistoriqueEnd of oldHistoriqueEnds) {
      if (oldHistoriqueEnd.frag != undefined) {
        try {
          // console.log('oldHistoriqueEnd',oldHistoriqueEnd)
          // await fragment_lib.displayFragTree(oldHistoriqueEnd.frag)
          // await new Promise(resolve => setTimeout(resolve, 1000));
          // await fragment_lib.tagGarbage(oldHistoriqueEnd.frag);
          await fragment_lib.cleanFrag(oldHistoriqueEnd.frag);
        } catch (e) {
          console.warn('error taging or cleaning garbage', e);
        }
      }
    }
    // console.log(`--------- delete files of old processes`,oldProcesses.map(p=>p._id))
    await file_lib_scylla.deleteMany({
      processId: oldProcesses.map(p => p._id.toString())
    });

    await historiqueEndModel.getInstance().model.deleteMany({
      _id: {
        $in: oldHistoriqueEnds.map(r => r._id)
      }
    }).exec();

    await processModel.getInstance().model.deleteMany({
      _id: {
        $in: oldProcesses.map(r => r._id)
      }
    }).exec();
    console.log(`--------- end clean ${workflow.name}, ${oldHistoriqueEnds.length} historic removed and tag fragment as garbage, ${oldProcesses.length} process removed`);
  } catch (e) {
    throw new Error.DataBaseProcessError(e);
  }
} // <= _cleanOldProcessByWorkflow

async function _markProcessAsResolved(process) {
  try {
    // console.log(`--------- start clean By process`,process)
    const processMongoose = await processModel.getInstance().model.findOne({
      _id: process._id
    }).exec();
    processMongoose.state = 'resolved';
    process = await processMongoose.save();
    return process;
  } catch (e) {
    throw new Error.DataBaseProcessError(e);
  }
} // <= _cleanOldProcess

// --------------------------------------------------------------------------------

async function _get_process_byWorkflow(workflowId) {
  // console.log('--- TRACE 1');

  const workflow = await workspaceModel.getInstance().model.findOne({
    _id: workflowId
  })
    .lean()
    .exec();
  if (workflow == null) {
    throw new Error.EntityNotFoundError('workspaceModel');
  }

  const processes = await processModel.getInstance().model.find({
    workflowId: workflow._id
  }).sort({
    timeStamp: -1
  })
    .limit(workflow.limitHistoric)
    .lean()
    .exec();

  const historicPromises = [];
  for (const process of processes) {
    historicPromises.push((async() => {
      const historiqueEnd = await historiqueEndModel.getInstance().model.find({
        processId: process._id
      }).select({
        data: 0
      }).lean().exec();
      for (const step of process.steps) {
        const historiqueEndFinded = historiqueEnd.filter(sift({
          componentId: step.componentId
        }))[0];
        if (historiqueEndFinded != undefined) {
          if (historiqueEndFinded.error != undefined) {
            step.status = 'error';
          } else {
            step.status = 'resolved';
          }
        } else {
          step.status = 'waiting';
        }
      }
      return process;
    })());
  }

  try {
    const data = await Promise.all(historicPromises);
    return data;
  } catch (e) {
    console.error('--- REJECT ', e);
    throw e;
  }
} // <= _get_process_byWorkflow

// --------------------------------------------------------------------------------

async function _update_simple(workspaceupdate) {
  const workspaceUpdate = await workspaceModel.getInstance().model
    .findOneAndUpdate({
      _id: workspaceupdate._id
    },
    workspaceupdate, {
      upsert: true,
      new: true
    }
    )
    .exec();
  return workspaceUpdate;
} // <= _update_simple

// --------------------------------------------------------------------------------

function check_workspace_data(workspaceData) {
  const workspace_final = workspaceData;
  return new Promise((resolve, reject) => {
    const name = new Promise((resolve, reject) => {
      if (!workspaceData.name) {
        reject(new Error.PropertyValidationError('nom'));
      } else {
        resolve(workspaceData.name);
      }
    });
    const limitHistoric = new Promise((resolve, reject) => {
      if (parseInt(workspaceData.limitHistoric) && parseInt(workspaceData.limitHistoric) > 0) {
        resolve(workspaceData.limitHistoric);
      } else {
        reject(new Error.PropertyValidationError('nombre de process enregistré'));
      }
    });

    Promise.all([name, limitHistoric])
      .then((workspacePromise) => {
        workspace_final['name'] = workspacePromise[0];
        workspace_final['limitHistoric'] = workspacePromise[1];
        resolve(workspace_final);
      })
      .catch((err) => {
        reject(err);
      });
  });
} // <= check_workspace_data
// --------------------------------------------------------------------------------

async function _create(userId, workspaceData) {
  const workspaceDataCheck = await check_workspace_data(workspaceData);

  const user = await userModel.getInstance().model.findByIdAndUpdate({
    _id: userId
  });

  const workspaceModelInstance = workspaceModel.getInstance().model;
  const workspace = new workspaceModelInstance({
    name: workspaceDataCheck.name,
    limitHistoric: workspaceDataCheck.limitHistoric,
    description: workspaceDataCheck.description,
    components: workspaceDataCheck.components[0],
    users: [{
      email: user.credentials.email,
      role: 'owner'
    }]
  });
  const savedWorkspace = await workspace.save();
  return savedWorkspace;
} // <= _create

// --------------------------------------------------------------------------------

async function _destroy(userId, workspaceId) {
  const user = await userModel.getInstance().model.findByIdAndUpdate({
    _id: userId
  }, {
    $pull: {
      workspaces: {
        _id: workspaceId
      }
    }
  });
  const workspace = await workspaceModel.getInstance().model.find({
    _id: workspaceId
  });
  if (workspace[0]) {
    if (
      workspace[0].components != undefined ||
      workspace[0].components != null
    ) {
      workspace[0].components.forEach(async(workspaceComp) => {
        // if (config.quietLog != true) {}
        await workspaceComponentModel.getInstance().model.deleteOne({
          _id: workspaceComp
        });
      });
    }
  }

  await workspaceModel.getInstance().model.findOneAndDelete({
    _id: workspaceId
  });
  return workspace;
} // <= _destroy

// --------------------------------------------------------------------------------

async function _get_all(userID, role, config) {
  // let data = await  userModel.getInstance().model
  // .findOne({
  //   _id: userID
  // })
  // // .populate({
  // //   path: "workspaces._id",
  // //   select: "name description updatedAt status"
  // // })
  // .lean()
  // .exec();

  const data = await user_lib.getWithRelations(userID, config);

  if (!data) {
    throw new Error.EntityNotFoundError(`user ${userID} not exists`);
  } else {
    let workspaces;

    if (data.admin) {
      workspaces = await workspaceModel.getInstance().model.find({}).lean().exec();
      workspaces = workspaces.map(w => ({
        ...w,
        role: 'admin'
      }));
    } else {
      const InversRelationWorkspaces = await workspaceModel.getInstance().model.find({
        'users.email': data.credentials.email
      }).lean().exec();
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

      if (role) {
        workspaces = data.workspaces.filter(w => w.role === role);
      } else {
        workspaces = [...data.workspaces];
      }
      workspaces = workspaces.map(w => ({
        ...w.workspace,
        role: w.role
      }));
    }


    const ProcessPromiseArray = [];

    workspaces.forEach((workspace) => {
      const ProcessPromise = (async() => {
        // console.log('workspace',workspace);
        if (workspace.status == undefined) {
          const processes = await processModel.getInstance().model.find({
            workflowId: workspace._id
          }).sort({
            timeStamp: -1
          })
            .limit(1)
            .lean()
            .exec();

          if (processes[0]) {
            const historiqueEnd = await historiqueEndModel.getInstance().model.find({
              processId: processes[0]._id
            }).select({
              data: 0
            }).lean().exec();
            for (const step of processes[0].steps) {
              const historiqueEndFinded = historiqueEnd.filter(sift({
                componentId: step.componentId
              }))[0];

              if (processes[0].state === 'stop') {
                workspace.status = 'stoped';
                break;
              } else {
                if (historiqueEndFinded != undefined) {
                  if (historiqueEndFinded.error != undefined) {
                    workspace.status = 'error';
                    break;
                  } else {
                    workspace.status = 'resolved';
                  }
                } else {
                  workspace.status = 'running';
                }
              }
            }
            this.updateSimple(workspace);
            return workspace;
          } else {
            workspace.status = 'no-start';
            this.updateSimple(workspace);
            return workspace;
          }
        } else {
          return workspace;
        }
      })();
      ProcessPromiseArray.push(ProcessPromise);
    });

    await Promise.all(ProcessPromiseArray);

    return workspaces;
  }
} // <= _get_all_by_role

// --------------------------------------------------------------------------------

function _update(workspace) {
  return new Promise((resolve, reject) => {
    _update_mainprocess(workspace)
      .then((data) => {
        resolve(data);
      })
      .catch(e => {
        reject(e);
      });
  });
} // <= _update

async function _update_mainprocess(preData) {
  let workspaceCheck;
  try {
    workspaceCheck = await check_workspace_data(preData);
  } catch (e) {
    console.log(e);
    throw e;
  }
  // console.log(workspaceCheck)
  const componentUpdated = await workspaceModel.getInstance().model
    .findOneAndUpdate({
      _id: workspaceCheck._id
    },
    workspaceCheck, {
      upsert: true,
      new: true,
      fields: {
        consumption_history: 0
      }
    }
    )
    .populate({
      path: 'components',
      select: '-consumption_history'
    })
    .lean()
    .exec();

  return componentUpdated;
} // <= _update_mainprocess

// --------------------------------------------------------------------------------
function _get_workspace_simple(workspace_id) {
  return new Promise((resolve, reject) => {
    workspaceModel.getInstance().model.findOne({
      _id: workspace_id
    })
      .then((workspace) => {
        if (workspace == null) {
          return reject(new Error.EntityNotFoundError('workspaceModel'));
        }
        resolve(workspace);
      })
      .catch(e => {
        reject(new Error.DataBaseProcessError(e));
      });
  });
} // <= _get_workspace

// --------------------------------------------------------------------------------

function _get_workspace(workspace_id) {
  // console.log("get workspace", workspace_id)
  return new Promise((resolve, reject) => {
    // TODO : review model decalration architecture
    // TODO : conception error if getInstance isn't call, schema is not register
    workspaceComponentModel.getInstance();
    let workspace;
    workspaceModel.getInstance().model.findOne({
      _id: workspace_id
    }, {
      consumption_history: 0
    })
      .populate({
        path: 'components',
        select: '-consumption_history',
        model: workspaceComponentModel.getInstance().model // TODO cit is connection.model inside  workspaceComponentModel which declare model to Mpngoose, no this affectation : CF previus TODO
      })
      .lean()
      .exec()
      .then(async(workspaceIn) => {
        // console.log('workspaceIn',workspaceIn);
        if (workspaceIn == null) {
          return reject(new Error.EntityNotFoundError('workspaceModel'));
        }
        workspace = workspaceIn;
        // protection against broken link and empty specificData : corrupt data
        workspace.components = workspace.components.filter(sift({
          $ne: null
        })).map(c => {
          c.specificData = c.specificData || {};
          return c;
        });

        const componentsId = workspace.components.map(c => c._id);
        workspace.links = workspace.links.filter(sift({
          $and: [{
            source: {
              $in: componentsId
            }
          }, {
            target: {
              $in: componentsId
            }
          }]
        }));

        const ProcessPromise = (async() => {
          if (workspace.status != undefined) {
            return workspace;
          } else {
            const processes = await processModel.getInstance().model.find({
              workflowId: workspace._id
            }).sort({
              timeStamp: -1
            })
              .limit(1)
              .lean()
              .exec();
            if (processes[0]) {
              const historiqueEnd = await historiqueEndModel.getInstance().model.find({
                processId: processes[0]._id
              }).select({
                data: 0
              }).lean().exec();

              for (const step of processes[0].steps) {
                const historiqueEndFinded = historiqueEnd.filter(sift({
                  componentId: step.componentId
                }))[0];

                if (processes[0].state === 'stop') {
                  workspace.status = 'stoped';
                } else {
                  if (historiqueEndFinded != undefined) {
                    if (historiqueEndFinded.error != undefined) {
                      workspace.status = 'error';
                      return workspace;
                    } else {
                      workspace.status = 'resolved';
                    }
                  } else {
                    workspace.status = 'running';
                  }
                }
              }

              return workspace;
            } else {
              workspace.status = 'no-start';
              return workspace;
            }
          }
        })();
        await ProcessPromise;
        resolve(workspace);
      })
      .catch(e => {
        reject(new Error.DataBaseProcessError(e));
      });
  });
} // <= _get_workspace

// --------------------------------------------------------------------------------

async function _get_workspace_graph_data(workspaceId) {
  const result = await historiqueEndModel.getInstance().model.aggregate(
    [{
      $match: {
        workflowId: workspaceId
      }
    },
    {
      $group: {
        _id: {
          workflowComponentId: '$workflowComponentId',
          roundDate: '$roundDate'
        },
        totalPrice: {
          $sum: '$recordPrice'
        },
        totalMo: {
          $sum: '$moCount'
        },
        components: {
          $push: '$$ROOT'
        }
      }
    }
    ]);
  try {
    const graph = graphTraitement.formatDataWorkspaceGraph(result);
    return graph;
  } catch (e) {
    throw new Error.InternalProcessError(e);
  }
} // <= _get_workspace_graph_data

// --------------------------------------------------------------------------------

function _addConnection(workspaceId, source, target, input) {
  // needed to ensure mongoose model loaded
  workspaceComponentModel.getInstance();
  return new Promise((resolve, reject) => {
    workspaceModel.getInstance().model.findOne({
      _id: workspaceId
    }).then(workspace => {
      if (workspace == null) {
        return reject(new Error.EntityNotFoundError('workspaceModel'));
      }
      // console.log('input',input)
      workspace.links.push({
        source: source,
        target: target,
        targetInput: input
      });
      // console.log('workspace add connection',workspace)
      return workspaceModel.getInstance().model.findOneAndUpdate({
        _id: workspace._id
      },
      workspace, {
        new: true
      }
      ).populate({
        path: 'components',
        select: '-consumption_history'
      }).lean()
        .exec();
    }).then(workspaceUpdate => {
      resolve(workspaceUpdate.links);
    }).catch(e => {
      reject(new Error.DataBaseProcessError(e));
    });
  });
} // <= _addConnection

// --------------------------------------------------------------------------------

function _removeConnection(workspaceId, linkId) {
  workspaceComponentModel.getInstance();
  return new Promise((resolve, reject) => {
    // console.log('removeConnection',workspaceId, linkId)
    workspaceModel.getInstance().model.findOne({
      _id: workspaceId
    }).then(workspace => {
      // console.log('workspace',workspace)
      if (workspace == null) {
        return reject(new Error.EntityNotFoundError('workspaceModel'));
      }
      // console.log('workspace.links',workspace.links)
      const targetLink = workspace.links.filter(sift({
        _id: linkId
      }))[0];
      // console.log('targetLink',targetLink)
      if (targetLink != undefined) {
        workspace.links.splice(workspace.links.indexOf(targetLink), 1);
        return workspaceModel.getInstance().model.findOneAndUpdate({
          _id: workspace._id
        },
        workspace, {
          new: true
        }
        ).populate({
          path: 'components',
          select: '-consumption_history'
        })
          .lean()
          .exec();
      } else {
        reject(new Error.EntityNotFoundError('WorkspaceComponent'));
      }
    }).then(workspaceUpdate => {
      resolve(workspaceUpdate.links);
    }).catch(e => {
      console.log('error', e);
      return reject(new Error.DataBaseProcessError(e));
    });
  });
} // <= _removeConnection

// --------------------------------------------------------------------------------

