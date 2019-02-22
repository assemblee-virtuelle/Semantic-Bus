function WorkspaceStore (utilStore, stompClient, specificStoreList) {
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
  this.stompClient = stompClient
  this.processCollection = []
  this.currentProcess = undefined
  this.itemCurrent
  this.connectMode
  this.modeConnectBefore = false
  this.modeConnectAfter = false

  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------

  // ----------------------------------------- FUNCTION  -----------------------------------------

  this.computeGraph = function (viewBox) {
    let componentsId = this.workspaceCurrent.components.map(c => c._id)
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
      var node = {
        text: record.type,
        id: record._id,
        graphIcon: record.graphIcon,
        component: record
      }
      CompteConnexion[record._id] = {}
      CompteConnexion[record._id].connectionsBefore = connectionsBefore.length
      CompteConnexion[record._id].connectionsAfter = connectionsAfter.length

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
        node.connectionsBefore = connectionsBefore.length
        node.connectionsAfter = connectionsAfter.length
      }
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
        scb: CompteConnexion[link.source].connectionsBefore,
        sca: CompteConnexion[link.source].connectionsAfter,
        tcb: CompteConnexion[link.target].connectionsBefore,
        tca: CompteConnexion[link.target].connectionsAfter,
        selected: selectedLinks.indexOf(id) !== -1
      })
    }

    this.trigger('workspace_graph_compute_done', this.graph)
  }

  // --------------------------------------------------------------------------------

  this.initializeNewWorkspace = function (entity, action) {
    this.workspaceCurrent = {
      name: '',
      description: '',
      components: [],
      users: [],
      links: []
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

        this.trigger('workspace_current_process_changed', this.processCollection)
      })
  }

  // --------------------------------------------------------------------------------

  this.load = function () {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'get',
        url: '../data/core/workspaces/me/owner'
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
      this.utilStore.ajaxCall({
        method: 'post',
        url: '../data/core/workspaces/',
        data: JSON.stringify({ workspace: this.workspaceCurrent })
      }, true).then(data => {
        console.log(data)
        this.workspaceCollection.push(data)
        console.log(this.workspaceCollection)
        this.workspaceCurrent = data
        this.workspaceCurrent.mode = 'edit'
        resolve(this.workspaceCurrent)
      }).catch(error => {
        reject(error)
      })
    })
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
        this.workspaceCurrent = data
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
        this.menu = 'component'
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
        resolve(this.itemCurrent)
      })
    })
  } // <= update

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
      if (id === 'new') {
        this.initializeNewWorkspace(entity, action)
        this.trigger('navigation_control_done', entity, action)
      } else if (this.workspaceCurrent !== undefined && this.workspaceCurrent._id === id) {
        this.reloadWorkspace(entity, action)
        if (action === 'component' && secondId !== undefined) {
          this.loadComponentPart(secondId, secondAction)
          this.trigger('navigation_control_done', 'workspace', secondAction)
        } else {
          this.trigger('navigation_control_done', entity, action, secondAction)
        }
      } else {
        this.unsubscribeToPreviousSubscription()
        this.select({ _id: id }).then(() => {
          this.subscribeToComponents(entity, action)
          if (action === 'component' && secondId !== undefined) {
            this.loadComponentPart(secondId, secondAction)
            this.trigger('navigation_control_done', 'workspace', secondAction)
          } else {
            this.trigger('navigation_control_done', entity, action, secondAction)
          }
        })
        this.loadProcesses(id)
      }
    }
  })

  // --------------------------------------------------------------------------------

  this.on('workspace_graph_compute', function (viewBox) {
    this.computeGraph(viewBox)
  })

  // --------------------------------------------------------------------------------

  this.on('component_current_set', function (data) {
    this.graph.nodes.forEach(n => {
      n.selected = false
    })

    this.graph.links.forEach(l => {
      l.selected = false
    })
    sift({
      'component._id': data._id
    }, this.graph.nodes).forEach(n => {
      n.selected = true
    })
    // this.trigger('workspace_graph_compute_done', this.graph)
    this.trigger('workspace_graph_selection_changed', this.graph)
  })

  // --------------------------------------------------------------------------------

  this.on('connection_current_set', function (source, target) {
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
      }]
    }, this.graph.links).forEach(l => {
      l.selected = true
    })
    this.trigger('workspace_graph_selection_changed', this.graph)
  })

  // --------------------------------------------------------------------------------

  this.on('workspace_delete', function (record) {
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

  // --------------------------------------------------------------------------------

  this.on('workspace_current_process_select', function (process) {
    this.currentProcess = process
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

  this.on('workspace_current_add_components', function () {
    this.utilStore.ajaxCall({
      method: 'post',
      url: '../data/core/workspaces/' + this.workspaceCurrent._id + '/components',
      data: JSON.stringify(this.componentSelectedToAdd.map((c) => {
        return this.workspaceBusiness.serialiseWorkspaceComponent(c)
      }))
    }, true).then(data => {
      this.workspaceCurrent.components = this.workspaceCurrent.components.concat(data)
      route('workspace/' + this.workspaceCurrent._id + '/component')
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
    this.modeConnectAfter = false
    this.trigger('item_curent_connect_show_changed', {
      before: this.modeConnectBefore,
      after: this.modeConnectAfter
    })

    sift({
      selected: true
    }, this.graph.nodes).forEach(n => {
      n.connectBeforeMode = true
    })
    this.trigger('workspace_graph_selection_changed', this.graph)
  })

  // --------------------------------------------------------------------------------

  this.on('item_current_connect_after_show', function (data) {
    // not used
    this.modeConnectBefore = false
    this.modeConnectAfter = !this.modeConnectAfter
    this.trigger('item_curent_connect_show_changed', {
      before: this.modeConnectBefore,
      after: this.modeConnectAfter
    })
    //! not used

    sift({
      selected: true
    }, this.graph.nodes).forEach(n => {
      n.connectAfterMode = true
    })
    this.trigger('workspace_graph_selection_changed', this.graph)
  })

  // --------------------------------------------------------------------------------

  this.on('connect_components', function (source, target) {
    this.utilStore.ajaxCall({
      method: 'post',
      url: '../data/core/workspaces/' + this.workspaceCurrent._id + '/components/connection',
      data: JSON.stringify({
        source: source._id,
        target: target._id
      })
    }, true).then(links => {
      // source.connectionsAfter.push(connectedComps.target);
      // target.connectionsBefore.push(connectedComps.source);
      // this.workspaceBusiness.connectWorkspaceComponent(this.workspaceCurrent.components);
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

  this.on('component_current_set', function (data) {
    this.itemCurrent = data
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

  this.subscribeToComponents = function (entity, action) {
    this.action = action
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
      if (body.error === undefined) {
        let process = {
          _id: body._id,
          status: 'processing',
          steps: body.steps,
          timeStamp: body.timeStamp,
          stepFinished: 0
        }
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
      } else {
        this.trigger('ajax_fail', body.error)
      }
    })
    this.subscription_workspace_current_process_error = this.stompClient.subscribe('/topic/process-error.' + this.workspaceCurrent._id, message => {
      let body = JSON.parse(message.body)
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
    this.subscription_workspace_current_process_progress = this.stompClient.subscribe('/topic/process-progress.' + this.workspaceCurrent._id, message => {
      let body = JSON.parse(message.body)

      // if (body.error == undefined) {
      let targetProcess = sift({
        _id: body.processId
      }, this.processCollection)[0]

      if (targetProcess !== undefined) {
        let targetStep = sift({
          componentId: body.componentId
        }, targetProcess.steps)[0]
        if (targetStep !== undefined) {
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
      this.processCollection = sift({
        _id: {
          $in: body.cleanedProcesses.map(p => p._id)
        }
      },
      this.processCollection
      )
      this.trigger('workspace_current_process_changed', this.processCollection)
      route('workspace/' + body.workspaceId + '/process')
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
