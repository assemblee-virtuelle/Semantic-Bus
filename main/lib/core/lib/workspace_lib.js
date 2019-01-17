"use strict";

var user_lib = require("./user_lib");
var workspace_component_lib = require("./workspace_component_lib");
var fragment_lib = require('./fragment_lib.js');
var workspaceModel = require("../models/workspace_model");
var userModel = require("../models/user_model");
var workspaceComponentModel = require("../models/workspace_component_model");
var config = require("../../../configuration.js");
var historiqueEndModel = require("../models/historiqueEnd_model");
var historiqueStartModel = require("../models/historiqueStart_model");
var processModel = require("../models/process_model");
var mongoose = require("mongoose");
var sift = require("sift");
var graphTraitement = require("../../../utils/graph-traitment");


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
  get_workspace_graph_data: _get_workspace_graph_data,
  // createHistoriqueStart: _createHistoriqueStart,
  createHistoriqueEnd: _createHistoriqueEnd,
  addDataHistoriqueEnd: _addDataHistoriqueEnd,
  createProcess: _createProcess,
  get_process_result: _get_process_result,
  get_process_byWorkflow: _get_process_byWorkflow,
  addConnection: _addConnection,
  removeConnection: _removeConnection,
  cleanOldProcess: _cleanOldProcess
};

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

const decimalAdjust = function(type, value, exp) {
  // Si la valeur de exp n'est pas définie ou vaut zéro...
  if (typeof exp === "undefined" || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  // Si la valeur n'est pas un nombre ou si exp n'est pas un entier...
  if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
    return NaN;
  }
  // Si la valeur est négative
  if (value < 0) {
    return this.decimalAdjust(type, -value, exp);
  }

  // Décalage
  value = value.toString().split("e");
  value = Math[type](+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)));
  // Décalage inversé
  value = value.toString().split("e");
  return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp));
};


function _createHistoriqueEnd(historique) {
  //console.log("historiqueEndObject", historiqueEndObject)
  return new Promise((resolve, reject) => {
    //console.log("_createHistoriqueEnd", historique)
    var historiqueEndObject = historiqueEndModel.getInstance().model(historique);

    if (historiqueEndObject.error != undefined) {
      //console.log('ERROR',historiqueEndObject.error);
      historiqueEndObject.error = {
        message: historiqueEndObject.error.message
      };
    }
    historiqueEndModel.getInstance().model.findOneAndUpdate({
        _id: historiqueEndObject._id
      }, historiqueEndObject, {
        new: true,
        upsert: true
      })
      .lean()
      .exec()
      .then(historic => {
        resolve(historic);
      }).catch(e => {
        reject(e);
      });
  });
} // <= _createHistoriqueEnd

function _addDataHistoriqueEnd(historicId, data) {
  return new Promise((resolve, reject) => {
      let frag;
      fragment_lib.persist({
        data: data
      }).then(fragIn => {
        frag = fragIn;
        return historiqueEndModel.getInstance().model.findOneAndUpdate({
            _id: historicId
          }, {
            frag: frag._id
          }, {
            new: true
          })
          .lean()
          .exec();
      }).then((historic) => {
        resolve(frag);
      }).catch(e => {
      reject(e);
    });
  });
}

function _createProcess(process) {
  //console.log("process creation", process)
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
        reject(err);
      } else {
        resolve(work);
      }
    });
  });
} // <= _createHistoriqueEnd


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
        reject(e);
      })
  })
}

function _get_process_result(processId) {
  return new Promise((resolve, reject) => {
    historiqueEndModel.getInstance().model.find({
        processId: processId
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

function _get_process_byWorkflow(workflowId) {
  return new Promise((resolve, reject) => {
    workspaceModel.getInstance().model.findOne({
        _id: workflowId
      })
      .lean()
      .exec()
      .then(workflow => {
        processModel.getInstance().model.find({
            workflowId: workflow._id
          }).sort({
            timeStamp: -1
          })
          .limit(workflow.limitHistoric)
          .lean()
          .exec((err, processes) => {
            if (err) {
              reject(err);
            } else {
              let historicPromises = [];
              for (let process of processes) {
                //console.log(processes);
                historicPromises.push(new Promise((resolve, reject) => {
                  historiqueEndModel.getInstance().model.find({
                    processId: process._id
                  }).select({
                    data: 0
                  }).lean().exec((err, historiqueEnd) => {
                    if (err) {
                      reject(err);
                    } else {
                      for (let step of process.steps) {
                        //console.log('step',step);
                        let historiqueEndFinded = sift({
                          componentId: step.componentId
                        }, historiqueEnd)[0];
                        //console.log('historiqueEndFinded',historiqueEndFinded);
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
}


// --------------------------------------------------------------------------------

function _update_simple(workspaceupdate) {
  return new Promise((resolve, reject) => {
    if (config.quietLog != true) {
      //console.log("update workspace |");
    }
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
          if (config.quietLog != true) {
            //console.log("in resolve");
          }
          resolve(workspaceUpdate);
        }
      });
  });
} // <= _update_simple

// --------------------------------------------------------------------------------

function _create(userId, workspaceData) {
  const workspaceModelInstance= workspaceModel.getInstance().model;
  var workspace = new workspaceModelInstance({
    name: workspaceData.name,
    description: workspaceData.description,
    components: workspaceData.components[0]
  });

  return new Promise(function(resolve, reject) {
    workspace.save(function(err, work) {
      if (err) {
        throw TypeError(err);
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
          function(err, user) {
            if (err) throw TypeError(err);
            else resolve(work);
          }
        );
      }
    });
  });
} // <= _create

// --------------------------------------------------------------------------------

function _destroy(userId, workspaceId) {
  if (config.quietLog != true) {
    //console.log("destroy : userid ||", userId, "workspaceId ||", workspaceId);
  }
  return new Promise(function(resolve, reject) {
    userModel.getInstance().model.findByIdAndUpdate({
        _id: userId
      }, {
        $pull: {
          workspaces: {
            _id: mongoose.Types.ObjectId(workspaceId)
          }
        }
      },
      function(err, user) {
        if (config.quietLog != true) {
          //console.log('workspace USER', user.workspaces.length);
        }
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
                      if (config.quietLog != true) {
                        //console.log("for each workspaceComp ||", workspaceComp);
                      }
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
  var workspaces_owner = [];
  //console.log(role);
  return new Promise(function(resolve, reject) {
    userModel.getInstance().model
      .findOne({
        _id: userID
      })
      .populate({
        path: "workspaces._id",
        select: "name description"
      })
      .lean()
      .exec((error, data) => {

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
            role: r.role
          };
        });
        //  console.log(role);
        let workspaces = sift({
            role: role
          },
          data.workspaces
        ).map(r => r.workspace);
        resolve(workspaces);
      });
  });
} // <= _get_all_owner

// --------------------------------------------------------------------------------

function _update(workspace) {
  ////console.log("WORKSAPCE UPDATE", workspace)
  return new Promise(function(resolve, reject) {
    _update_mainprocess(workspace)
      .then(function(data) {
        resolve(data);
      })
      .catch(e => {
        reject(e);
      });
  });
} // <= _update

function _update_mainprocess(preData) {
  //preData.components = preData.components.map(c => c._id);
  if (config.quietLog != true) {
    //console.log('before Update', preData);
  }
  return new Promise(function(resolve, reject) {
    workspaceModel.getInstance().model
      .findOneAndUpdate({
          _id: preData._id
        },
        preData, {
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
          reject(err);
        } else {
          if (config.quietLog != true) {
            //console.log('after Update', componentUpdated);
          }
          resolve(componentUpdated);
        }
      });
  });
} // <= _update_mainprocess

// --------------------------------------------------------------------------------

function _update_preprocess(workspace) {
  ////console.log("_update_preprocess")
  var removeWorkspaceComponent = [];
  var workspacesCompstring = [];
  return new Promise(function(resolve, reject) {
    if (workspace.components.length > 0) {
      workspaceComponentModel.getInstance().model.find({
          workspaceId: workspace._id
        },
        function(err, allWorkspaceComponent) {
          if (err) {
            reject(err);
          } else {

            let componentsPromises = [];
            //repare broken links
            workspace.components.forEach(compSource => {
              let linkBroken = false;
              compSource.connectionsAfter.forEach(compAfterId => {
                sift({
                    _id: compAfterId
                  },
                  workspace.components
                ).forEach(compAfter => {
                  let linkVerification = sift({
                      $eq: compSource._id
                    },
                    compAfter.connectionsBefore
                  );
                  if ((linkVerification.length = 0)) {
                    linkBroken = true;
                    compAfter.connectionsBefore.push(compSource._id);
                  }
                });
              });
              compSource.connectionsBefore.forEach(compBeforeId => {
                sift({
                    _id: compBeforeId
                  },
                  workspace.components
                ).forEach(compBefore => {
                  let linkVerification = sift({
                      $eq: compSource._id
                    },
                    compBefore.connectionsAfter
                  );
                  if ((linkVerification.length = 0)) {
                    linkBroken = true;
                    compBefore.connectionsAfter.push(compSource._id);
                  }
                });
              });
              if (linkBroken) {
                let promise = new Promise((resolve, reject) => {
                  workspace_component_lib.update(c).then(newComp => {
                    resolve(newComp);
                  });
                })
                componentsPromises.push(promise);
              }
            });
            Promise.all(componentsPromises).then(components => {
              components.forEach(r => {
                let findedComponent = sift({
                  _id: r._id
                }, workspace.components)[0];
                if (findedComponent != undefined) {
                  findedComponent = r;
                }
              });
              // //console.log('workspace.components',workspace.components);
              resolve(workspace);
            });
          }
        }
      );
    } else {
      resolve(workspace);
    }
  });
} // <= _update_preprocess



// -------------
function _get_workspace(workspace_id) {
  if (config.quietLog != true) {
    //console.log("=============== getworkspace ===========", workspace_id)
  }
  return new Promise(function(resolve, reject) {
    let workspace;
    workspaceModel.getInstance().model.findOne({
        _id: workspace_id
      }, {
        consumption_history: 0
      })
      .populate({
        path: "components",
        select: "-consumption_history"
      })
      .lean()
      .exec()
      .then((workspaceIn) => {
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
        // for (let comp of workspace.components) {
        //   if(comp.specificData.transformObject!=undefined && comp.specificData.transformObject.desc!=undefined){
        //     //console.log('ZZZZZZZZZZZZZZ',encodeURI(comp.specificData.transformObject.desc));
        //   }
        // }
        //protection against link but not component
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

      }).then((users) => {
        workspace.users = users.map(u => {
          return {
            email: u.credentials.email,
            role: u.workspaces[0].role
          };
        });
        resolve(workspace);
      })
      .catch(e => {
        reject(e);
      })
  });
} // <= _get_workspace_component

// --------------------------------------------------------------------------------
function _get_workspace_graph_data(workspaceId) {
  return new Promise((resolve, reject) => {
    historiqueEndModel.getInstance().model.aggregate(
      [{
          $match: {
            workspaceId: workspaceId
          }
        },
        {
          $group: {
            _id: {
              workflowComponentId: "$workflowComponentId",
              roundDate: "$roundDate"
            },
            totalPrice: {
              $sum: "$totalPrice"
            },
            totalMo: {
              $sum: "$moCount"
            },
            workspaces: {
              $push: "$$ROOT"
            }
          }
        }
      ],
      function(err, result) {
        if (err) {
          //console.log(err);
        } else {
          //console.log(result)
          graphTraitement.formatDataUserGraph().then(graphData => {
            let final_graph = [];
            let globalPrice = 0;
            let tableId = [];
            let componentNumber = 0;
            let globalMo = 0;
            let c = {};
            for (let month in graphData) {
              for (let day in graphData[month]) {
                let y0 = 0;
                let final_data_object = {};
                final_data_object.Day = day;
                final_data_object.total = 0;
                final_data_object.ages = [];
                let i = 0;
                result.forEach(res => {
                  let key;
                  if (
                    new Date(parseInt(res._id.roundDate)).getUTCMonth() + 1 ==
                    month &&
                    new Date(parseInt(res._id.roundDate)).getUTCDate() ==
                    day.split("-")[1]
                  ) {
                    tableId.push(res.workspaces[0].workflowComponentId);
                    final_data_object.ages.push({
                      name: res.workspaces[res.workspaces.length - 1].componentName,
                      ID: res.workspaces[0].workflowComponentId,
                      module: res.workspaces[res.workspaces.length - 1].componentModule,
                      componentPrice: res.workspaces[res.workspaces.length - 1].componentPrice,
                      price: decimalAdjust("round", res.totalPrice, -3),
                      flow: decimalAdjust("round", res.totalMo, -3),
                      y0: +y0,
                      y1: (y0 += res.totalPrice)
                    });

                    final_data_object.total += res.totalPrice;
                    componentNumber += 1;
                    globalPrice += res.totalPrice;
                    globalMo += res.totalMo;
                  }
                });
                final_graph.push(final_data_object);
              }
            }
            resolve({
              tableId: tableId,
              globalPrice: globalPrice,
              data: final_graph,
              globalMo: globalMo,
              componentNumber: componentNumber
            });
          });
        }
      }
    );
  });
} // <= _get_workspace_graph_data

function _addConnection(workspaceId, source, target) {
  return new Promise((resolve, reject) => {
    workspaceModel.getInstance().model.findOne({
      _id: workspaceId
    }).then(workspace => {
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
      reject(e);
    })
  })
}

function _removeConnection(workspaceId, linkId) {
  //console.log(workspaceId, linkId);
  return new Promise((resolve, reject) => {
    workspaceModel.getInstance().model.findOne({
      _id: workspaceId
    }).then(workspace => {
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
        reject(new Error("no link finded"));
      }
    }).then(workspaceUpdate => {
      resolve(workspaceUpdate.links);
    }).catch(e => {
      reject(e);
    });
  })
}
// --------------------------------------------------------------------------------
