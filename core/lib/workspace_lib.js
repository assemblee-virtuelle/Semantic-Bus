"use strict";

var fragment_lib = require('./fragment_lib.js');
var workspaceComponentModel = require("../models/workspace_component_model");
var workspaceModel = require("../models/workspace_model");
var userModel = require("../models/user_model");
var config = require("../getConfiguration.js")();
var historiqueEndModel = require("../models/historiqueEnd_model");
var processModel = require("../models/process_model");
var sift = require("sift");
var graphTraitement = require("../helpers/graph-traitment");
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
  createHistoriqueEnd: _createHistoriqueEnd,
  addDataHistoriqueEnd: _addDataHistoriqueEnd,
  createProcess: _createProcess,
  get_process_byWorkflow: _get_process_byWorkflow,
  addConnection: _addConnection,
  removeConnection: _removeConnection,
  cleanOldProcess: _cleanOldProcess,
  getCurrentProcess: _getCurrentProcess,
  updateCurrentProcess: _updateCurrentProcess
};

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

function _createHistoriqueEnd(historique) {
  return new Promise(async (resolve, reject) => {
    const historiqueEndObject = historiqueEndModel.getInstance().model(historique);

    if (historiqueEndObject.error != undefined) {
      historiqueEndObject.error = {
        message: historiqueEndObject.error.message
      };
    }

    try {
      const historic = await historiqueEndModel.getInstance().model.findOneAndUpdate({
          _id: historiqueEndObject._id
        }, historiqueEndObject, {
          new: true,
          upsert: true
        })
        .lean()
        .exec()
      resolve(historic)
    } catch (e) {
      return reject(new Error.DataBaseProcessError(e))
    }
  });
} // <= _createHistoriqueEnd

// --------------------------------------------------------------------------------

function _addDataHistoriqueEnd(historicId, data) {
  return new Promise(async (resolve, reject) => {
    let frag;

    try {
      frag = await fragment_lib.persist({
        data: data
      })
    } catch (e) {
      return reject(new Error.DataBaseProcessError(e))
    }

    try {
      await historiqueEndModel.getInstance().model.findOneAndUpdate({
          _id: historicId
        }, {
          frag: frag._id
        }, {
          new: true
        })
        .lean()
        .exec();
    } catch (e) {
      return reject(new Error.DataBaseProcessError(e))
    }

    resolve(frag);
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
    processModelObject.save(function (err, work) {
      if (err) {
        reject(new Error.DataBaseProcessError(e))
      } else {
        resolve(work);
      }
    });
  });
} // <= _createHistoriqueEnd

// --------------------------------------------------------------------------------

function _getCurrentProcess(processId) {
  return new Promise((resolve, reject) => {
    processModel.getInstance().model.findOne(processId,(err, process) =>{
      if (err) {
        reject(new Error.DataBaseProcessError(e))
      } else {
        resolve(process);
      }
    });
  });
} // <= _getCurrentProcess

function _updateCurrentProcess(processId, state) {
  return new Promise((resolve, reject) => {
    processModel.getInstance().model.findByIdAndUpdate(processId,{state}, (err, process) =>{
      process.state = state
      if (err) {
        reject(new Error.DataBaseProcessError(e))
      } else {
        resolve(process);
      }
    });
  });
} // <= _getCurrentProcess

// --------------------------------------------------------------------------------

function _cleanOldProcess(workflow) {
  return new Promise((resolve, reject) => {
    let limit = workflow.limitHistoric || 1;
    processModel.getInstance().model
      .find({
        workflowId: workflow._id
      })
      .sort({
        timeStamp: -1
      })
      .limit(limit)
      .select({
        _id: 1
      })
      .lean()
      .exec()
      .then(processes => {
        resolve(processes);
        return historiqueEndModel.getInstance().model.find({
          $and: [{
              processId: {
                $nin: processes.map(p => p._id)
              }
            },
            {
              frag: {
                $ne: undefined
              }
            },
            {
              workflowId: workflow._id
            }
          ]
        }).lean().exec();
      }).then((hists) => {
        for (let hist of hists) {
          fragment_lib.cleanFrag(hist.frag);
        }
        historiqueEndModel.getInstance().model.updateMany({
          _id: {
            $in: hists.map(r => r._id)
          }
        }, {
          $unset: {
            frag: 1
          }
        }).exec();
      }).catch(e => {
        return reject(new Error.DataBaseProcessError(e))
      })
  })
}// <= _cleanOldProcess

// --------------------------------------------------------------------------------

function _get_process_byWorkflow(workflowId) {
  return new Promise((resolve, reject) => {
    workspaceModel.getInstance().model.findOne({
        _id: workflowId
      })
      .lean()
      .exec()
      .then(workflow => {
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

            if (err) {
              reject(new Error.DataBaseProcessError(err))
            } else {
              let historicPromises = [];
              for (let process of processes) {
                historicPromises.push(new Promise((resolve, reject) => {
                  historiqueEndModel.getInstance().model.find({
                    processId: process._id
                  }).select({
                    data: 0
                  }).lean().exec((err, historiqueEnd) => {
                    if (err) {
                      reject(new Error.DataBaseProcessError(err))
                    } else {
                      for (let step of process.steps) {
                        let historiqueEndFinded = sift({
                          componentId: step.componentId
                        }, historiqueEnd)[0];
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
                reject(e);
              })

            }
          })
      });
  })
}// <= _get_process_byWorkflow

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
  return new Promise(function (resolve, reject) {
    let name = new Promise(function (resolve, reject) {
      if (!workspaceData.name) {
        reject(new Error.PropertyValidationError('nom'))
      } else {
        resolve(workspaceData.name)
      }
    });
    let limitHistoric = new Promise(function (resolve, reject) {
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
}// <= check_workspace_data
// --------------------------------------------------------------------------------

async function _create(userId, workspaceData) {
  let workspaceDataCheck
  try {
    workspaceDataCheck = await check_workspace_data(workspaceData)
  } catch (e) {
    throw e;
  }
  const workspaceModelInstance = workspaceModel.getInstance().model;
  const workspace = new workspaceModelInstance({
    name: workspaceDataCheck.name,
    limitHistoric: workspaceDataCheck.limitHistoric,
    description: workspaceDataCheck.description,
    components: workspaceDataCheck.components[0]
  });

  return new Promise(function (resolve, reject) {
    workspace.save(function (err, work) {
      if (err) {
        throw reject(new Error.DataBaseProcessError(err))
      } else {
        userModel.getInstance().model.findByIdAndUpdate({
            _id: userId
          }, {
            $push: {
              workspaces: {
                _id: workspace._id,
                role: "owner"
              }
            }
          },
          function (err, user) {
            if (err) reject(new Error.DataBaseProcessError(err));
            else resolve(work);
          }
        );
      }
    });
  });
} // <= _create

// --------------------------------------------------------------------------------

function _destroy(userId, workspaceId) {
  return new Promise(function (resolve, reject) {
    userModel.getInstance().model.findByIdAndUpdate({
        _id: userId
      }, {
        $pull: {
          workspaces: {
            _id: workspaceId
          }
        }
      },
      function (err, user) {
        if (err) throw TypeError(err);
        else {
          workspaceModel.getInstance().model.find({
              _id: workspaceId
            },
            function (err, workspace) {
              if (err) throw TypeError(err);
              else {
                if (workspace[0]) {
                  if (
                    workspace[0].components != undefined ||
                    workspace[0].components != null
                  ) {
                    workspace[0].components.forEach(function (workspaceComp) {
                      if (config.quietLog != true) {}
                      workspaceComponentModel.getInstance().model
                        .remove({
                          _id: workspaceComp
                        })
                        .exec(function (err, res) {
                          if (err) throw TypeError(err);
                        });
                    });
                  }
                }
                workspaceModel.getInstance().model.findOneAndRemove({
                    _id: workspaceId
                  },
                  function (err) {
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
      .populate({
        path: "workspaces._id",
        select: "name description updatedAt"
      })
      .lean()
      .exec(async (_error, data) => {
        data.workspaces = sift({
            _id: {
              $ne: null
            }
          },
          data.workspaces
        );
        data.workspaces = data.workspaces.map(r => {
          return {
            workspace: r._id,
            role: r.role,
          };
        });
        const workspaces = sift({
            role: role
          },
          data.workspaces
        ).map(r => r.workspace);

        const ProcessPromiseArray = [];

        workspaces.forEach((workspace) => {
          const ProcessPromise = new Promise((resolve, reject) => {
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

                          const historiqueEndFinded = sift({
                            componentId: step.componentId
                          }, historiqueEnd)[0];

                          if(processes[0].state === "stop") {
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
          })
          ProcessPromiseArray.push(ProcessPromise)
        })

        await Promise.all(ProcessPromiseArray)

        resolve(workspaces);
      });
  });
} // <= _get_all_by_role

// --------------------------------------------------------------------------------

function _update(workspace) {
  return new Promise(function (resolve, reject) {
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
    console.log(workspaceCheck)
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
          return reject(new Error.DataBaseProcessError(e))
        } else {
          resolve(componentUpdated);
        }
      });
  });
} // <= _update_mainprocess

// --------------------------------------------------------------------------------
function _get_workspace_simple(workspace_id) {
  return new Promise(function (resolve, reject) {
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
  return new Promise(function (resolve, reject) {
    workspaceComponentModel.getInstance();//TODO : conception error if getInstance isn't call, schema is not register
    let workspace;
    workspaceModel.getInstance().model.findOne({
        _id: workspace_id
      }, {
        consumption_history: 0
      })
      .populate({
        path: "components",
        select: "-consumption_history",
        model: workspaceComponentModel.getInstance().model// TODO cit is connection.model inside  workspaceComponentModel which declare model to Mpngoose, no this affectation : CF previus TODO
      })
      .lean()
      .exec()
      .then((workspaceIn) => {
        if (workspaceIn == null) {
          return reject(new Error.EntityNotFoundError('workspaceModel'))
        }
        workspace = workspaceIn;

        //protection against broken link and empty specificData : corrupt data
        workspace.components = sift({
            $ne: null
          },
          workspace.components
        ).map(c => {
          c.specificData = c.specificData || {};
          return c;
        });

        let componentsId = workspace.components.map(c => c._id);
        workspace.links = sift({
          $and: [{
            source: {
              $in: componentsId
            }
          }, {
            target: {
              $in: componentsId
            }
          }]
        }, workspace.links)

        return userModel.getInstance().model.find({
            workspaces: {
              $elemMatch: {
                _id: workspace._id
              }
            }
          }, {
            "workspaces.$": 1,
            "credentials.email": 1
          })
          .lean()
          .exec();

      }).then(async (users) => {
        workspace.users = users.map(u => {
          return {
            email: u.credentials.email,
            role: u.workspaces[0].role
          };
        });
        const ProcessPromise = new Promise((resolve, reject) => {
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

                        const historiqueEndFinded = sift({
                          componentId: step.componentId
                        }, historiqueEnd)[0];

                        if(processes[0].state === "stop") {
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
      let targetLink = sift({
        _id: linkId
      }, workspace.links)[0];
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
