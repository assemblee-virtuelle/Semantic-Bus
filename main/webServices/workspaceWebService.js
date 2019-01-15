var mLabPromise = require('./mLabPromise');
var workspaceComponentPromise = require('./workspaceComponentPromise.js');
var workspaceBusiness = require('./workspaceBusiness.js');
var workspace_lib = require('../lib/core/lib/workspace_lib');
var workspace_component_lib = require('../lib/core/lib/workspace_component_lib');
var technicalComponentDirectory = require('./technicalComponentDirectory.js');
var sift = require('sift');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


module.exports = function(router, stompClient) {
  //TODO Ugly
  this.stompClient = stompClient;
  // ---------------------------------------  ALL USERS  -----------------------------------------

  router.get('/workspaceByUser/:userId', function(req, res, next) {
    //next(new Error('Whoops!'));
    //console.log('ALLO');
    workspace_lib.getAll(req.params.userId, "owner").then(function(workspaces) {
      //console.log('stompClient',stompClient);
      res.json(workspaces);
    }).catch(e => {
      next(e);
    })
  }); //<= owned workspace


  // ---------------------------------------------------------------------------------

  router.get('/workspaces/share/:userId', function(req, res, next) {
    workspace_lib.getAll(req.params.userId, "editor").then(function(workspaces) {
      res.json(workspaces)
    }).catch(e => {
      next(e);
    });
  }); //<= shared workspace

  // ---------------------------------------------------------------------------------

  router.get('/workspace/:id/graph', function(req, res, next) {
    //console.log(" WEB SERVICE GRAPH", req.params.id);
    //console.log(" WEB SERVICE GRAPH");
    workspace_lib.get_workspace_graph_data(req.params.id).then((workspaceGraph) => {
      res.json({
        workspaceGraph
      })
    }).catch(e => {
      next(e);
    });
  }); //<= graph workspace


  router.post('/workspace/:id/addHistorique', function(req, res, next) {
    // if (req.body != null) {
    //   console.log(req.params.id)
    //   console.log(req.body)
    // }
  })
  // --------------------------------------------------------------------------------

  router.get('/workspace/:id', function(req, res, next) {
    //console.log('Get On Workspace 1');
    workspace_lib.getWorkspace(req.params.id).then(function(workspace) {
      //console.log("RENDER ", req.params.id)
      //console.log('workspace | getWorkspace',workspace.users);
      //console.log(technicalComponentDirectory);
      // workspace.components.forEach(c => {
      //   //console.log(technicalComponentDirectory);
      //   console.log('ICON',technicalComponentDirectory[c.module].graphIcon);
      //   c.graphIcon = technicalComponentDirectory[c.module].graphIcon;
      // })

      for (var c of workspace.components) {

        if (technicalComponentDirectory[c.module] != null) {
          //console.log('ICON',technicalComponentDirectory[c.module].graphIcon);
          c.graphIcon = technicalComponentDirectory[c.module].graphIcon;
        } else {
          c.graphIcon = "default"
        }
        //console.log('-->',c);
      }
      //console.log(workspace);
      res.json(workspace);
    }).catch(e => {
      next(e);
    });
  }); // <= get one workspace

  router.get('/processByWorkflow/:id', function(req, res, next) {
    //console.log('Get On Workspace 1');
    workspace_lib.get_process_byWorkflow(req.params.id).then((workspaceProcess) => {
      res.json(workspaceProcess);
    }).catch(e => {
      next(e);
    });
  }); // <= get one workspace


  // --------------------------------------------------------------------------------
  router.put('/workspacerowId/', function(req, res, next) {
    if (req.body != null) {
      workspace_lib.updateSimple(req.body).then(workspaceUpdate => {
        //console.log("UPDATE DONE", workspaceUpdate)
        res.send(workspaceUpdate);
      })
    }
  })


  router.put('/workspace/', function(req, res, next) {
    //console.log('req.body', req.body)
    if (req.body != null) {
      workspace_lib.update(req.body).then(workspaceUpdate => {

        for (var c of workspaceUpdate.components) {
          if (technicalComponentDirectory[c.module] != null) {
            c.graphIcon = technicalComponentDirectory[c.module].graphIcon;
          } else {
            c.graphIcon = "default"
          }
        }
        //console.log('update workspace WebService result', workspaceUpdate);
        res.send(workspaceUpdate);
      }).catch(e => {
        //console.log('FAIL', e);
        res.status(500).send(e);
      }).catch(e => {
        next(e);
      });
      // if (req.body.component) {
      //   workspace_component_lib.create(req.body.component).then(function (workspaceComponent) {
      //     workspace_lib.update(req.body.workspace, workspaceComponent._id).then(function (workspaceUpdate) {
      //       res.send(workspaceUpdate)
      //     })
      //   })
      // } else {
      //   workspace_lib.update(req.body).then(function (workspaceUpdate) {
      //     res.send(workspaceUpdate)
      //   })
      // }
    } else {
      next(new Error('empty body'))
    }
  }) //<= update_workspace;

  router.post('/workspace/:id/addComponents', function(req, res, next) {
    //console.log('req.body', req.body,req.params.id)
    if (req.body != null) {
      let components = req.body;
      components.forEach(c => {
        c._id = undefined;
        c.workspaceId = req.params.id;
        c.specificData = c.specificData || {};
        c.connectionsBefore = [];
        c.connectionsAfter = [];
        c.consumption_history = [];
      })
      workspace_component_lib.create(components).then(function(workspaceComponents) {
        workspace_lib.getWorkspace(req.params.id).then((workspace) => {
          workspace.components = workspace.components.concat(workspaceComponents);
          workspace_lib.update(workspace).then(workspaceUpdated => {
            for (var c of components) {
              if (technicalComponentDirectory[c.module] != null) {
                //console.log('ICON',technicalComponentDirectory[c.module].graphIcon);
                c.graphIcon = technicalComponentDirectory[c.module].graphIcon;
              } else {
                c.graphIcon = "default"
              }
              //console.log('-->',c);
            }
            res.send(components);
          }).catch(e => {
            console.log('e1', e);
            next(e);
          });
        }).catch(e => {
          console.log('e2', e);
          next(e);
        });
      }).catch(e => {
        console.log('e3', e);
        next(e);
      });
    } else {
      next(new Error('empty body'))
    }
  })
  
  // --------------------------------------------------------------------------------

  router.post('/workspace/:id/import', function(req, res, next) {

    // console.log('import', req.body, req.params.id)
    let newWorkspace = req.body;
    let newComponents = newWorkspace.components.map(c => {
      return {
        workspaceId: req.params.id,
        specificData: c.specificData || {},
        module: c.module,
        type: c.type,
        description: c.description,
        editor: c.editor,
        graphPositionX:c.graphPositionX,
        graphPositionY:c.graphPositionY,
      }
    })


    workspace_lib.getWorkspace(req.params.id).then(async function(workspace) {
      let workspaceComponents = await workspace_component_lib.create(newComponents);
      workspace.components = workspaceComponents;
      let idMapping = {};
      for (i = 0; i < newWorkspace.components.length; i++) {
        idMapping[newWorkspace.components[i]._id] = workspace.components[i]._id;
      }
      let newLinks = newWorkspace.links.map(l => {
        return {
          source: idMapping[l.source],
          target: idMapping[l.target]
        }
      });
      let workspaceLinks;
      for (let link of newLinks) {
        workspaceLinks = await workspace_lib.addConnection(workspace._id, link.source, link.target);
      }
      workspace.links = workspaceLinks;
      workspace = await workspace_lib.update(workspace);

      for (var c of workspace.components) {
        if (technicalComponentDirectory[c.module] != null) {
          //console.log('ICON',technicalComponentDirectory[c.module].graphIcon);
          c.graphIcon = technicalComponentDirectory[c.module].graphIcon;
        } else {
          c.graphIcon = "default"
        }
      }
      res.send(workspace);
    }).catch(e => {
      next(e);
    })


  })

  router.post('/workspace/:userId', function(req, res, next) {
    if (req.body.components) {
      // dans le cas ou il n'y a pas de save à la création : save du WS et des comp
      if (req.body.components.length > 0) {
        workspace_component_lib.create(req.body.components).then(function(workspaceComponent) {
          req.body.components = []
          req.body.components.push(workspaceComponent._id)
          workspace_lib.create(req.params.userId, req.body).then(function(workspace) {
            res.send(workspace)
          })
        }).catch(e => {
          next(e);
        });
      } else {
        workspace_lib.create(req.params.userId, req.body).then(function(workspace) {
          res.send(workspace)
        }).catch(e => {
          next(e);
        });
      }
    } else {
      workspace_lib.create(req.params.userId, req.body).then(function(workspace) {
        res.send(workspace)
      }).catch(e => {
        next(e);
      });
    }
  }); //<= post workspace

  // --------------------------------------------------------------------------------

  router.delete('/workspace/:id/:userId', function(req, res, next) {

    workspace_lib.destroy(req.params.userId, req.params.id).then(function(workspace) {
      //console.log("workspace delete", workspace)
      res.json(workspace)
    }).catch(e => {
      next(e);
    });
  }) //<= delete workspace


  router.get('/workspaceComponent/load_all_component/:id', function(req, res, next) {
    var id = req.params.id;
    //console.log(id)
    workspace_lib.load_all_component(id).then(function(data) {
      res.send(data)
    }).catch(e => {
      next(e);
    });
  }) //<= get_ConnectBeforeConnectAfter

  // --------------------------------------------------------------------------------
  router.get('/processState/:id', function(req, res, next) {
    //console.log('WORK');
    var id = req.params.id;
    res.send({
      state: 'inprogress'
    });
    // console.log(id);
    // workspace_lib.get_process_result(id).then((historiqueEnd)=>{
    //   if(historiqueEnd!=null){
    //     res.send(historiqueEnd)
    //   }else {
    //     next(new Error("no process "+id))
    //   }
    //   //this.stompClient.send('/topic/work-response.'+data.callerId, JSON.stringify({processId:0}));
    // }).catch(e => {
    //   console.log(e);
    //   next(e);
    //   // console.log("IN ERROR WEB SERVICE",e.message);
    //   // this.stompClient.send('/topic/work-response.'+data.callerId, JSON.stringify({error:e.message}));
    // });
  }.bind(this)); //<= process


  //return updated Links
  router.post('/workspaceComponent/connection', function(req, res, next) {
    configuration = require('../configuration');
    let body = req.body;
    if (configuration.saveLock == false) {
      workspace_lib.addConnection(req.body.workspaceId, req.body.source, req.body.target).then(links => {
        // console.log(links);
        res.json(links)
      }).catch(e => {
        next(e);
      });
    } else {
      next(new Error('save forbiden'));
    }
  });

  //return updated Links
  router.delete('/workspaceComponent/connection', function(req, res, next) {
    configuration = require('../configuration');
    let body = req.body;
    if (configuration.saveLock == false) {
      workspace_lib.removeConnection(req.body.workspaceId, req.body.linkId).then(links => {
        res.json(links)
      }).catch(e => {
        next(e);
      });
    } else {
      next(new Error('save forbiden'));
    }
  });

}
