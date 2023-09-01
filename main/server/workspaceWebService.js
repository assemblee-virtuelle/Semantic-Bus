const workspace_lib = require('../../core/lib/workspace_lib')
const user_lib = require('../../core').user
const auth_lib_jwt = require('../../core/lib/auth_lib')
const workspace_component_lib = require('../../core/lib/workspace_component_lib')
const fragment_lib = require('../../core/lib/fragment_lib')
const technicalComponentDirectory = require('./services/technicalComponentDirectory.js')
const securityService = require('./services/security')

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

function contains (a, obj) {
  if (obj != false) {
    var i = a.length
    while (i--) {
      // console.log(a[i]);
      // console.log(obj._id);
      if (a[i]._id == obj._id) {
        return true
      }
    }
    return false
  }
} // <= contains

function UserIdFromToken (req) {
  const token = req.body.token || req.query.token || req.headers['authorization']
  token.split('')
  let tokenAfter = token.substring(4, token.length)
  const decodeToken = auth_lib_jwt.get_decoded_jwt(tokenAfter)
  return decodeToken.iss
}

module.exports = function (router) {
  // Get workspaces

  router.get('/workspaces/me/owner', function (req, res, next) {
    workspace_lib.getAll(UserIdFromToken(req), 'owner').then(function (workspaces) {
      res.json(workspaces)
    }).catch(e => {
      next(e)
    })
  }) // <= list_owned_workspace

  // ---------------------------------------------------------------------------------

  router.get('/workspaces/me/shared', function (req, res, next) {
    workspace_lib.getAll(UserIdFromToken(req), 'editor').then(function (workspaces) {
      res.json(workspaces)
    }).catch(e => {
      next(e)
    })
  }) // <= list_shared_workspace

    // ---------------------------------------------------------------------------------

    router.get('/workspaces/me/all', function (req, res, next) {
      workspace_lib.getAll(UserIdFromToken(req), undefined).then(function (workspaces) {
        res.json(workspaces)
      }).catch(e => {
        next(e)
      })
    }) // <= list_shared_workspace
  

  // ---------------------------------------------------------------------------------

  router.get('/workspaces/:id/graph', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'workflow'), function (req, res, next) {
    workspace_lib.get_workspace_graph_data(req.params.id).then((workspaceGraph) => {
      res.json({
        workspaceGraph
      })
    }).catch(e => {
      next(e)
    })
  }) // <= get_graph_workspace

  // --------------------------------------------------------------------------------

  router.get('/workspaces/:id', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'workflow'), function (req, res, next) {
    workspace_lib.getWorkspace(req.params.id).then(function (workspace) {
      for (var c of workspace.components) {
        if (technicalComponentDirectory[c.module] != null) {
          // console.log('ICON',technicalComponentDirectory[c.module].graphIcon);
          c.graphIcon = technicalComponentDirectory[c.module].graphIcon
        } else {
          c.graphIcon = 'default'
        }
        // console.log('-->',c);
      }
      // console.log(workspace);
      res.json(workspace)
    }).catch(e => {
      next(e)
    })
  }) // <= get_workspace

  // --------------------------------------------------------------------------------

  router.get('/workspaces/:id/process', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'workflow'), function (req, res, next) {
    workspace_lib.get_process_byWorkflow(req.params.id).then((workspaceProcess) => {
      res.json(workspaceProcess)
    }).catch(e => {
      next(e)
    })
  }) // <= get_workspace_workflow

  // --------------------------------------------------------------------------------

  router.get('/workspaces/:id/components/:componentId/process/:processId', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'workflow'), function (req, res, next) {
    const componentId = req.params.componentId
    const processId = req.params.processId
    workspace_component_lib.get_component_result(componentId, processId).then(function (data) {
      if (data !== undefined) {
        if (data.frag !== undefined) {
          fragment_lib.get(data.frag).then(frag => {
            if (frag != null) {
              data.data = frag.data
            } else {
              data.error = { error: "frag of cache doesn't exist" }
            }
            res.send(data)
          })
        } else {
          res.send(data)
        }
      } else {
        res.send(undefined)
      }
    }).catch(e => {
      next(e)
    })
  }) // <= get_workspace_workflow

  // --------------------------------------------------------------------------------

  router.post('/workspaces/:id/import', function (req, res, next) {
    const newWorkspace = req.body
    const newComponents = newWorkspace.components.map(c => {
      return {
        workspaceId: req.params.id,
        specificData: c.specificData || {},
        deeperFocusData: c.deeperFocusData || {},
        module: c.module,
        type: c.type,
        description: c.description,
        editor: c.editor,
        graphPositionX: c.graphPositionX,
        graphPositionY: c.graphPositionY
      }
    })

    workspace_lib.getWorkspace(req.params.id).then(async function (workspace) {
      let workspaceComponents = await workspace_component_lib.create(newComponents)
      workspace.components = workspaceComponents
      let idMapping = {}
      for (i = 0; i < newWorkspace.components.length; i++) {
        idMapping[newWorkspace.components[i]._id] = workspace.components[i]._id
      }
      let newLinks = newWorkspace.links.map(l => {
        return {
          source: idMapping[l.source],
          target: idMapping[l.target]
        }
      })
      let workspaceLinks = []
      for (let link of newLinks) {
        // addConnection return all connection and not only last created
        workspaceLinks = await workspace_lib.addConnection(workspace._id, link.source, link.target)
      }
      workspace.links = workspaceLinks
      workspace = await workspace_lib.update(workspace)

      for (var c of workspace.components) {
        if (technicalComponentDirectory[c.module] != null) {
          // console.log('ICON',technicalComponentDirectory[c.module].graphIcon);
          c.graphIcon = technicalComponentDirectory[c.module].graphIcon
        } else {
          c.graphIcon = 'default'
        }
      }
      res.send(workspace)
    }).catch(e => {
      next(e)
    })
  })// <= create_import;

  // --------------------------------------------------------------------------------

  router.post('/workspaces/', function (req, res, next) {
    let workspaceBody = req.body.workspace
    let userIdBody = UserIdFromToken(req)

    if (workspaceBody.components) {
      // dans le cas ou il n'y a pas de save à la création : save du WS et des comp
      if (workspaceBody.components.length > 0) {
        workspace_component_lib.create(workspaceBody.components).then(function (workspaceComponent) {
          workspaceBody.components = []
          workspaceBody.components.push(workspaceComponent._id)
          workspace_lib.create(userIdBody, workspaceBody).then(function (workspace) {
            res.send(workspace)
          })
        }).catch(e => {
          next(e)
        })
      } else {
        workspace_lib.create(userIdBody, workspaceBody).then(function (workspace) {
          res.send(workspace)
        }).catch(e => {
          next(e)
        })
      }
    } else {
      workspace_lib.create(userIdBody, workspaceBody).then(function (workspace) {
        res.send(workspace)
      }).catch(e => {
        next(e)
      })
    }
  }) // <= create_workspace

  // --------------------------------------------------------------------------------

  router.post('/workspaces/:id/components/connection', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'workflow'), function (req, res, next) {
    workspace_lib.addConnection(req.params.id, req.body.source, req.body.target).then(links => {
      res.json(links)
    }).catch(e => {
      next(e)
    })
  })// <= create_workspace_component_connexion #share

  // --------------------------------------------------------------------------------

  // WebService Who Listen AMQP

  router.delete('/workspaces/:id/components/connection', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'workflow'), function (req, res, next) {
    workspace_lib.removeConnection(req.params.id, req.body.linkId).then(links => {
      res.json(links)
    }).catch(e => {
      next(e)
    })
  }) // <= delete_connexion #share



  // --------------------------------------------------------------------------------

  router.delete('/workspaces/:id', (req, res, next) => securityService.wrapperSecurity(req, res, next, 'owner','workflow'), function (req, res, next) {
    workspace_lib.destroy(UserIdFromToken(req), req.params.id).then(function (workspace) {
      res.json(workspace)
    }).catch(e => {
      next(e)
    })
  }) // <= delete_workspace #share

  // --------------------------------------------------------------------------------

  router.delete('/workspaces/:id/components', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'workflow'), function (req, res, next) {
    workspace_component_lib.remove({
      _id: req.body._id
    }).then(() => {
      res.json(req.body)
    }).catch(e => {
      next(e)
    })
  })// <= delete_components #share

  // ---------------------------------------------------------------------------------

  router.put('/workspaces/:id/process/:processid?', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'workflow'), function (req, res, next) {
    workspace_lib.updateCurrentProcess(req.params.processid,req.params.id, req.body.state).then((workspaceProcess) => {
      res.json(workspaceProcess)
    }).catch(e => {
      next(e)
    })
  }) // <= update_process_workflow #share

  // --------------------------------------------------------------------------------

  router.put('/workspaces/:id/components', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'workflow'), function (req, res, next) {
    workspace_component_lib.update(req.body)
      .then((componentUpdated) => (res.json(componentUpdated)))
      .catch(e => {
        next(e)
      })
  })// <= update_component #share

  // --------------------------------------------------------------------------------

  router.put('/workspaces/:id/share', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'workflow'), function (req, res, next) {
    var workspace_id = req.params.id

    user_lib.get({
      'credentials.email': req.body.email
    }).then(async function (user) {
      if (user) {
        let workspaceOrigin = await workspace_lib.get_workspace_simple(workspace_id);
        workspaceOrigin.users=[...workspaceOrigin.users,{
          email: user.credentials.email,
          role : "editor"
        }]
        const updatedWorkspace = await workspace_lib.updateSimple(workspaceOrigin);
        const workspace = await workspace_lib.getWorkspace(workspace_id);
        for (var c of workspace.components) {
          if (technicalComponentDirectory[c.module] != null) {
            c.graphIcon = technicalComponentDirectory[c.module].graphIcon
          } else {
            c.graphIcon = 'default'
          }
        }
        res.send({
          user: user,
          workspace: workspace
        })
      } else {
        res.send(false)
      }
    }).catch(e => {
      next(e)
    })
  }) // <= update_share/workspace #share

 // --------------------------------------------------------------------------------
 router.delete('/workspaces/:id/share', (req, res, next) => securityService.wrapperSecurity(req, res, next, 'owner','workflow'), function (req, res, next) {
  // console.log('DELETE SHARE')
  const workspace_id = req.params.id

  user_lib.get({
    'credentials.email': req.body.email
  }).then(async function (user) {

    const IdOfConnectedUser = UserIdFromToken(req);
    console.log('delete share',user._id,IdOfConnectedUser)
    // const roleOfConenctedUser = workspace.users.filter()
    if (user && IdOfConnectedUser!= user._id) {
      let workspaceOrigin = await workspace_lib.get_workspace_simple(workspace_id);
      workspaceOrigin.users=workspaceOrigin.users.filter(u=>u.email!==user.credentials.email);
      console.log('workspace',workspaceOrigin)
      const updatedWorkspace = await workspace_lib.updateSimple(workspaceOrigin);
      const workspace = await workspace_lib.getWorkspace(workspace_id);
      for (var c of workspace.components) {
        if (technicalComponentDirectory[c.module] != null) {
          c.graphIcon = technicalComponentDirectory[c.module].graphIcon
        } else {
          c.graphIcon = 'default'
        }
      }
      res.send({
        user: user,
        workspace: workspace
      })
    } else {
      res.status(400).send({
        success: false,
        message: 'no_delete_owner'
      })
    }
  }).catch(e => {
    next(e)
  })
}) // <= delete_share/workspace #share

  // ---------------------------------------------------------------------------------

  router.put('/workspaces/:id', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'workflow'), function (req, res, next) {
    if (req.body != null) {
      workspace_lib.update(req.body).then(workspaceUpdate => {
        for (var c of workspaceUpdate.components) {
          if (technicalComponentDirectory[c.module] != null) {
            c.graphIcon = technicalComponentDirectory[c.module].graphIcon
          } else {
            c.graphIcon = 'default'
          }
        }
        res.send(workspaceUpdate)
      }).catch(e => {
        next(e)
      }).catch(e => {
        next(e)
      })
    } else {
      next(new Error('empty body'))
    }
  }) // <= update_workspace #share

  // ---------------------------------------------------------------------------------

  router.post('/workspaces/:id/components', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'workflow'), function (req, res, next) {
    if (req.body != null) {
      let components = req.body
      components.forEach(c => {
        c._id = undefined
        c.workspaceId = req.params.id
        c.specificData = c.specificData || {}
        c.connectionsBefore = []
        c.connectionsAfter = []
        c.consumption_history = []
      })
      workspace_component_lib.create(components).then(function (workspaceComponents) {
        workspace_lib.getWorkspace(req.params.id).then((workspace) => {
          workspace.components = workspace.components.concat(workspaceComponents)
          // console.log('control workspace hihi',workspace)
          workspace_lib.update(workspace).then(workspaceUpdated => {
            for (var c of components) {
              if (technicalComponentDirectory[c.module] != null) {
                // console.log('ICON',technicalComponentDirectory[c.module].graphIcon);
                c.graphIcon = technicalComponentDirectory[c.module].graphIcon
              } else {
                c.graphIcon = 'default'
              }
            }
            res.send(components)
          }).catch(e => {
            next(e)
          })
        }).catch(e => {
          next(e)
        })
      }).catch(e => {
        next(e)
      })
    } else {
      next(new Error('empty body'))
    }
  }) // <= add_components #share
}
