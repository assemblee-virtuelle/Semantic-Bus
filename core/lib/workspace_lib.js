"use strict";

var fragment_lib = require('./fragment_lib.js');
var workspaceComponentModel = require("../models/workspace_component_model");
var workspaceModel = require("../models/workspace_model");
var fragmentModel = require("../models/fragment_model");
var userModel = require("../models/user_model");
var cacheModel = require("../models/cache_model");

// var config = require("../getConfiguration.js")();
var historiqueEndModel = require("../models/historiqueEnd_model");
var processModel = require("../models/process_model");
var sift = require("sift").default;
var graphTraitement = require("../helpers/graph-traitment");
var fetch = require('node-fetch');
const Error = require('../helpers/error.js');
const { log } = require('console');
const ObjectID = require('bson').ObjectID;

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

function _createOrUpdateHistoriqueEnd(historique) {
  return new Promise(async (resolve, reject) => {
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
      resolve(persisted);
    } catch (e) {
      reject(new Error.DataBaseProcessError(e));
    }
  });
} 

function _addDataHistoriqueEnd(historicId, data) {
  return new Promise(async (resolve, reject) => {
    let frag;
    try {
      frag = await fragment_lib.persist(data);
      const result = await historiqueEndModel.getInstance().model.findOneAndUpdate({
        _id: historicId
      }, {
        frag: frag._id.toString()
      }, {
        new: true,
        upsert: true
      }).lean().exec();
      resolve(result);
    } catch (e) {
      console.error(e);
      reject(new Error.DataBaseProcessError(e));
    }
  });
}

function _addFragHistoriqueEnd(historicId, frag) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await historiqueEndModel.getInstance().model.findOneAndUpdate({
        _id: historicId
      }, {
        frag: frag._id.toString()
      }, {
        new: true,
        upsert: true
      }).lean().exec();
      resolve(result);
    } catch (e) {
      console.error(e);
      reject(new Error.DataBaseProcessError(e))
    }
  });
}

function _createProcess(process) {
  var processModelObject = processModel.getInstance().model({
    workflowId: process.workflowId,
    roundDate: process.roundDate,
    ownerId: process.ownerId,
    callerId: process.callerId,
    originComponentId: process.originComponentId,
    steps: process.steps
  });

  return new Promise(async (resolve, reject) => {
    try {
      const work = await processModelObject.save();
      resolve(work);
    } catch (error) {
      reject(new Error.DataBaseProcessError(error));
    }
  });
}

function _getCurrentProcess(processId) {
  return new Promise(async (resolve, reject) => {
    try {
      const process = await processModel.getInstance().model.findById(processId).lean().exec();
      resolve(process);
    } catch (error) {
      reject(new Error.DataBaseProcessError(error));
    }

    // processModel.getInstance().model.findOne(processId, (err, process) => {
    //   if (err) {
    //     reject(new Error.DataBaseProcessError(err))
    //   } else {
    //     resolve(process);
    //   }
    // });
  });
}

function _updateCurrentProcess(processId, workspaceId, state) {
  return new Promise(async (resolve, reject) => {
    try {
      if (processId != undefined) {
        await processModel.getInstance().model.findByIdAndUpdate(processId, {
          state
        });
      }
      if (state == "stop" && workspaceId != undefined) {
        await workspaceModel.getInstance().model.findByIdAndUpdate(workspaceId, {
          status: "stoped"
        });
      }
      resolve(processId);
    } catch (error) {
      reject(error);
    }
  });
}

// --------------------------------------------------------------------------------

// clenGarbage not use fragmentLib.cleanFrag and it is normal. clean gargabe don't have to depend of cleanFrag execution
function _cleanGarbage() {
  return new Promise(async (resolve, reject) => {
    // console.log("_cleanGarbage Normal");

    try {
      console.log('-------- START normal clean fragment garbage');
      await fragmentModel.getInstance().model.deleteMany({
        garbageTag: 1
      });
      console.log('-------- END normal clean fragment garbage');
    } catch (e) {
      reject(new Error.DataBaseProcessError(e));
    }
    resolve();
  });
}

function _cleanGarbageForgotten() {
  return new Promise(async (resolve, reject) => {
    await _cleanGarbage();

    console.log("_cleanGarbage Forgotten");

    try {
      const workspaces = await workspaceModel.getInstance().model.find({}).lean().exec();
      let totalProcessToRemove = [];
      let totalHistoriqueEndToRemove = [];

      const processGarbageId = Math.floor(Math.random() * 10000);

      await fragmentModel.getInstance().model.updateMany({}, { garbageProcess: processGarbageId });
      for (var workflow of workspaces) {
        console.log("stack data to keep ", workflow.name);
        const {
          keepedProcesses,
          oldProcesses,
          keepedHistoriqueEnds,
          oldHistoriqueEnds
        } = await _getOldProcessAndHistoriqueEnd(workflow);

        let fragsToKeepId = keepedHistoriqueEnds.map(h => h.frag);

        const cacheComponents = await workspaceComponentModel.getInstance().model.find({
          module: "cacheNosql",
          workspaceId: workflow._id
        }).lean().exec();

        const caches = await cacheModel.getInstance().model.find({
          _id: {
            $in: cacheComponents.map(c => c._id)
          },
        }).lean().exec();

        fragsToKeepId = fragsToKeepId.concat(caches.map(c => c.frag));

        const fragsToKeep = await fragmentModel.getInstance().model.find({
          _id: {
            $in: fragsToKeepId
          }
        }).select({
          frags: 1,
          rootFrag: 1,
          _id: 1
        }).lean().exec();

        for (let frag of fragsToKeep) {
          await fragmentModel.getInstance().model.updateMany({
            frags: {
              $in: frag.frags
            }
          }, {
            garbageProcess: 0
          });

          await fragmentModel.getInstance().model.updateMany({
            originFrag: frag.rootFrag
          }, {
            garbageProcess: 0
          });

          await fragmentModel.getInstance().model.updateMany({
            _id: frag._id
          }, {
            garbageProcess: 0
          });
        }

        totalHistoriqueEndToRemove=totalHistoriqueEndToRemove.concat(oldHistoriqueEnds.map(h=>h._id));

        totalProcessToRemove=totalProcessToRemove.concat(oldProcesses.map(p=>p._id));

      }

      console.log('START total fragment garbage collector');
      await fragmentModel.getInstance().model.deleteMany({
        garbageProcess: processGarbageId
      })
      console.log('END total fragment garbage collector');
      
      console.log('remove garbage historic')
      await historiqueEndModel.getInstance().model.deleteMany({
        _id: {
          $in: totalHistoriqueEndToRemove
        }
      })
      console.log('remove garbage process')
      await processModel.getInstance().model.deleteMany({
        _id: {
          $in: totalProcessToRemove
        }
      })

      // console.log(`${allFragKeeped.length} fragments keeped and ${notReferencedFragsCount} fragments removed`);
      // console.log(`${allFragKeeped.length} fragments keeped`);
      console.log(`${totalHistoriqueEndToRemove.length} historic removed`);
      console.log(`${totalProcessToRemove.length} process removed`);

      resolve(workspaces);
    } catch (e) {
      reject(new Error.DataBaseProcessError(e))
    }
  });
}

function _cleanAllOldProcess() {
  return new Promise(async (resolve, reject) => {
    const workspaces = await workspaceModel.getInstance().model.find({}).lean().exec();
    let keepedProcessesIds = [];
    for (var workflow of workspaces) {
      // console.log(workflow.name);
      const processNormalCleaned = await _cleanOldProcessByWorkflow(workflow);
      // console.log('processNormalCleaned',processNormalCleaned);
      // keepedProcessesIds = keepedProcessIds.concat(processNormalCleaned);
    }

    resolve(workspaces);
  }).catch(e => {
    reject(new Error(e))
  })
}

function _executeAllTimers(config) {
  return new Promise(async (resolve, reject) => {

    try {
      const cacheComponents = await workspaceComponentModel.getInstance().model.find({
        module: "timer"
      }).lean().exec();
      // console.log(cacheComponents.length);
      for (var component of cacheComponents) {
        // console.log("component",component);
        const wokspace = await workspaceModel.getInstance().model.findOne({
          _id: component.workspaceId
        }).lean().exec();
        if (wokspace != null) {
          // console.log("wokspace",wokspace.name,'-',wokspace.status);
          const execution = await fetch(config.engineUrl + '/work-ask/' + component._id, {
            method: 'POST'
          })
          const result = await execution.text();
          // console.log("result",result);
        } else {
          'orphan timer'
        }

      }

      resolve();

    } catch (e) {
      console.error(e);
      reject(new Error.DataBaseProcessError(e))
    }
  });
}

function _getOldProcessAndHistoriqueEnd(workflow) {
  return new Promise(async (resolve, reject) => {
    try {
      let limit = workflow.limitHistoric || 1;
      let keepedProcesses = await processModel.getInstance().model.find({
          workflowId: workflow._id,
          state :{'$eq':'run'}
        })
        .sort({
          timeStamp: -1
        })
        .limit(limit)
        .select({
          _id: 1
        })
        .lean().exec();
      let oldProcesses = await processModel.getInstance().model.find({
          workflowId: workflow._id,
          _id: {
            $nin: keepedProcesses.map(p => p._id)
          }
        })
        .select({
          _id: 1
        })
        .lean().exec();

      let keepedHistoriqueEnds = await historiqueEndModel.getInstance().model.find({
          processId: {
            $in: keepedProcesses.map(p => p._id)
          }
        })
        .select({
          _id: 1,
          frag: 1
        }).lean().exec();

      let oldHistoriqueEnds = await historiqueEndModel.getInstance().model.find({
          processId: {
            $in: oldProcesses.map(p => p._id)
          }
        })
        .select({
          _id: 1,
          frag: 1
        }).lean().exec();

      resolve({
        keepedProcesses,
        oldProcesses,
        keepedHistoriqueEnds,
        oldHistoriqueEnds
      })
    } catch (e) {
      reject(new Error.DataBaseProcessError(e))
    }

  });
}



function _cleanOldProcessByWorkflow(workflow) {
  return new Promise(async (resolve, reject) => {
    try {
      // console.log(`--------- start clean By Workflow ${workflow.name}`)
      const {
        keepedProcesses,
        oldProcesses,
        keepedHistoriqueEnds,
        oldHistoriqueEnds
      } = await _getOldProcessAndHistoriqueEnd(workflow);
      // console.log('------------oldProcesses.length)',oldProcesses.length);
      // for (let oldProcess of oldProcesses){
      //   await _markProcessAsResolved(oldProcess)
      // }
      // console.log(`--------- end clean By Workflow ${workflow.name}`)

      for (let oldHistoriqueEnd of oldHistoriqueEnds){
        await fragment_lib.tagGarbage(oldHistoriqueEnd.frag);
      }

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
      console.log(`--------- end clean ${workflow.name}, ${oldHistoriqueEnds.length} historic removed and tag fragment as garbage, ${oldProcesses.length} process removed`)
      resolve()
    } catch (e) {
      reject(new Error.DataBaseProcessError(e))
    }
  })
} // <= _cleanOldProcessByWorkflow

function _markProcessAsResolved(process) {
  return new Promise(async (resolve, reject) => {
    try {
      // console.log(`--------- start clean By process`,process)
      const processMongoose = await processModel.getInstance().model.findOne({
        _id: process._id
      }).exec();
      processMongoose.state='resolved';
      process = await processMongoose.save();
      resolve(process);
    } catch (e) {
      reject(new Error.DataBaseProcessError(e))
    }
  })
} // <= _cleanOldProcess

// --------------------------------------------------------------------------------

function _get_process_byWorkflow(workflowId) {
  return new Promise(async (resolve, reject) => {
    // console.log('--- TRACE 1');

    let workflow = await    workspaceModel.getInstance().model.findOne({
      _id: workflowId
    })
    .lean()
    .exec();
    if (workflow == null) {
      return reject(new Error.EntityNotFoundError('workspaceModel'))
    }

    let processes = await processModel.getInstance().model.find({
      workflowId: workflow._id
    }).sort({
      timeStamp: -1
    })
    .limit(workflow.limitHistoric)
    .lean()
    .exec();
    let historicPromises = [];
    for (let process of processes) {
      historicPromises.push(new Promise(async (resolve, reject) => {

        let historiqueEnd = await  historiqueEndModel.getInstance().model.find({
          processId: process._id
        }).select({
          data: 0
        }).lean().exec();
        for (let step of process.steps) {
          let historiqueEndFinded = historiqueEnd.filter(sift({
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
        resolve(process);
      }));
    }
    Promise.all(historicPromises).then(data => {
      resolve(data)
    }).catch(e => {
      console.error('--- REJECT ', e);
      reject(e);
    })
  })
} // <= _get_process_byWorkflow

// --------------------------------------------------------------------------------

function _update_simple(workspaceupdate) {
  return new Promise(async (resolve, reject) => {
    try {
      const workspaceUpdate = await  workspaceModel.getInstance().model
      .findOneAndUpdate({
          _id: workspaceupdate._id
        },
        workspaceupdate, {
          upsert: true,
          new: true
        }
      )
      .exec();
      resolve(workspaceUpdate);
    } catch (error) {
      reject(error);
    }
  });
} // <= _update_simple

// --------------------------------------------------------------------------------

function check_workspace_data(workspaceData) {
  let workspace_final = workspaceData;
  return new Promise(function(resolve, reject) {
    let name = new Promise(function(resolve, reject) {
      if (!workspaceData.name) {
        reject(new Error.PropertyValidationError('nom'))
      } else {
        resolve(workspaceData.name)
      }
    });
    let limitHistoric = new Promise(function(resolve, reject) {
      if (parseInt(workspaceData.limitHistoric) && parseInt(workspaceData.limitHistoric) > 0) {
        resolve(workspaceData.limitHistoric)
      } else {
        reject(new Error.PropertyValidationError('nombre de process enregistré'))
      }
    });

    Promise.all([name, limitHistoric])
      .then((workspacePromise) => {
        workspace_final["name"] = workspacePromise[0];
        workspace_final["limitHistoric"] = workspacePromise[1];
        resolve(workspace_final);
      })
      .catch((err) => {
        reject(err);
      });
  });
} // <= check_workspace_data
// --------------------------------------------------------------------------------

async function _create(userId, workspaceData) {
  let workspaceDataCheck
  try {
    workspaceDataCheck = await check_workspace_data(workspaceData)
  } catch (e) {
    throw e;
  }

  return new Promise(async function(resolve, reject) {
    try {
      const user =  await userModel.getInstance().model.findByIdAndUpdate({
        _id: userId
      });
  
      const workspaceModelInstance = workspaceModel.getInstance().model;
      let workspace = new workspaceModelInstance({
        name: workspaceDataCheck.name,
        limitHistoric: workspaceDataCheck.limitHistoric,
        description: workspaceDataCheck.description,
        components: workspaceDataCheck.components[0],
        users :[{
          email:user.credentials.email,
          role:'owner'
        }]
      });
      const savedWorkspace = await workspace.save();
      resolve(savedWorkspace);
    } catch (error) {
      reject(error)
    }


  });
} // <= _create

// --------------------------------------------------------------------------------

function _destroy(userId, workspaceId) {
  return new Promise(async function(resolve, reject) {
    try {
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
          workspace[0].components.forEach(async function(workspaceComp) {
            // if (config.quietLog != true) {}
            await workspaceComponentModel.getInstance().model.deleteOne({
              _id: workspaceComp
            })
          });
        }
      }
  
      await workspaceModel.getInstance().model.findOneAndRemove({
        _id: workspaceId
      });
      resolve(workspace); 
    } catch (error) {
      reject(error)
    }

  });
} // <= _destroy

// --------------------------------------------------------------------------------

function _get_all(userID, role) {
  return new Promise(async (resolve, reject) => {


    let data = await  userModel.getInstance().model
    .findOne({
      _id: userID
    })
    // .populate({
    //   path: "workspaces._id",
    //   select: "name description updatedAt status"
    // })
    .lean()
    .exec();

    if (!data) {
      reject(new Error.EntityNotFoundError(`user ${userID} not exists`))
    } else {
      const InversRelationWorkspaces = await workspaceModel.getInstance().model.find({
        "users.email":data.credentials.email
      }).lean().exec();
      data.workspaces=InversRelationWorkspaces;
      data.workspaces = data.workspaces.filter(sift({
        _id: {
          $ne: null
        }
      }));
      data.workspaces = data.workspaces.map(w => {
        const userOfWorkspace = w.users.find(u=>u.email===data.credentials.email);
        // console.log("XXXX workspace",w)
        return {
          workspace: w,
          role: userOfWorkspace.role
        };
      });
      let workspaces;
      if(role){
        workspaces= data.workspaces.filter(w=>w.role===role);
      }else{
        workspaces=[...data.workspaces];
      }
      workspaces=workspaces.map(w=>({
        ...w.workspace,
        role:w.role
      }));

      const ProcessPromiseArray = [];

      workspaces.forEach((workspace) => {
        const ProcessPromise = new Promise(async (resolve, reject) => {
          // console.log('workspace',workspace);
          if (workspace.status == undefined) {


            let processes= await processModel.getInstance().model.find({
              workflowId: workspace._id
            }).sort({
              timeStamp: -1
            })
            .limit(1)
            .lean()
            .exec();

            if (processes[0]) {
              let  historiqueEnd = await  historiqueEndModel.getInstance().model.find({
                processId: processes[0]._id
              }).select({
                data: 0
              }).lean().exec();
              for (let step of processes[0].steps) {

                const historiqueEndFinded = historiqueEnd.filter(sift({
                  componentId: step.componentId
                }))[0];

                if (processes[0].state === "stop") {
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
              resolve(workspace)

            } else {
              workspace.status = 'no-start';
              this.updateSimple(workspace);
              resolve(workspace)
            }

          } else {
            resolve(workspace);
          }
        })
        ProcessPromiseArray.push(ProcessPromise)
      })

      await Promise.all(ProcessPromiseArray)

      resolve(workspaces);
    }
  });
} // <= _get_all_by_role

// --------------------------------------------------------------------------------

function _update(workspace) {
  return new Promise(function(resolve, reject) {
    _update_mainprocess(workspace)
      .then((data) => {
        resolve(data);
      })
      .catch(e => {
        reject(e);
      });
  });
} // <= _update

function _update_mainprocess(preData) {
  return new Promise(async (resolve, reject) => {
    let workspaceCheck;
    try {
      workspaceCheck = await check_workspace_data(preData)
    } catch (e) {
      console.log(e)
      return reject(e)
    }
    // console.log(workspaceCheck)
    let componentUpdated = await  workspaceModel.getInstance().model
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
      path: "components",
      select: "-consumption_history"
    })
    .lean()
    .exec();

    resolve(componentUpdated);

  });
} // <= _update_mainprocess

// --------------------------------------------------------------------------------
function _get_workspace_simple(workspace_id) {
  return new Promise(function(resolve, reject) {
    workspaceModel.getInstance().model.findOne({
        _id: workspace_id
      })
      .then((workspace) => {
        if (workspace == null) {
          return reject(new Error.EntityNotFoundError('workspaceModel'))
        }
        resolve(workspace);
      })
      .catch(e => {
        reject(new Error.DataBaseProcessError(e))
      })
  });
} // <= _get_workspace

// --------------------------------------------------------------------------------

function _get_workspace(workspace_id) {
  // console.log("get workspace", workspace_id)
  return new Promise(function(resolve, reject) {
    //TODO : review model decalration architecture
    //TODO : conception error if getInstance isn't call, schema is not register
    workspaceComponentModel.getInstance();
    let workspace;
    workspaceModel.getInstance().model.findOne({
        _id: workspace_id
      }, {
        consumption_history: 0
      })
      .populate({
        path: "components",
        select: "-consumption_history",
        model: workspaceComponentModel.getInstance().model // TODO cit is connection.model inside  workspaceComponentModel which declare model to Mpngoose, no this affectation : CF previus TODO
      })
      .lean()
      .exec()
      .then(async (workspaceIn) => {
        // console.log('workspaceIn',workspaceIn);
        if (workspaceIn == null) {
          return reject(new Error.EntityNotFoundError('workspaceModel'))
        }
        workspace = workspaceIn;
        //protection against broken link and empty specificData : corrupt data
        workspace.components = workspace.components.filter(sift({
          $ne: null
        })).map(c => {
          c.specificData = c.specificData || {};
          return c;
        });

        let componentsId = workspace.components.map(c => c._id);
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
        }))

        const ProcessPromise = new Promise(async (resolve, reject) => {
          if (workspace.status != undefined) {
            resolve(workspace);
          } else {
            let  processes = await processModel.getInstance().model.find({
              workflowId: workspace._id
            }).sort({
              timeStamp: -1
            })
            .limit(1)
            .lean()
            .exec();
            if (processes[0]) {
              let historiqueEnd = await  historiqueEndModel.getInstance().model.find({
                processId: processes[0]._id
              }).select({
                data: 0
              }).lean().exec();

              for (let step of processes[0].steps) {

                const historiqueEndFinded = historiqueEnd.filter(sift({
                  componentId: step.componentId
                }))[0];

                if (processes[0].state === "stop") {
                  workspace.status = 'stoped';
                } else {
                  if (historiqueEndFinded != undefined) {
                    if (historiqueEndFinded.error != undefined) {
                      workspace.status = 'error';
                      return resolve(workspace)

                    } else {
                      workspace.status = 'resolved';
                    }
                  } else {
                    workspace.status = 'running';
                  }
                }
              }

              resolve(workspace)
              
            } else {
              workspace.status = 'no-start';
              resolve(workspace)
            }
          }
        })
        await ProcessPromise
        resolve(workspace);
      })
      .catch(e => {
        reject(new Error.DataBaseProcessError(e))
      })
  });
} // <= _get_workspace

// --------------------------------------------------------------------------------

function _get_workspace_graph_data(workspaceId) {
  return new Promise(async (resolve, reject) => {
    let result = await historiqueEndModel.getInstance().model.aggregate(
      [{
          $match: {
            workflowId: workspaceId
          }
        },
        {
          $group: {
            _id: {
              workflowComponentId: "$workflowComponentId",
              roundDate: "$roundDate"
            },
            totalPrice: {
              $sum: "$recordPrice"
            },
            totalMo: {
              $sum: "$moCount"
            },
            components: {
              $push: "$$ROOT"
            }
          }
        }
      ]);
      try {
        const graph = graphTraitement.formatDataWorkspaceGraph(result)
        resolve(graph);
      } catch (e) {
        reject(new Error.InternalProcessError(e))
      }
  });
} // <= _get_workspace_graph_data

// --------------------------------------------------------------------------------

function _addConnection(workspaceId, source, target, input) {

  return new Promise((resolve, reject) => {
    workspaceModel.getInstance().model.findOne({
      _id: workspaceId
    }).then(workspace => {
      if (workspace == null) {
        return reject(new Error.EntityNotFoundError('workspaceModel'))
      }
      console.log('input',input)
      workspace.links.push({
        source: source,
        target: target,
        targetInput : input
      });
      console.log('workspace add connection',workspace)
      return workspaceModel.getInstance().model.findOneAndUpdate({
            _id: workspace._id
          },
          workspace, {
            new: true
          }
        ).populate({
          path: "components",
          select: "-consumption_history"
        }).lean()
        .exec();
    }).then(workspaceUpdate => {
      resolve(workspaceUpdate.links)
    }).catch(e => {
      reject(new Error.DataBaseProcessError(e))
    })
  })
} // <= _addConnection

// --------------------------------------------------------------------------------

function _removeConnection(workspaceId, linkId) {
  return new Promise((resolve, reject) => {
    workspaceModel.getInstance().model.findOne({
      _id: workspaceId
    }).then(workspace => {
      if (workspace == null) {
        return reject(new Error.EntityNotFoundError('workspaceModel'))
      }
      let targetLink = workspace.links.filter(sift({
        _id: linkId
      }))[0];
      if (targetLink != undefined) {
        workspace.links.splice(workspace.links.indexOf(targetLink), 1);
        return workspaceModel.getInstance().model.findOneAndUpdate({
              _id: workspace._id
            },
            workspace, {
              new: true
            }
          ).populate({
            path: "components",
            select: "-consumption_history"
          })
          .lean()
          .exec();
      } else {
        reject(new Error.EntityNotFoundError('WorkspaceComponent'))
      }
    }).then(workspaceUpdate => {
      resolve(workspaceUpdate.links);
    }).catch(e => {
      return reject(new Error.DataBaseProcessError(e))
    });
  })
} // <= _removeConnection

// --------------------------------------------------------------------------------

