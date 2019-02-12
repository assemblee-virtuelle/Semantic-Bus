var workspace_lib = require('../../core/lib/workspace_lib');
var workspace_component_lib = require('../../core/lib/workspace_component_lib');
var technicalComponentDirectory = require('./technicalComponentDirectory.js');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


module.exports = function(router, stompClient) {

  router.get('/workspaceByUser/:userId', function(req, res, next) {
    workspace_lib.getAll(req.params.userId, "owner").then(function(workspaces) {
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
    workspace_lib.get_workspace_graph_data(req.params.id).then((workspaceGraph) => {
      res.json({
        workspaceGraph
      })
    }).catch(e => {
      next(e);
    });
  }); //<= graph workspace

  // --------------------------------------------------------------------------------

  router.put('/workspace', function(req, res, next) {
    if (req.body != null) {
      workspace_lib.update(req.body).then(workspaceUpdate => {

        for (var c of workspaceUpdate.components) {
          if (technicalComponentDirectory[c.module] != null) {
            c.graphIcon = technicalComponentDirectory[c.module].graphIcon;
          } else {
            c.graphIcon = "default"
          }
        }
        res.send(workspaceUpdate);
      }).catch(e => {
        res.status(500).send(e);
      }).catch(e => {
        next(e);
      });
    } else {
      next(new Error('empty body'))
    }
  }) //<= update_workspace;

  // --------------------------------------------------------------------------------

  router.get('/workspace/:id', function(req, res, next) {
    workspace_lib.getWorkspace(req.params.id).then(function(workspace) {

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

  // --------------------------------------------------------------------------------

  router.get('/processByWorkflow/:id', function(req, res, next) {
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
        res.send(workspaceUpdate);
      })
    }
  })// <= put workspacerowId

  // --------------------------------------------------------------------------------

  router.post('/workspace/:id/addComponents', function(req, res, next) {
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
            }
            res.send(components);
          }).catch(e => {
            next(e);
          });
        }).catch(e => {
          next(e);
        });
      }).catch(e => {
        next(e);
      });
    } else {
      next(new Error('empty body'))
    }
  }) //<= addComponents;

  // --------------------------------------------------------------------------------

  router.post('/workspace/:id/import', function(req, res, next) {
    const newWorkspace = req.body;
    const newComponents = newWorkspace.components.map(c => {
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
      let workspaceLinks=[];
      for (let link of newLinks) {
        //addConnection return all connection and not only last created
        workspaceLinks = await workspace_lib.addConnection(workspace._id, link.source, link.target)
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
  })//<= import;

  // --------------------------------------------------------------------------------

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
      res.json(workspace)
    }).catch(e => {
      next(e);
    });
  }) //<= delete workspace

  // --------------------------------------------------------------------------------

  router.get('/workspaceComponent/load_all_component/:id', function(req, res, next) {
    var id = req.params.id;
    workspace_lib.load_all_component(id).then(function(data) {
      res.send(data)
    }).catch(e => {
      next(e);
    });
  }) //<= get_ConnectBeforeConnectAfter

  // --------------------------------------------------------------------------------

  router.get('/processState/:id', function(req, res, next) {
    var id = req.params.id;
    res.send({
      state: 'inprogress'
    });
  }.bind(this)); //<= process

  // --------------------------------------------------------------------------------

  //return updated Links
  router.post('/workspaceComponent/connection', function(req, res, next) {
    configuration = require('../configuration');
    let body = req.body;
    // if (configuration.saveLock == false) {
      workspace_lib.addConnection(req.body.workspaceId, req.body.source, req.body.target).then(links => {
        res.json(links)
      }).catch(e => {
        next(e);
      });
  });

  // --------------------------------------------------------------------------------

  //return updated Links
  router.delete('/workspaceComponent/connection', function(req, res, next) {
    configuration = require('../configuration');
    let body = req.body;
    // if (configuration.saveLock == false) {
      workspace_lib.removeConnection(req.body.workspaceId, req.body.linkId).then(links => {
        res.json(links)
      }).catch(e => {
        next(e);
      });
    // } else {
    //   next(new Error('save forbiden'));
    // }
  });

}
