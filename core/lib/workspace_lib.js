"use strict";

var fragment_lib = require('./fragment_lib.js');
var workspaceComponentModel = require("../models/workspace_component_model");
var workspaceModel = require("../models/workspace_model");
var fragmentModel = require("../models/fragment_model");
var userModel = require("../models/user_model");
var cacheModel = require("../models/cache_model");

var config = require("../getConfiguration.js")();
var historiqueEndModel = require("../models/historiqueEnd_model");
var processModel = require("../models/process_model");
var sift = require("sift").default;
var graphTraitement = require("../helpers/graph-traitment");
var fetch = require('node-fetch');
const Error = require('../helpers/error.js');

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
  createProcess: _createProcess,
  get_process_byWorkflow: _get_process_byWorkflow,
  addConnection: _addConnection,
  removeConnection: _removeConnection,
  cleanOldProcess: _cleanOldProcess,
  cleanAllOldProcess: _cleanAllOldProcess,
  cleanGarbage: _cleanGarbage,
  executeAllTimers: _executeAllTimers,
  getCurrentProcess: _getCurrentProcess,
  updateCurrentProcess: _updateCurrentProcess
};

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

function _createOrUpdateHistoriqueEnd(historique) {
  return new Promise(async (resolve, reject) => {
    // console.log('_createOrUpdateHistoriqueEnd 0',historique);
    const historiqueEndObject = historiqueEndModel.getInstance().model(historique);

    if (historiqueEndObject.error != undefined) {
      historiqueEndObject.error = {
        message: historiqueEndObject.error.message
      };
    }

    try {
      // console.log('_createOrUpdateHistoriqueEnd 1',historiqueEndObject);
      const historic = await historiqueEndModel.getInstance().model.findOneAndUpdate({
          _id: historiqueEndObject._id
        }, historiqueEndObject, {
          new: true,
          upsert: true
        })
        .lean()
        .exec()
      // console.log('_createOrUpdateHistoriqueEnd 2',historic);
      resolve(historic)
    } catch (e) {
      return reject(new Error.DataBaseProcessError(e))
    }
  });
} // <= _createHistoriqueEnd

// --------------------------------------------------------------------------------

function _addDataHistoriqueEnd(historicId, data) {
  return new Promise(async (resolve, reject) => {
    // console.log('addDataHistoriqueEnd');
    let frag;

    try {
      // console.log('fragment_lib.persist',data);
      frag = await fragment_lib.persist({
        data: data
      })
      // console.log('_addDataHistoriqueEnd frag ok',frag,historicId);

      const result = await historiqueEndModel.getInstance().model.findOneAndUpdate({
          _id: historicId
        }, {
          frag: frag._id
        }, {
          new: true,
          upsert: true
        })
        .lean()
        .exec();
      resolve(result);
    } catch (e) {
      console.error(e);
      reject(new Error.DataBaseProcessError(e))
    }

  });
}

// --------------------------------------------------------------------------------

function _createProcess(process) {
  var processModelObject = processModel.getInstance().model({
    workflowId: process.workflowId,
    roundDate: process.roundDate,
    ownerId: process.ownerId,
    callerId: process.callerId,
    originComponentId: process.originComponentId,
    steps: process.steps
  });

  return new Promise((resolve, reject) => {
    processModelObject.save(function(err, work) {
      if (err) {
        reject(new Error.DataBaseProcessError(err))
      } else {
        resolve(work);
      }
    });
  });
} // <= _createHistoriqueEnd

// --------------------------------------------------------------------------------

function _getCurrentProcess(processId) {
  return new Promise((resolve, reject) => {
    processModel.getInstance().model.findOne(processId, (err, process) => {
      if (err) {
        reject(new Error.DataBaseProcessError(err))
      } else {
        resolve(process);
      }
    });
  });
} // <= _getCurrentProcess

function _updateCurrentProcess(processId, state) {
  // console.log('ALLLLO');
  return new Promise((resolve, reject) => {
    // console.log('_updateCurrentProcess');
    processModel.getInstance().model.findByIdAndUpdate(processId, {
      state
    }, (err, process) => {
      // console.log(process);
      if (state == "stop") {
        workspaceModel.getInstance().model.findByIdAndUpdate(process.workflowId, {
            status: "stoped"
          },
          (err, workspace) => {
            // console.log('workspace',workspace);
          }
        )
      }
      if (err) {
        reject(new Error.DataBaseProcessError(e))
      } else {
        resolve(process);
      }
    });
  });
} // <= _getCurrentProcess

// --------------------------------------------------------------------------------

// clenGarbage not use fragmentLib.cleanFrag and it is normal. clean gargabe don't have to depend of cleanFrag execution
function _cleanGarbage() {
  return new Promise(async (resolve, reject) => {
    console.log("_cleanGarbage");
    try {
      const workspaces = await workspaceModel.getInstance().model.find({}).lean().exec();
      let allFragKeeped=[];
      let totalProcessToRemove=[];
      let totalHistoriqueEndToRemove = [];


      for (var workflow of workspaces) {
        console.log("stack data to keep ",workflow.name)
        const {
          keepedProcesses,
          oldProcesses,
          keepedHistoriqueEnds,
          oldHistoriqueEnds
        } = await _getOldProcessAndHistoriqueEnd(workflow);


        let fragsToKeepId = keepedHistoriqueEnds.map(h => h.frag);

        // console.log('fragsToKeepId1',fragsToKeepId);
        const cacheComponents = await workspaceComponentModel.getInstance().model.find({
          module: "cacheNosql",
          workspaceId: workflow._id
        }).lean().exec();


        const caches = await cacheModel.getInstance().model.find({
          _id: {
            $in: cacheComponents.map(c=>c._id)
          },
        }).lean().exec();

        fragsToKeepId = fragsToKeepId.concat(caches.map(c => c.frag));

        // console.log('fragsToKeepId2',fragsToKeepId);

        const fragsToKeep = await fragmentModel.getInstance().model.find({
          _id: {
            $in: fragsToKeepId
          }
        }).select({
          frags: 1,
          rootFrag: 1
        }).lean().exec();

        // let fragToKeep = relatedFrags.map(f => f._id);
        for (let frag of fragsToKeep) {
          //old frags management. could be remove but some old frags keep in cache or process
          if (frag.frags != undefined) {
            fragsToKeepId = fragsToKeepId.concat((frag.frags));
          }
          //new frags management
          if (frag.rootFrag != undefined) {
            const fragFromRoot = await fragmentModel.getInstance().model.find({
              originFrag: frag.rootFrag
            }).select('_id').lean().exec();
            fragsToKeepId = fragsToKeepId.concat(fragFromRoot.map(f => f._id));
          }
        }

        // console.log('fragsToKeepId3',fragsToKeepId);
        fragsToKeepId=fragsToKeepId.filter(f=>f!=undefined);

        // console.log('fragsToKeepId',fragsToKeepId);

        allFragKeeped=allFragKeeped.concat(fragsToKeepId);

        // const notReferencedFragsCount = await fragmentModel.getInstance().model.count({
        //   _id: {
        //     $nin: fragsToKeepId
        //   }
        // }).exec();
        //
        //
        // await fragmentModel.getInstance().model.deleteMany({
        //   _id: {
        //     $nin: fragsToKeepId
        //   }
        // })

        // totalFragKeeped+=fragsToKeepId.length;
        // totalFragRemoved+=notReferencedFragsCount;

        // await historiqueEndModel.getInstance().model.deleteMany({
        //   _id: {
        //     $in: oldHistoriqueEnds.map(h=>g._id)
        //   }
        // })

        totalHistoriqueEndToRemove=totalHistoriqueEndToRemove.concat(oldHistoriqueEnds.map(h=>g._id));

        // totalHistoriqueEndKeeped+=keepedHistoriqueEnds.length;
        // totalHistoriqueEndRemoved+=oldHistoriqueEnds.length;

        // await processModel.getInstance().model.deleteMany({
        //   _id: {
        //     $in: oldProcesses.map(h=>g._id)
        //   }
        // })

        totalProcessToRemove=totalProcessToRemove.concat(oldProcesses.map(h=>g._id));

        // totalProcessKeeped+=keepedProcesses.length;
        // totalProcessRemoved+=oldProcesses.length;

        // console.log(`cleanGarbage ${workflow.name} F:${fragsToKeepId.length}/${totalFragRemoved} H:${keepedHistoriqueEnds.length}/${oldHistoriqueEnds.length} P:${keepedProcesses.length}/${oldProcesses.length}`);

      }

      // const notReferencedFragsCount = await fragmentModel.getInstance().model.count({
      //   _id: {
      //     $nin: allFragKeeped
      //   }
      // }).exec();

      const allFrag= await historiqueEndModel.getInstance().model.find({})
      .select({
        _id: 1
      }).lean().exec().map(f=>f._id);
      console.log('allFrag',allFrag);
      const allFragtoRemove = allFrag.filter(f=>!allFragKeeped.includes(f));
      console.log('allFragtoRemove',allFragtoRemove);
      console.log('remove garbage fragments')
      await fragmentModel.getInstance().model.deleteMany({
        _id: {
          $nin: allFragKeeped
        }
      })
      
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

      console.log(`${allFragKeeped.length} fragments keeped and ${notReferencedFragsCount} fragments removed`);
      console.log(`${allFragKeeped.length} fragments keeped`);
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
      const processNormalCleaned = await _cleanOldProcess(workflow);
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
          workflowId: workflow._id
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



function _cleanOldProcess(workflow) {
  return new Promise(async (resolve, reject) => {
    try {
      // console.log(`--------- start clean ${workflow.name}`)
      const {
        keepedProcesses,
        oldProcesses,
        keepedHistoriqueEnds,
        oldHistoriqueEnds
      } = await _getOldProcessAndHistoriqueEnd(workflow);

      for (let oldHistoriqueEnd of oldHistoriqueEnds){
        // await fragment_lib.cleanFrag(oldHistoriqueEnd.frag);
      }
      // console.log(`--------- middle clean ${workflow.name}`)
      // console.log(`Normal Clean ${oldHistoriqueEnds.length} historic of ${workflow.name}`);
      await historiqueEndModel.getInstance().model.deleteMany({
        _id: {
          $in: oldHistoriqueEnds.map(r => r._id)
        }
      }).exec();

      // console.log(`Normal Clean ${oldProcesses.length} process of ${workflow.name}`);
      await processModel.getInstance().model.deleteMany({
        _id: {
          $in: oldProcesses.map(r => r._id)
        }
      }).exec();
      // console.log(`--------- end clean ${workflow.name}`)
      resolve()
    } catch (e) {
      reject(new Error.DataBaseProcessError(e))
    }
  })
} // <= _cleanOldProcess

// --------------------------------------------------------------------------------

function _get_process_byWorkflow(workflowId) {
  return new Promise((resolve, reject) => {
    // console.log('--- TRACE 1');
    workspaceModel.getInstance().model.findOne({
        _id: workflowId
      })
      .lean()
      .exec()
      .then(workflow => {
        // console.log('--- TRACE 2');
        if (workflow == null) {
          return reject(new Error.EntityNotFoundError('workspaceModel'))
        }
        processModel.getInstance().model.find({
            workflowId: workflow._id
          }).sort({
            timeStamp: -1
          })
          .limit(workflow.limitHistoric)
          .lean()
          .exec((err, processes) => {
            // console.log('--- TRACE 3');
            if (err) {
              reject(new Error.DataBaseProcessError(err))
            } else {
              // console.log('--- TRACE 4');
              let historicPromises = [];
              for (let process of processes) {
                historicPromises.push(new Promise((resolve, reject) => {
                  historiqueEndModel.getInstance().model.find({
                    processId: process._id
                  }).select({
                    data: 0
                  }).lean().exec((err, historiqueEnd) => {
                    if (err) {
                      console.error('--- DataBaseProcessError during get_process_byWorkflow', err);
                      reject(new Error.DataBaseProcessError(err))
                    } else {
                      // console.log('--- TRACE 5');
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
                    }
                  })
                }));
              }
              Promise.all(historicPromises).then(data => {
                resolve(data)
              }).catch(e => {
                console.error('--- REJECT ', e);
                reject(e);
              })

            }
          })
      });
  })
} // <= _get_process_byWorkflow

// --------------------------------------------------------------------------------

function _update_simple(workspaceupdate) {
  return new Promise((resolve, reject) => {
    if (config.quietLog != true) {}
    workspaceModel.getInstance().model
      .findOneAndUpdate({
          _id: workspaceupdate._id
        },
        workspaceupdate, {
          upsert: true,
          new: true
        }
      )
      .exec((err, workspaceUpdate) => {
        if (err) {
          reject(err);
        } else {
          if (config.quietLog != true) {}
          resolve(workspaceUpdate);
        }
      });
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





    // workspace.save(function(err, work) {
    //   if (err) {
    //     throw reject(new Error.DataBaseProcessError(err))
    //   } else {
    //     userModel.getInstance().model.findByIdAndUpdate({
    //         _id: userId
    //       }, {
    //         $push: {
    //           workspaces: {
    //             _id: workspace._id,
    //             role: "owner"
    //           }
    //         }
    //       },
    //       function(err, user) {
    //         if (err) reject(new Error.DataBaseProcessError(err));
    //         else resolve(work);
    //       }
    //     );
    //   }
    // });
  });
} // <= _create

// --------------------------------------------------------------------------------

function _destroy(userId, workspaceId) {
  return new Promise(function(resolve, reject) {
    userModel.getInstance().model.findByIdAndUpdate({
        _id: userId
      }, {
        $pull: {
          workspaces: {
            _id: workspaceId
          }
        }
      },
      function(err, user) {
        if (err) throw TypeError(err);
        else {
          workspaceModel.getInstance().model.find({
              _id: workspaceId
            },
            function(err, workspace) {
              if (err) throw TypeError(err);
              else {
                if (workspace[0]) {
                  if (
                    workspace[0].components != undefined ||
                    workspace[0].components != null
                  ) {
                    workspace[0].components.forEach(function(workspaceComp) {
                      if (config.quietLog != true) {}
                      workspaceComponentModel.getInstance().model
                        .remove({
                          _id: workspaceComp
                        })
                        .exec(function(err, res) {
                          if (err) throw TypeError(err);
                        });
                    });
                  }
                }
                workspaceModel.getInstance().model.findOneAndRemove({
                    _id: workspaceId
                  },
                  function(err) {
                    if (err) throw TypeError(err);
                    else {
                      resolve(workspace);
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
      // .populate({
      //   path: "workspaces._id",
      //   select: "name description updatedAt status"
      // })
      .lean()
      .exec(async (_error, data) => {
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
          // const workspaces = data.workspaces.filter(sift({
          //   role: role
          // })).map(r => r.workspace);

          const ProcessPromiseArray = [];

          workspaces.forEach((workspace) => {
            const ProcessPromise = new Promise((resolve, reject) => {
              // console.log('workspace',workspace);
              if (workspace.status == undefined) {
                processModel.getInstance().model.find({
                    workflowId: workspace._id
                  }).sort({
                    timeStamp: -1
                  })
                  .limit(1)
                  .lean()
                  .exec((err, processes) => {
                    if (err) {
                      reject(new Error.DataBaseProcessError(err))
                    } else {
                      if (processes[0]) {
                        historiqueEndModel.getInstance().model.find({
                          processId: processes[0]._id
                        }).select({
                          data: 0
                        }).lean().exec((err, historiqueEnd) => {
                          if (err) {
                            reject(new Error.DataBaseProcessError(err))
                          } else {
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
                          }
                        })
                      } else {
                        workspace.status = 'no-start';
                        this.updateSimple(workspace);
                        resolve(workspace)
                      }
                    }
                  })
                // console.log(workspace.status);

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
    workspaceModel.getInstance().model
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
      .exec((err, componentUpdated) => {
        if (err) {
          return reject(new Error.DataBaseProcessError(err))
        } else {
          resolve(componentUpdated);
        }
      });
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

      //   return userModel.getInstance().model.find({
      //       workspaces: {
      //         $elemMatch: {
      //           _id: workspace._id
      //         }
      //       }
      //     }, {
      //       "workspaces.$": 1,
      //       "credentials.email": 1
      //     })
      //     .lean()
      //     .exec();

      // }).then(async (users) => {
      //   workspace.users = users.map(u => {
      //     return {
      //       email: u.credentials.email,
      //       role: u.workspaces[0].role
      //     };
      //   });
        const ProcessPromise = new Promise((resolve, reject) => {
          if (workspace.status != undefined) {
            resolve(workspace);
          } else {
            processModel.getInstance().model.find({
                workflowId: workspace._id
              }).sort({
                timeStamp: -1
              })
              .limit(1)
              .lean()
              .exec((err, processes) => {
                if (err) {
                  reject(new Error.DataBaseProcessError(err))
                } else {
                  if (processes[0]) {
                    historiqueEndModel.getInstance().model.find({
                      processId: processes[0]._id
                    }).select({
                      data: 0
                    }).lean().exec((err, historiqueEnd) => {
                      if (err) {
                        reject(new Error.DataBaseProcessError(err))
                      } else {
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
                      }
                    })
                  } else {
                    workspace.status = 'no-start';
                    resolve(workspace)
                  }
                }
              })
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
  return new Promise((resolve, reject) => {
    historiqueEndModel.getInstance().model.aggregate(
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
      ],
      async (err, result) => {
        if (err) {
          reject(new Error.DataBaseProcessError(err))
        } else {
          try {
            const graph = graphTraitement.formatDataWorkspaceGraph(result)
            resolve(graph);
          } catch (e) {
            reject(new Error.InternalProcessError(e))
          }
        }
      }
    );
  });
} // <= _get_workspace_graph_data

// --------------------------------------------------------------------------------

function _addConnection(workspaceId, source, target) {
  return new Promise((resolve, reject) => {
    workspaceModel.getInstance().model.findOne({
      _id: workspaceId
    }).then(workspace => {
      if (workspace == null) {
        return reject(new Error.EntityNotFoundError('workspaceModel'))
      }
      workspace.links.push({
        source: source,
        target: target
      });
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
