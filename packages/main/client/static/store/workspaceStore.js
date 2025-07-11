/**
 * @module WorkspaceStore
 * 
 * @description
 * This module manages the workspace state and interactions within the application.
 * It provides methods for loading, updating, and managing workspaces and their components.
 * 
 * @param {Object} utilStore - Utility store for making AJAX calls.
 * @param {Array} specificStoreList - List of specific stores to be associated with the workspace.
 * 
 * @fires WorkspaceStore#workspace_graph_compute_done
 * @fires WorkspaceStore#workspace_current_process_changed
 * @fires WorkspaceStore#ajax_fail
 * @fires WorkspaceStore#ajax_success
 * @fires WorkspaceStore#workspace_current_changed
 * @fires WorkspaceStore#workspace_collection_changed
 * @fires WorkspaceStore#workspace_share_collection_changed
 * @fires WorkspaceStore#navigation_control_done
 * @fires WorkspaceStore#item_current_changed
 * @fires WorkspaceStore#item_curent_connect_show_changed
 * @fires WorkspaceStore#graph_position_from_store
 * @fires WorkspaceStore#share_change
 * @fires WorkspaceStore#share_change_no_valide
 * @fires WorkspaceStore#share_change_already
 * @fires WorkspaceStore#previewJSON
 * @fires WorkspaceStore#process_result
 * @fires WorkspaceStore#component_current_connections_changed
 * @fires WorkspaceStore#workspace_editor_menu_changed
 * @fires WorkspaceStore#item_current_process_persist_changed
 * @fires WorkspaceStore#workspace_graph_selection_changed
 * @fires WorkspaceStore#persist_start
 * @fires WorkspaceStore#persist_end
 * @fires WorkspaceStore#item_current_editor_changed
 * @fires WorkspaceStore#graph_workspace_data_loaded
 * @fires WorkspaceStore#ajax_sucess
 * @fires WorkspaceStore#workspace_current_components_changed
 * 
 * @event WorkspaceStore#update_graph_on_store
 * @description Triggered to update the graph position on the store.
 * 
 * @event WorkspaceStore#get_graph_position_on_store
 * @description Triggered to get the graph position from the store.
 * 
 * @event WorkspaceStore#load_workspace_graph
 * @description Triggered to load the workspace graph data.
 * 
 * @event WorkspaceStore#stop_current_process
 * @description Triggered to stop the current process.
 * 
 * @event WorkspaceStore#item_persist
 * @description Triggered to persist an item.
 * 
 * @event WorkspaceStore#share-workspace
 * @description Triggered to share a workspace.
 * 
 * @event WorkspaceStore#delete-share-workspace
 * @description Triggered to delete a shared workspace.
 * 
 * @event WorkspaceStore#navigation
 * @description Triggered for navigation within the workspace.
 * 
 * @event WorkspaceStore#workspace_graph_compute
 * @description Triggered to compute the workspace graph.
 * 
 * @event WorkspaceStore#component_current_set
 * @description Triggered to set the current component.
 * 
 * @event WorkspaceStore#connection_current_set
 * @description Triggered to set the current connection.
 * 
 * @event WorkspaceStore#workspace_delete
 * @description Triggered to delete a workspace.
 * 
 * @event WorkspaceStore#workspace_collection_load
 * @description Triggered to load the workspace collection.
 * 
 * @event WorkspaceStore#workspace_collection_share_load
 * @description Triggered to load the shared workspace collection.
 * 
 * @event WorkspaceStore#workspace_current_updateField
 * @description Triggered to update a field in the current workspace.
 * 
 * @event WorkspaceStore#workspace_current_export
 * @description Triggered to export the current workspace.
 * 
 * @event WorkspaceStore#workspace_current_import
 * @description Triggered to import a workspace.
 * 
 * @event WorkspaceStore#previewJSON_refresh
 * @description Triggered to refresh the JSON preview.
 * 
 * @event WorkspaceStore#workspace_current_process_refresh
 * @description Triggered to refresh the current process in the workspace.
 * 
 * @event WorkspaceStore#workspace_current_process_refresh_from_server
 * @description Triggered to refresh the current process from the server.
 * 
 * @event WorkspaceStore#workspace_current_process_select
 * @description Triggered to select a process in the current workspace.
 * 
 * @event WorkspaceStore#workspace_current_refresh
 * @description Triggered to refresh the current workspace.
 * 
 * @event WorkspaceStore#workspace_current_persist
 * @description Triggered to persist the current workspace.
 * 
 * @event WorkspaceStore#set_componentSelectedToAdd
 * @description Triggered to set the component selected to add.
 * 
 * @event WorkspaceStore#workspace_current_components_refresh
 * @description Triggered to refresh the components in the current workspace.
 * 
 * @event WorkspaceStore#workspace_current_add_components
 * @description Triggered to add components to the current workspace.
 * 
 * @event WorkspaceStore#workspace_current_delete_component
 * @description Triggered to delete a component from the current workspace.
 * 
 * @event WorkspaceStore#set-email-to-share
 * @description Triggered to set the email for sharing a workspace.
 * 
 * @event WorkspaceStore#item_current_connect_before_show
 * @description Triggered to show the connect before mode for the current item.
 * 
 * @event WorkspaceStore#item_current_connect_before_second_show
 * @description Triggered to show the connect before second mode for the current item.
 * 
 * @event WorkspaceStore#item_current_connect_after_show
 * @description Triggered to show the connect after mode for the current item.
 * 
 * @event WorkspaceStore#connect_components
 * @description Triggered to connect components.
 * 
 * @event WorkspaceStore#disconnect_components
 * @description Triggered to disconnect components.
 * 
 * @event WorkspaceStore#item_current_persist
 * @description Triggered to persist the current item.
 * 
 * @event WorkspaceStore#component_preview
 * @description Triggered to preview a component.
 * 
 * @event WorkspaceStore#component_current_connections_refresh
 * @description Triggered to refresh the current component's connections.
 * 
 * @event WorkspaceStore#component_current_refresh
 * @description Triggered to refresh the current component.
 * 
 * @event WorkspaceStore#item_current_work
 * @description Triggered to work on the current item.
 * 
 * @event WorkspaceStore#item_current_updateField
 * @description Triggered to update a field in the current item.
 * 
 * @event WorkspaceStore#workspace_current_move_component
 * @description Triggered to move a component in the current workspace.
 * 
 * @function setStompClient
 * @description Sets the STOMP client and subscribes to components if a workspace is current.
 * @param {Object} stompClient - The STOMP client instance.
 * 
 * @function computeGraph
 * @description Computes the graph layout for the current workspace.
 * @param {Object} viewBox - The viewBox dimensions for the graph.
 * @param {Object} position - The position of the graph.
 * 
 * @function initializeNewWorkspace
 * @description Initializes a new workspace with default values.
 * @param {String} entity - The entity type.
 * @param {String} action - The action to be performed.
 * 
 * @function reloadWorkspace
 * @description Reloads the current workspace and triggers process change events.
 * @param {String} entity - The entity type.
 * @param {String} action - The action to be performed.
 * 
 * @function loadComponentPart
 * @description Loads a specific component part by ID.
 * @param {String} id - The ID of the component.
 * @param {String} action - The action to be performed.
 * 
 * @function refreshComponent
 * @description Refreshes the current component and triggers related events.
 * 
 * @function persistComponent
 * @description Persists the current component asynchronously.
 * 
 * @function loadProcesses
 * @description Loads processes for a given workspace ID.
 * @param {String} id - The ID of the workspace.
 * @returns {Promise} Resolves with the process collection.
 * 
 * @function load
 * @description Loads all workspaces for the current user.
 * @returns {Promise} Resolves with the workspace collection.
 * 
 * @function loadShareWorkspace
 * @description Loads shared workspaces for the current user.
 * @returns {Promise} Resolves with the shared workspace collection.
 * 
 * @function create
 * @description Creates a new workspace.
 * @returns {Promise} Resolves with the created workspace.
 * 
 * @function update
 * @description Updates the current workspace.
 * @returns {Promise} Resolves with the updated workspace data.
 * 
 * @function delete
 * @description Deletes a specified workspace.
 * @param {Object} record - The workspace record to delete.
 * 
 * @function select
 * @description Selects a workspace by ID and loads its data.
 * @param {Object} record - The workspace record to select.
 * @returns {Promise} Resolves with the selected workspace data.
 * 
 * @function updateComponent
 * @description Updates a specific component within the workspace.
 * @returns {Promise} Resolves with the updated component data.
 * 
 * @function subscribeToComponents
 * @description Subscribes to component-related events via STOMP.
 * 
 * @function unsubscribeToPreviousSubscription
 * @description Unsubscribes from previous STOMP subscriptions.
 */

function WorkspaceStore (utilStore, specificStoreList) {
  riot.observable(this)
  for (specificStore of specificStoreList) {
    specificStore.genericStore = this
  }
  this.workspaceCollection
  this.workspaceShareCollection
  this.workspaceCurrent
  this.workspaceBusiness = new WorkspaceBusiness()
  this.componentSelectedToAdd = []
  this.modeConnectBefore = false
  this.modeConnectAfter = false
  this.utilStore = utilStore
  this.processCollection = []
  this.currentProcess = undefined
  this.itemCurrent
  this.connectMode
  this.modeConnectBefore = false
  this.modeConnectAfter = false
  this.position = {}

  this.setStompClient = function(stompClient){
    this.stompClient = stompClient;
    if(this.workspaceCurrent){
      this.subscribeToComponents();
    }
  }

  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // ----------------------workspace_collection_load----------------------------------------------------------

  // ----------------------------------------- FUNCTION  -----------------------------------------

  this.computeGraph = function (viewBox, position) {
    // console.log('compute graph',this.workspaceCurrent)
    let componentsId = this.workspaceCurrent.components.map(c => c._id)
    // console.log('componentsId',componentsId)
    this.workspaceCurrent.links = sift({
      $and: [{
        source: {
          $in: componentsId
        }
      }, {
        target: {
          $in: componentsId
        }
      }]
    }, this.workspaceCurrent.links)
    if (viewBox) {
      this.viewBox = viewBox
    }

    var selectedNodes = []
    var selectedLinks = []
    if (this.graph != undefined) {
      selectedNodes = sift({
        selected: true
      }, this.graph.nodes).map(n => n.id)
      selectedLinks = sift({
        selected: true
      }, this.graph.links).map(n => n.id)
    } else {
      this.graph = {}
    }

    this.graph.transform = this.workspaceCurrent.transform
    this.graph.nodes = []
    this.graph.links = []
    this.graph.workspace = this.workspaceCurrent
    this.graph.x = (window.screen.height + (0.2 * window.screen.height)) / 2
    this.graph.y = (window.screen.height - (0.1 * window.screen.height)) / 2

    let CompteConnexion = {}
    for (let record of this.workspaceCurrent.components) {
      let connectionsBefore = sift({
        target: record._id
      }, this.workspaceCurrent.links)
      let connectionsAfter = sift({
        source: record._id
      }, this.workspaceCurrent.links)
      let connectionsBeforeSecond = sift({
        target: record._id,
        targetInput: 'second'
      }, this.workspaceCurrent.links)
      var node = {
        text: record.type,
        id: record._id,
        graphIcon: record.graphIcon,
        secondFlowConnector : record.secondFlowConnector,
        component: record
      }
      CompteConnexion[record._id] = {}
      CompteConnexion[record._id].connectionsBefore = connectionsBefore.length
      CompteConnexion[record._id].connectionsAfter = connectionsAfter.length
      CompteConnexion[record._id].connectionsBeforeSecond = connectionsBeforeSecond.length

      if (this.currentProcess !== undefined) {
        let step = sift({
          componentId: record._id
        }, this.currentProcess.steps)[0]
        if (step != undefined) {
          node.status = step.status
        }
      }
      if (connectionsBefore.length == 0 && record.graphPositionX == undefined && record.graphPositionY == undefined) {
        // si rien n est connecte avant
        node.x = 30
        node.y = 0
      } else if (connectionsAfter.length == 0 && record.graphPositionX == undefined && record.graphPositionY == undefined) {
        node.x = 0
        node.y = 0
      } else { // tous ceux du milieu
        node.x = record.graphPositionX || 0
        node.y = record.graphPositionY || 0
      }

      node.connectionsBefore = connectionsBefore.length
      node.connectionsAfter = connectionsAfter.length
      node.connectionsBeforeSecond = connectionsBeforeSecond.length;

      this.graph.x += -node.x
      this.graph.y += -node.y

      if (selectedNodes.indexOf(node.id) !== -1) {
        node.selected = true
      }

      this.graph.nodes.push(node)
    }
    for (let link of this.workspaceCurrent.links) {
      let id = link._id
      this.graph.links.push({
        source: sift({
          id: link.source
        }, this.graph.nodes)[0],
        target: sift({
          id: link.target
        }, this.graph.nodes)[0],
        id: id,
        targetInput : link.targetInput,
        scb: CompteConnexion[link.source].connectionsBefore,
        sca: CompteConnexion[link.source].connectionsAfter,
        tcb: CompteConnexion[link.target].connectionsBefore,
        tca: CompteConnexion[link.target].connectionsAfter,
        selected: selectedLinks.indexOf(id) !== -1
      })
    }

    this.trigger('workspace_graph_compute_done', {graph: this.graph, position })
  }

  // --------------------------------------------------------------------------------

  this.initializeNewWorkspace = function (entity, action) {
    this.workspaceCurrent = {
      name: '',
      description: '',
      components: [],
      users: [],
      links: [],
      limitHistoric:1,
    }
    this.action = action
    this.workspaceCurrent.mode = 'init'
  }

  // --------------------------------------------------------------------------------

  this.reloadWorkspace = function (entity, action) {
    this.action = action
    this.trigger('workspace_current_process_changed', this.processCollection)
  }

  // --------------------------------------------------------------------------------

  this.loadComponentPart = function (id, action) {
    this.action = action
    if (this.workspaceCurrent !== undefined) {
      this.itemCurrent = sift({ _id: id }, this.workspaceCurrent.components)[0]
      if (this.itemCurrent === undefined) {
        this.trigger('ajax_fail', 'no component existing with this id un current workspace')
      }
    } else {
      this.trigger('ajax_fail', 'the component can not be loaded without first loading its workspace')
    }
  }

  // --------------------------------------------------------------------------------

  this.refreshComponent = function () {
    this.trigger('item_current_editor_changed', this.itemCurrent.editor)
    this.modeConnectBefore = false
    this.modeConnectAfter = false
    this.trigger('item_curent_connect_show_changed', {
      before: this.modeConnectBefore,
      after: this.modeConnectAfter
    })
    this.trigger('item_current_changed', this.itemCurrent)
  }

  // --------------------------------------------------------------------------------

  this.persistComponent = async () => {
    let data = await this.updateComponent()
    route('workspace/' + data.workspaceId + '/component')
  } // <= persist

  // ----------------------------------------- API CALL  -----------------------------------------

  this.loadProcesses = function (id) {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'get',
        url: '../data/core/workspaces/' + id + '/process'
      }, true)
        .then(data => {
          this.processCollection = data

          this.processCollection.forEach(process => {
            let waitingNB = sift({
              status: 'waiting'
            }, process.steps).length
            let errorNB = sift({
              status: 'error'
            }, process.steps).length
            if (errorNB > 0) {
              process.status = 'error'
            } else {
              if (waitingNB > 0) {
                process.status = 'waiting'
              } else {
                process.status = 'resolved'
              }
            }
            process.stepFinished = process.steps.length - waitingNB
          })
          console.log('---- load current process ---', this.processCollection[0])
          resolve(this.processCollection[0])
          this.trigger('workspace_current_process_changed', this.processCollection)
        })
    })
  }

  // --------------------------------------------------------------------------------

  this.load = function () {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'get',
        url: '../data/core/workspaces/me/all'
      }, true).then(data => {
        this.workspaceCollection = data
        resolve(this.workspaceCollection)
      }).catch(error => {
        reject(error)
      })
    })
  } // <= load_workspace

  // --------------------------------------------------------------------------------

  this.loadShareWorkspace = function () {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'get',
        url: '../data/core/workspaces/me/shared'
      }, true).then(data => {
        this.workspaceShareCollection = data
        resolve(this.workspaceShareCollection)
      }).catch(error => {
        reject(error)
      })
    })
  } // <= load_share_workspace

  // --------------------------------------------------------------------------------

  this.create = function () {
    return new Promise((resolve, reject) => {
      return this.utilStore.ajaxCall({
        method: 'post',
        url: '../data/core/workspaces/',
        data: JSON.stringify({ workspace: this.workspaceCurrent })
      }, true)
        .then(createdWorkspace => {
          //refresh workflows list
          // this.load();
          // this.workspaceCurrent = createdWorkspace;
          // this.workspaceCurrent.mode = 'edit';
          resolve(createdWorkspace);
        }).catch(error => {
          reject(error)
        })

    });

  } // <= create

  // --------------------------------------------------------------------------------

  this.update = function () {
    return new Promise((resolve, reject) => {
      const fetchData = JSON.stringify(this.workspaceBusiness.serialiseWorkspace(this.workspaceCurrent))
      this.trigger('persist_start')
      this.utilStore.ajaxCall({
        method: 'put',
        url: '../data/core/workspaces/' + this.workspaceCurrent._id,
        data: fetchData,
        contentType: 'application/json',
        headers: {
          'Authorization': 'JTW' + ' ' + localStorage.token
        }
      }).then(function (data) {
        this.trigger('persist_end', data)
        data.mode = 'edit'
        // update only necessery champ
        this.workspaceCurrent.description = data.description
        this.workspaceCurrent.name = data.name
        this.workspaceCurrent.limitHistoric = data.limitHistoric
        this.workspaceCurrent.engineVersion = data.engineVersion
        this.trigger('ajax_sucess', `Votre workspace à été mis à jour`)
        this.trigger('workspace_current_changed', this.workspaceCurrent)
        if (this.viewBox) {
          this.computeGraph()
        }
        resolve(data)
      }.bind(this))
    })
  } // <= update

  // --------------------------------------------------------------------------------

  this.delete = function (record) {
    this.trigger('persist_start')
    this.utilStore.ajaxCall({
      method: 'delete',
      url: '../data/core/workspaces/' + record._id,
      contentType: 'application/json',
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      }
    }).then(function (data) {
      this.workspaceCollection = sift({
        '_id': {
          $ne: record._id
        }
      }, this.workspaceCollection)
      this.trigger('persist_end', data)
      this.trigger('workspace_collection_changed', this.workspaceCollection)
    }.bind(this))
  } // <= delete

  // --------------------------------------------------------------------------------

  this.select = function (record) {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'get',
        url: '../data/core/workspaces/' + record._id
      }, true).then(data => {
        this.workspaceCurrent = data
        this.workspaceCurrent.mode = 'edit'
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  } // <= select

  // --------------------------------------------------------------------------------

  this.updateComponent = function () {
    return new Promise((resolve, reject) => {
      utilStore.ajaxCall({
        method: 'put',
        url: '../data/core/workspaces/' + this.itemCurrent.workspaceId + '/components',
        data: JSON.stringify(this.workspaceBusiness.serialiseWorkspaceComponent(this.itemCurrent))
      }, true).then(data => {
        this.itemCurrent = data
        console.log('after call', this.itemCurrent)
        this.trigger('workspace_current_changed', this.workspaceCurrent)
        resolve(this.itemCurrent)
      })
    })
  } // <= update

  // --------------------------------------------------------------------------------

  this.on('update_graph_on_store', (position) => {
    this.position = position
  })

  this.on('get_graph_position_on_store', () => {
    this.trigger('graph_position_from_store', this.position)
  })

  // --------------------------------------------------------------------------------

  this.on('load_workspace_graph', function () {
    this.utilStore.ajaxCall({
      method: 'get',
      url: '../data/core/workspaces/' + this.workspaceCurrent._id + '/graph',
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).then(function (data) {
      this.trigger('graph_workspace_data_loaded', data)
    }.bind(this))
  })

  // --------------------------------------------------------------------------------

  this.on('stop_current_process', () => {
    let url = '../data/core/workspaces/' + this.workspaceCurrent._id + '/process/' + (this.currentProcess?._id!=undefined?this.currentProcess?._id:'');
    console.log('url',url)
    this.utilStore.ajaxCall({
      method: 'put',
      url ,
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json',
      data: JSON.stringify({ state: 'stop' })
    }).then((data) => {
      // console.log(data)
    })
  })

  // --------------------------------------------------------------------------------

  this.on('item_persist', function (item) {
    this.utilStore.ajaxCall({
      method: 'put',
      url: '../data/core/workspaces/' + item.workspaceId + '/components',
      data: JSON.stringify(this.workspaceBusiness.serialiseWorkspaceComponent(item))
    }, true).then(data => {
      item = data
      this.trigger('workspace_current_changed', this.workspaceCurrent)
      if (this.viewBox) {
        this.computeGraph()
      }
    }).catch(error => {
      throw error
    })
  })

  // --------------------------------------------------------------------------------

  this.on('share-workspace', function (data) {
    this.utilStore.ajaxCall({
      method: 'put',
      url: '../data/core/workspaces/' + this.workspaceCurrent._id + '/share',
      data: JSON.stringify({
        email: this.emailToShare
      }),
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).then(function (data) {
      if (data == false) {
        this.trigger('share_change_no_valide')
      } else if (data == 'already') {
        this.trigger('share_change_already')
      } else {
        this.workspaceCurrent = data.workspace
        this.workspaceCurrent.mode = 'edit'
        this.trigger('share_change', {
          user: data.user,
          workspace: data.workspace
        })
        route('workspace/' + data.workspace._id + '/user')
      }
    }.bind(this))
  })

  // --------------------------------------------------------------------------------

  this.on('delete-share-workspace', (data) => {
    //console.log('delete-share-workspace')
    this.utilStore.ajaxCall({
      method: 'delete',
      url: '../data/core/workspaces/' + this.workspaceCurrent._id + '/share',
      data: JSON.stringify({
        email: data.email
      }),
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).then((data) => {
      this.workspaceCurrent.users = data.workspace.users
      this.workspaceCurrent.mode = 'edit'
      this.trigger('workspace_current_changed', this.workspaceCurrent)
    })
  })

  // ----------------------------------------- EVENT  -----------------------------------------

  this.on('navigation', function (entity, id, action, secondId, secondAction) {
    if (entity === 'workspace') {
      console.log('NAVIGATION', id,action);
      this.action=action;
      if (id === 'new') {
        this.initializeNewWorkspace(entity, action)
        this.trigger('navigation_control_done', entity, action)
      } else if (this.workspaceCurrent !== undefined && this.workspaceCurrent._id === id) {
        console.log('NO RELOAD');
        this.reloadWorkspace(entity, action)
        if (action === 'component' && secondId !== undefined) {
          this.loadComponentPart(secondId, secondAction)
          this.trigger('navigation_control_done', 'workspace', secondAction)
        } else {
          this.trigger('navigation_control_done', entity, action, secondAction)
        }
      } else {
        this.loadProcesses(id).then((process) => {
          this.currentProcess = process
          this.unsubscribeToPreviousSubscription()
          this.select({ _id: id }).then(() => {
            this.subscribeToComponents()
            if (action === 'component' && secondId !== undefined) {
              this.loadComponentPart(secondId, secondAction)
              this.trigger('navigation_control_done', 'workspace', secondAction)
            } else {
              this.trigger('navigation_control_done', entity, action, secondAction)
            }
          })
        })
      }
    }
  })

  // --------------------------------------------------------------------------------

  this.on('workspace_graph_compute', function (viewBox) {
    this.computeGraph(viewBox)
  })

  // --------------------------------------------------------------------------------

  this.on('component_current_set', function (data) {
    console.log('component_current_set_1')
    this.graph.nodes.forEach(n => {
      n.selected = false;
      n.connectBeforeMode = false;
      n.connectBeforeSecondMode = false;
      n.connectAfterMode = false;
    })

    this.graph.links.forEach(l => {
      l.selected = false
    })
    if(data!=undefined){
      sift({
        'component._id': data._id
      }, this.graph.nodes).forEach(n => {
        n.selected = true
      })
    }
    console.log('graph',this.graph)
    this.trigger('workspace_graph_selection_changed', this.graph)
  })

  // --------------------------------------------------------------------------------

  this.on('component_current_set', function (data) {
    console.log('component_current_set_2')
    this.itemCurrent = data
  })
  

  // --------------------------------------------------------------------------------

  this.on('connection_current_set', function (source, target, targetInput) {
    console.log(targetInput);
    this.graph.nodes.forEach(n => {
      n.selected = false
    })

    this.graph.links.forEach(l => {
      l.selected = false
    })

    sift({
      $and: [{
        'source.component._id': source._id
      }, {
        'target.component._id': target._id
      }, {
        'targetInput': targetInput
      }]
    }, this.graph.links).forEach(l => {
      l.selected = true
    })
    this.trigger('workspace_graph_selection_changed', this.graph)
  })

  // --------------------------------------------------------------------------------

  this.on('workspace_delete', function (record) {
    console.log('workspace_delete', record)
    this.delete(record)
  }) // <= workspace_delete

  // --------------------------------------------------------------------------------

  this.on('workspace_collection_load', function (record) {
    if (this.workspaceCollection === undefined) {
      this.load(this.workspaceCurrent).then(data => {
        this.trigger('workspace_collection_changed', this.workspaceCollection)
      })
    } else {
      this.trigger('workspace_collection_changed', this.workspaceCollection)
    }
  }) // <= workspace_collection_load

  // --------------------------------------------------------------------------------

  this.on('workspace_collection_share_load', function (record) {
    if (this.workspaceShareCollection == undefined) {
      this.loadShareWorkspace().then(data => {
        this.trigger('workspace_share_collection_changed', this.workspaceShareCollection)
      })
    } else {
      this.trigger('workspace_share_collection_changed', this.workspaceShareCollection)
    }
  }) // <= workspace_collection_share_load

  // --------------------------------------------------------------------------------

  this.on('workspace_current_updateField', function (message) {
    this.workspaceCurrent[message.field] = message.data
    console.log('this.workspaceCurrent',this.workspaceCurrent)
    this.workspaceCurrent.synchronized = false
    this.trigger('workspace_current_changed', this.workspaceCurrent)
  }) // <= workspace_current_updateField

  // --------------------------------------------------------------------------------

  this.on('workspace_current_export', function (anchor) {
    let exportObject = {
      components: this.workspaceCurrent.components,
      links: this.workspaceCurrent.links
    }
    let file = new File([JSON.stringify(exportObject)], this.workspaceCurrent.name.concat('.json'), {
      type: 'application/json'
    })
    let exportUrl = URL.createObjectURL(file)

    // anchor.prop('href', exportUrl);
    anchor.setAttribute('href', exportUrl)
    anchor.setAttribute('download', this.workspaceCurrent.name.concat('.json'))
    anchor.click()

    // window.open(exportUrl);
  })

  // --------------------------------------------------------------------------------

  this.on('workspace_current_import', function (file) {
    let reader = new FileReader()
    reader.onload = function (e) {
      let newWorkflow = JSON.parse(e.target.result)
      this.utilStore.ajaxCall({
        method: 'post',
        url: '../data/core/workspaces/' + this.workspaceCurrent._id + '/import',
        data: JSON.stringify(newWorkflow)
      }, true).then((updatedWorkspace) => {
        this.workspaceCurrent = updatedWorkspace
        this.workspaceCurrent.mode = 'edit'
        route('workspace/' + this.workspaceCurrent._id + '/component')
      })
    }.bind(this)
    reader.readAsText(file)
  })

  // --------------------------------------------------------------------------------

  this.on('previewJSON_refresh', function () {
    this.trigger('previewJSON', this.currentPreview)
  }) //

  // --------------------------------------------------------------------------------

  this.on('workspace_current_process_refresh', function () {
    this.trigger('workspace_current_process_changed', this.processCollection)
  }) // <= workspace_current_refresh

  this.on('workspace_current_process_refresh_from_server', function () {
    this.loadProcesses(this.workspaceCurrent._id);
  }) // <= workspace_current_refresh

  // --------------------------------------------------------------------------------

  this.on('workspace_current_process_select', function (process) {
    this.currentProcess = process
    this.workspaceCurrent.status = process.status
    this.trigger('workspace_current_changed', this.workspaceCurrent)
    route('workspace/' + this.workspaceCurrent._id + '/component')
  })

  // --------------------------------------------------------------------------------

  this.on('workspace_current_refresh', function () {
    this.trigger('workspace_editor_menu_changed', this.action)
    this.trigger('workspace_current_changed', this.workspaceCurrent)
  }) // <= workspace_current_refresh

  // --------------------------------------------------------------------------------

  this.on('workspace_current_persist', function () {
    var mode = this.workspaceCurrent.mode
    if (mode == 'init') {
      this.create().then(ws => {
        route('workspace/' + ws._id + '/component')
      })
    } else if (mode == 'edit') {
      this.update(this.workspaceCurrent).then(data => {
        // nothing to do. specific action in other case
      })
    }
  }.bind(this)) // <= workspace_current_persist

  // --------------------------------------------------------------------------------

  this.on('set_componentSelectedToAdd', function (message) {
    this.componentSelectedToAdd = message
  }) // <= workspace_current_updateField

  // --------------------------------------------------------------------------------

  this.on('workspace_current_components_refresh', function () {
    this.trigger('workspace_current_components_changed', this.workspaceCurrent.components)
  }.bind(this))

  this.on('workspace_current_add_components', function (position) {
    this.utilStore.ajaxCall({
      method: 'post',
      url: '../data/core/workspaces/' + this.workspaceCurrent._id + '/components',
      data: JSON.stringify(this.componentSelectedToAdd.map((c) => {
        c.graphPositionX=position.graphPositionX;
        c.graphPositionY=position.graphPositionY;
        return this.workspaceBusiness.serialiseWorkspaceComponent(c)
      }))
    }, true).then(data => {
      console.log('add data',data)
      this.workspaceCurrent.components = this.workspaceCurrent.components.concat(data)
      if (this.viewBox) {
        this.computeGraph(null, { x: 0, y: 0})
      }
    })
  }.bind(this))

  // --------------------------------------------------------------------------------

  this.on('workspace_current_delete_component', function (record) {
    this.utilStore.ajaxCall({
      method: 'delete',
      url: '../data/core/workspaces/' + record.workspaceId + '/components',
      data: JSON.stringify(this.workspaceBusiness.serialiseWorkspaceComponent(record))
    }, true).then(data => {
      sift({
        'connectionsAfter._id': record._id
      }, this.workspaceCurrent.components).forEach(beforeComp => {
        beforeComp.connectionsAfter.splice(beforeComp.connectionsAfter.indexOf(record), 1)
      })
      sift({
        'connectionsBefore._id': record._id
      }, this.workspaceCurrent.components).forEach(afterComp => {
        afterComp.connectionsBefore.splice(afterComp.connectionsBefore.indexOf(record), 1)
      })
      const indexComponent = this.workspaceCurrent.components.indexOf(record);
      this.workspaceCurrent.components.splice(this.workspaceCurrent.components.indexOf(record), 1)
      this.trigger('workspace_current_changed', this.workspaceCurrent)
      if (this.viewBox) {
        this.computeGraph()
      }
    })
  }) // <= workspace_current_delete_component

  // --------------------------------------------------------------------------------

  this.on('set-email-to-share', function (email) {
    this.emailToShare = email
  })

  // --------------------------------------------------------------------------------

  this.on('item_current_connect_before_show', function (data) {
    this.modeConnectBefore = !this.modeConnectBefore
    this.modeConnectBeforeSecond = false
    this.modeConnectAfter = false
    this.trigger('item_curent_connect_show_changed', {
      before: this.modeConnectBefore,
      beforeSecond: this.modeConnectBeforeSecond,
      after: this.modeConnectAfter
    })

    sift({
      selected: true
    }, this.graph.nodes).forEach(n => {
      n.connectBeforeMode = this.modeConnectBefore
      n.connectBeforeSecondMode = this.modeConnectBeforeSecond
      n.connectAfterMode = this.modeConnectAfter
    })

    sift({
      selected: false
    }, this.graph.nodes).forEach(n => {
      n.connectBeforeMode = false
      n.connectBeforeSecondMode = false
      n.connectAfterMode = false
    })

    this.trigger('workspace_graph_selection_changed', this.graph)
  })

  // --------------------------------------------------------------------------------

  this.on('item_current_connect_before_second_show', function (data) {
    this.modeConnectBefore = false
    this.modeConnectBeforeSecond = !this.modeConnectBeforeSecond
    this.modeConnectAfter = false
    this.trigger('item_curent_connect_show_changed', {
      before: this.modeConnectBefore,
      beforeSecond: this.modeConnectBeforeSecond,
      after: this.modeConnectAfter
    })

    sift({
      selected: true
    }, this.graph.nodes).forEach(n => {
      n.connectBeforeMode = this.modeConnectBefore
      n.connectBeforeSecondMode = this.modeConnectBeforeSecond
      n.connectAfterMode = this.modeConnectAfter
    })

    sift({
      selected: false
    }, this.graph.nodes).forEach(n => {
      n.connectBeforeMode = false
      n.connectBeforeSecondMode = false
      n.connectAfterMode = false
    })

    this.trigger('workspace_graph_selection_changed', this.graph)
  })

  // --------------------------------------------------------------------------------

  this.on('item_current_connect_after_show', function (data) {
    // not used
    this.modeConnectBefore = false
    this.modeConnectBeforeSecond = false
    this.modeConnectAfter = !this.modeConnectAfter
    this.trigger('item_curent_connect_show_changed', {
      before: this.modeConnectBefore,
      beforeSecond: this.modeConnectBeforeSecond,
      after: this.modeConnectAfter
    })
    //! not used

    sift({
      selected: true
    }, this.graph.nodes).forEach(n => {
      n.connectBeforeMode = this.modeConnectBefore
      n.connectBeforeSecondMode = this.modeConnectBeforeSecond
      n.connectAfterMode = this.modeConnectAfter
    })

    sift({
      selected: false
    }, this.graph.nodes).forEach(n => {
      n.connectBeforeMode = false
      n.connectBeforeSecondMode = false
      n.connectAfterMode = false
    })

    this.trigger('workspace_graph_selection_changed', this.graph)
  })

  // --------------------------------------------------------------------------------

  this.on('connect_components', function (source, target,input) {
    this.utilStore.ajaxCall({
      method: 'post',
      url: '../data/core/workspaces/' + this.workspaceCurrent._id + '/components/connection',
      data: JSON.stringify({
        source: source._id,
        target: target._id,
        input:input
      })
    }, true).then(links => {
      this.workspaceCurrent.links = links
      this.trigger('workspace_current_changed', this.workspaceCurrent)
      if (this.viewBox) {
        this.computeGraph()
      }
    })
  })

  // --------------------------------------------------------------------------------

  this.on('disconnect_components', function (link) {
    this.utilStore.ajaxCall({
      method: 'delete',
      url: '../data/core/workspaces/' + this.workspaceCurrent._id + '/components/connection',
      data: JSON.stringify({
        linkId: link.id
      })
    }, true).then(links => {
      this.workspaceCurrent.links = links
      this.trigger('workspace_current_changed', this.workspaceCurrent)
      if (this.viewBox) {
        this.computeGraph()
      }
    })
  })

  // --------------------------------------------------------------------------------

  this.on('item_current_persist', function (message) {
    this.persistComponent()
  }) // <=  item_current_persist

  // --------------------------------------------------------------------------------

  this.on('component_preview', () => {
    this.utilStore.ajaxCall({
      method: 'get',
      url: '../data/core/workspaces/' + this.workspaceCurrent._id + '/components/' + this.itemCurrent._id + '/process/' + this.currentProcess._id
    }, true).then(data => {
      this.currentPreview = data
      this.trigger('process_result', this.currentPreview)
    })
  })


  // --------------------------------------------------------------------------------

  this.on('component_current_connections_refresh', function () {
    let beforeLinks = sift({
      target: this.itemCurrent._id
    }, this.workspaceCurrent.links)
    let beforeComponents = sift({
      '_id': {
        '$in': beforeLinks.map(l => l.source)
      }
    }, this.workspaceCurrent.components)
    let afterLinks = sift({
      source: this.itemCurrent._id
    }, this.workspaceCurrent.links)
    let afterComponents = sift({
      '_id': {
        '$in': beforeLinks.map(l => l.target)
      }
    }, this.workspaceCurrent.components)
    this.trigger('component_current_connections_changed', {
      beforeComponents: beforeComponents,
      afterComponents: afterComponents
    })
  })

  // --------------------------------------------------------------------------------

  this.on('component_current_refresh', function () {
    this.refreshComponent()
  }) // <= item_current_select

  // ----------------------------------------- WEB STOMP CALL  -----------------------------------------

  this.on('item_current_work', function (message) {
    console.log('item_current_work',this.itemCurrent);
    this.stompClient.send('/queue/work-ask', JSON.stringify({
      id: this.itemCurrent._id,
      workspaceId: this.itemCurrent.workspaceId,
      callerId: localStorage.user_id
    }))
  }) // <= item_current_work

  // --------------------------------------------------------------------------------

  this.on('item_current_updateField', function (message) {
    utilStore.objectSetFieldValue(this.itemCurrent, message.field, message.data)
    // this.itemCurrent[message.field] = message.data;
    this.trigger('item_current_changed', this.itemCurrent)
    this.stompClient.send('/topic/workspace_current_updateComponentField.' + this.workspaceCurrent._id, JSON.stringify({
      field: message.field,
      data: message.data,
      componentId: this.itemCurrent._id,
      token: localStorage.token
    }))
  }) // <= item_current_updateField

  // --------------------------------------------------------------------------------

  this.on('workspace_current_move_component', function (component) {
    this.stompClient.send('/topic/workspace_current_move_component.' + this.workspaceCurrent._id, JSON.stringify({
      componentId: component.id,
      x: component.x,
      y: component.y,
      token: localStorage.token
    }))
  })

  // --------------------------------------------------------------------------------

  this.subscribeToComponents = function () {

    this.subscription_workspace_current_move_component = this.stompClient.subscribe('/topic/workspace_current_move_component.' + this.workspaceCurrent._id, message => {
      let body = JSON.parse(message.body)
      if (body.token !== localStorage.token) {
        let componentToUpdate = sift({
          _id: body.componentId
        }, this.workspaceCurrent.components)[0]
        componentToUpdate.graphPositionX = body.x
        componentToUpdate.graphPositionY = body.y
        this.computeGraph()
      }
    })
    this.subscription_workspace_current_updateComponentField = this.stompClient.subscribe('/topic/workspace_current_updateComponentField.' + this.workspaceCurrent._id, message => {
      let body = JSON.parse(message.body)
      if (body.token !== localStorage.token) {
        let updatingComponent = sift({
          _id: body.componentId
        }, this.workspaceCurrent.components)[0]
        utilStore.objectSetFieldValue(updatingComponent, body.field, body.data)
        // this.itemCurrent.specificData[body.field] = body.data;
        if (this.itemCurrent._id === updatingComponent._id) {
          this.trigger('item_current_changed', updatingComponent)
        }
      }
    })
    this.subscription_workspace_current_process_start = this.stompClient.subscribe('/topic/process-start.' + this.workspaceCurrent._id, message => {
      let body = JSON.parse(message.body)
      this.workspaceCurrent.status = 'running'
      this.trigger('workspace_current_changed', this.workspaceCurrent)
      if (body.error === undefined) {
        let process = {
          _id: body._id,
          status: 'processing',
          steps: body.steps,
          timeStamp: body.timeStamp,
          stepFinished: 0
        }
        this.workspaceCurrent.status = 'running'
        this.processCollection.unshift(process)
        if (body.callerId === localStorage.user_id) {
          this.currentProcess = process
          this.computeGraph()
        }
        this.trigger('workspace_current_process_changed', this.processCollection)
      } else {
        this.trigger('ajax_fail', body.error)
      }
    })
    this.subscription_workspace_current_process_end = this.stompClient.subscribe('/topic/process-end.' + this.workspaceCurrent._id, message => {
      let body = JSON.parse(message.body)
      if (body.error === undefined) {
        let targetProcess = sift({
          _id: body._id
        }, this.processCollection)[0]
        if (targetProcess !== undefined) {
          targetProcess.status = 'resolved'
          this.trigger('workspace_current_process_changed', this.processCollection)
        }
        console.log("process end")
        this.workspaceCurrent.status = 'resolved'
      } else {
        this.workspaceCurrent.status = 'error'
        this.trigger('ajax_fail', body.error)
      }
      this.trigger('workspace_current_changed', this.workspaceCurrent)
    })
    this.subscription_workspace_current_process_error = this.stompClient.subscribe('/topic/process-error.' + this.workspaceCurrent._id, message => {
      let body = JSON.parse(message.body)
      this.workspaceCurrent.status = 'error'
      this.trigger('workspace_current_changed', this.workspaceCurrent)
      if (body.error === undefined) {
        let targetProcess = sift({
          _id: body._id
        }, this.processCollection)[0]
        if (targetProcess !== undefined) {
          targetProcess.status = 'error'
          this.trigger('workspace_current_process_changed', this.processCollection)
        }
      } else {
        this.trigger('ajax_fail', body.error)
      }
    })
    this.subscription_workspace_current_process_error = this.stompClient.subscribe('/topic/process-information.' + this.workspaceCurrent._id, message => {
      let body = JSON.parse(message.body)
      // add switch case on information for more process info trigger
      this.workspaceCurrent.status = 'stoped'
      this.trigger('workspace_current_changed', this.workspaceCurrent)
      this.trigger('ajax_sucess', body.information)
    })
    this.subscription_workspace_current_process_progress = this.stompClient.subscribe('/topic/process-progress.' + this.workspaceCurrent._id, message => {
      // console.log('STOMP PROCESS PROGRESS raw',message.body);
      let body = JSON.parse(message.body)
      console.log('STOMP PROCESS PROGRESS',typeof( body), body);
      // if (body.error == undefined) {
      console.log('this.processCollection',body.processId,this.processCollection);
      let targetProcess = sift({
        _id: body.processId
      }, this.processCollection)[0]

      if (targetProcess !== undefined) {
        console.log('targetProcess',targetProcess);
        let targetStep = sift({
          componentId: body.componentId
        }, targetProcess.steps)[0]
        if (targetStep !== undefined) {
          console.log('targetStep',targetStep);
          if (body.error === undefined) {
            targetStep.status = 'resolved'
          } else {
            targetStep.status = 'error'
            //  targetProcess.status = 'error';
          }
        }
        targetProcess.stepFinished = sift({
          status: {
            '$ne': 'waiting'
          }
        }, targetProcess.steps).length
        this.trigger('workspace_current_process_changed', this.processCollection)
        if (this.currentProcess && this.currentProcess._id === body.processId) {
          this.computeGraph()
        }
      }
      // } else {
      //   this.trigger('ajax_fail', body.error);
      // }
    })
    this.subscription_workflow_processCleaned = this.stompClient.subscribe('/topic/workflow-processCleaned.' + this.workspaceCurrent._id, message => {
      let body = JSON.parse(message.body)
      // TODO server send workspaceID and not new processe => rework process Notifier on server
      // console.log('subscription_workflow_processCleaned ',body);
      // this.processCollection = sift({
      //   _id: {
      //     $in: body.cleanedProcesses.map(p => p._id)
      //   }
      // },
      // this.processCollection
      // )
      this.trigger('workspace_current_process_changed', this.processCollection)
    })
    this.subscription_workspace_current_process_persist = this.stompClient.subscribe('/topic/process-persist.' + this.workspaceCurrent._id, message => {
      let body = JSON.parse(message.body)
      if (this.currentProcess._id === body.processId && this.itemCurrent._id === body.componentId) {
        this.trigger('item_current_process_persist_changed', body.data)
      }
    })
  }

  // --------------------------------------------------------------------------------

  this.unsubscribeToPreviousSubscription = function () {
    [
      this.subscription_workspace_current_move_component,
      this.subscription_workspace_current_updateComponentField,
      this.subscription_workspace_current_process_start,
      this.subscription_workspace_current_process_end,
      this.subscription_workspace_current_process_error,
      this.subscription_workspace_current_process_progress,
      this.subscription_workspace_current_process_persist,
      this.subscription_workflow_processCleaned
    ].forEach(component => {
      if (component !== undefined && component !== null && typeof component.unsubscribe === 'function') {
        component.unsubscribe()
      }
    })
  }
}

