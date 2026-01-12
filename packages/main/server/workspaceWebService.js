const workspace_lib = require('@semantic-bus/core/lib/workspace_lib')
const user_lib = require('@semantic-bus/core').user
const auth_lib_jwt = require('@semantic-bus/core/lib/auth_lib')
const workspace_component_lib = require('@semantic-bus/core/lib/workspace_component_lib')
// const fragment_lib = require('@semantic-bus/core/lib/fragment_lib')
const fragment_lib = require('@semantic-bus/core/lib/fragment_lib_scylla')
const technicalComponentDirectory = require('./services/technicalComponentDirectory.js')
const securityService = require('./services/security')
const config = require('../config.json')
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
    workspace_lib.getAll(UserIdFromToken(req), 'owner', config).then(function (workspaces) {
      res.json(workspaces)
    }).catch(e => {
      next(e)
    })
  }) // <= list_owned_workspace

  // ---------------------------------------------------------------------------------

  router.get('/workspaces/me/shared', function (req, res, next) {
    workspace_lib.getAll(UserIdFromToken(req), 'editor', config).then(function (workspaces) {
      res.json(workspaces)
    }).catch(e => {
      next(e)
    })
  }) // <= list_shared_workspace

    // ---------------------------------------------------------------------------------

    router.get('/workspaces/me/all', function (req, res, next) {
      workspace_lib.getAll(UserIdFromToken(req), undefined, config).then(function (workspaces) {
        res.json(workspaces)
      }).catch(e => {
        next(e)
      })
    }) // <= list_shared_workspace
  

  // ---------------------------------------------------------------------------------
  // Get HTTP Provider/Consumer links - returns provider->consumers and consumer->provider mappings
  router.get('/workspaces/http-links', async function (req, res, next) {
    try {
      // console.log('[HTTP_LINKS] Route /workspaces/http-links called');
      
      // Helper function to parse URLs - extracts domain and path
      const parseUrl = (url) => {
        if (!url) return null;
        
        // Extract domain and path from full URL
        const fullUrlPattern = /^(https?:\/\/([^\/]+))(\/data\/api\/[^?#]+)/;
        const fullMatch = url.match(fullUrlPattern);
        
        if (fullMatch) {
          return {
            domain: fullMatch[2].toLowerCase(), // e.g., "localhost", "main", "api.example.com"
            path: fullMatch[3],                  // e.g., "/data/api/xxx"
            original: url
          };
        }
        
        // Relative URL starting with /data/api/
        const relativePattern = /^(\/data\/api\/[^?#]+)/;
        const relativeMatch = url.match(relativePattern);
        if (relativeMatch) {
          return {
            domain: null, // No domain specified
            path: relativeMatch[1],
            original: url
          };
        }
        
        // Just the component identifier (e.g., "696518bec4d126b4fab958cb-out")
        if (!url.includes('/')) {
          return {
            domain: null,
            path: '/data/api/' + url,
            original: url
          };
        }
        
        return null;
      };
      
      // Helper function to check if two domains are compatible
      // Domains are compatible if:
      // 1. Both are null (relative URLs)
      // 2. They are identical
      // 3. They are in the same equivalence group (e.g., localhost and main for dev)
      const areDomainsCompatible = (domain1, domain2) => {
        // Both null = compatible (relative URLs)
        if (!domain1 && !domain2) return true;
        
        // One null, one specified = compatible (relative matches any domain)
        if (!domain1 || !domain2) return true;
        
        // Exact match
        if (domain1 === domain2) return true;
        
        // Development environment aliases
        const devAliases = ['localhost', 'main', '127.0.0.1'];
        const isDomain1Dev = devAliases.includes(domain1);
        const isDomain2Dev = devAliases.includes(domain2);
        
        // Both are dev domains = compatible
        if (isDomain1Dev && isDomain2Dev) return true;
        
        // Different domains in production = NOT compatible
        return false;
      };
      
      // Get all workspaces for the user
      const workspacesList = await workspace_lib.getAll(UserIdFromToken(req), undefined, config);
      
      // Fetch full details for each workspace (including components)
      const workspaces = [];
      for (const ws of workspacesList) {
        try {
          const fullWorkspace = await workspace_lib.getWorkspace(ws._id);
          workspaces.push(fullWorkspace);
        } catch (e) {
          console.error('[HTTP_LINKS] Error fetching workspace', ws._id, ':', e.message);
        }
      }
      
      // Build mapping of provider URLs to provider info
      const providerByUrl = {};
      const providerLinks = {}; // provider._id -> [consumer infos]
      const consumerLinks = {}; // consumer._id -> provider info
      
      // First pass: collect all HTTP providers
      const providers = []; // Array of parsed provider info
      
      for (const workspace of workspaces) {
        if (workspace.components) {
          for (const component of workspace.components) {
            
            if ((component.module === 'httpProvider' || component.type === 'HTTP provider') && 
                component.specificData && component.specificData.url) {
              const providerUrl = component.specificData.url;
              const parsed = parseUrl(providerUrl);
              
              if (parsed) {
                providers.push({
                  componentId: component._id,
                  componentName: component.name,
                  workspaceId: workspace._id,
                  workspaceName: workspace.name,
                  originalUrl: providerUrl,
                  domain: parsed.domain,
                  path: parsed.path
                });
                providerLinks[component._id] = [];
              }
            }
          }
        }
      }
      
      // Second pass: find consumers and link them to providers
      for (const workspace of workspaces) {
        if (workspace.components) {
          for (const component of workspace.components) {
            if ((component.module === 'httpConsumer' || component.type === 'HTTP consumer') && 
                component.specificData && component.specificData.url) {
              const consumerUrl = component.specificData.url;
              const consumerParsed = parseUrl(consumerUrl);
              
              if (!consumerParsed) continue;
              
              // Find matching provider with same path AND compatible domain
              for (const provider of providers) {
                // Check if paths match
                if (provider.path !== consumerParsed.path) continue;
                
                // Check if domains are compatible
                if (!areDomainsCompatible(provider.domain, consumerParsed.domain)) {
                  continue;
                }
                
                consumerLinks[component._id] = {
                  providerComponentId: provider.componentId,
                  providerComponentName: provider.componentName,
                  providerWorkspaceId: provider.workspaceId,
                  providerWorkspaceName: provider.workspaceName,
                  providerUrl: provider.originalUrl
                };
                
                // Add consumer to provider's list
                providerLinks[provider.componentId].push({
                  consumerComponentId: component._id,
                  consumerComponentName: component.name || '',
                  consumerWorkspaceId: workspace._id,
                  consumerWorkspaceName: workspace.name,
                  consumerUrl: consumerUrl
                });
                
                // Stop after first match (one consumer can only link to one provider)
                break;
              }
            }
          }
        }
      }

      // Build providersByUrl map for URL search feature
      const providersByUrl = {};
      for (const provider of providers) {
        providersByUrl[provider.path] = {
          componentId: provider.componentId,
          componentName: provider.componentName,
          workspaceId: provider.workspaceId,
          workspaceName: provider.workspaceName,
          originalUrl: provider.originalUrl
        };
      }

      res.json({
        consumerLinks,   // consumer._id -> provider info
        providerLinks,   // provider._id -> [consumer infos]
        providersByUrl   // path -> provider info (for URL search)
      });
    } catch (e) {
      console.error('[HTTP_LINKS] Error:', e);
      next(e);
    }
  }); // <= get_http_links

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
          c.graphIcon = technicalComponentDirectory[c.module].graphIcon;
          c.secondFlowConnector = technicalComponentDirectory[c.module].secondFlowConnector
        } else {
          c.graphIcon = 'default';
          c.secondFlowConnector = false;
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
    // console.log('___req.params', req.params)
    const componentId = req.params.componentId
    const processId = req.params.processId
    
    //return historicEnd
    workspace_component_lib.get_component_result(componentId, processId).then(function (data) {
      if (data !== undefined) {
        // console.log('___data', data)
        if (data.frag !== undefined) {
          fragment_lib.get(data.frag).then(frag => {
            // console.log('___frag', frag)
            if (frag != null) {
              data.data = frag.data
            } else {
              data.error = { error: "frag of cache doesn't exist" }
            }
            // console.log('___data', data)
            res.send(data)
          }).catch(e => {
            // next(e)
          })


          // fragment_lib.get(data.frag).then(frag => {
          //   if (frag != null) {
          //     data.data = frag.data
          //   } else {
          //     data.error = { error: "frag of cache doesn't exist" }
          //   }
          //   res.send(data)
          // })
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
    workspace_lib.addConnection(req.params.id, req.body.source, req.body.target, req.body.input).then(links => {
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

  router.put('/workspaces/:id/process/:processid', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'workflow'), function (req, res, next) {
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
      // console.log('workspace',workspaceOrigin)
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

  router.post('/workspaces/:id/components', (req, res, next) => securityService.wrapperSecurity(req, res, next,undefined,'workflow'), async function (req, res, next) {
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
      const workspaceComponents=  await  workspace_component_lib.create(components);
      const workspace = await workspace_lib.getWorkspace(req.params.id);
      workspace.components = workspace.components.concat(workspaceComponents);
      const workspaceUpdated = await workspace_lib.update(workspace);
      for (var c of workspaceComponents) {
        if (technicalComponentDirectory[c.module] != null) {
          // console.log('ICON',technicalComponentDirectory[c.module].graphIcon);
          c.graphIcon = technicalComponentDirectory[c.module].graphIcon
        } else {
          c.graphIcon = 'default'
        }
      }
      res.send(workspaceComponents);

    } else {
      next(new Error('empty body'))
    }
  }) // <= add_components #share
}

