function WorkspaceStore() {


  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------


  riot.observable(this);
  this.globalWorkspaceCollection;
  this.workspaceCollection;
  this.workspaceShareCollection;
  this.workspaceCurrent;
  this.workspaceBusiness = new WorkspaceBusiness();
  this.componentSelectedToAdd = [];
  //this.cancelRequire = false;
  this.modeConnectBefore = false;
  this.modeConnectAfter = false;


  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------


  // ----------------------------------------- FUNCTION  -----------------------------------------


  this.load = function() {
    //console.log('load workspace to ||', localStorage.user_id);
    return new Promise((resolve, reject) => {
      utilStore.ajaxCall({
        method: 'get',
        url: '../data/core/workspaceByUser/' + localStorage.user_id
      }, true).then(data => {
        console.log('load workspace', data);
        this.workspaceCollection = data;
        resolve(this.workspaceCollection);
      }).catch(error => {
        reject(error);
      });
    })
  }; //<= load_workspace

  // --------------------------------------------------------------------------------

  this.loadShareWorkspace = function() {
    console.log('load share workspace');

    return new Promise((resolve, reject) => {
      utilStore.ajaxCall({
        method: 'get',
        url: '../data/core/workspaces/share/' + localStorage.user_id,
      }, true).then(data => {
        //console.log('load workspace', data);
        this.workspaceShareCollection = data;
        resolve(this.workspaceShareCollection);
      }).catch(error => {
        reject(error);
      });
    })
  }; //<= load_share_workspace

  // --------------------------------------------------------------------------------
  //TODO passer par le proxy client
  this.create = function() {
    console.log('create');

    return new Promise((resolve, reject) => {
      utilStore.ajaxCall({
        method: 'post',
        url: '../data/core/workspace/' + localStorage.user_id,
        data: JSON.stringify(this.workspaceCurrent),
      }, true).then(data => {
        this.globalWorkspaceCollection.push({role:'owner',workspace:data});
        this.setGlobalWorkspaceCollection(this.globalWorkspaceCollection);
        this.workspaceBusiness.connectWorkspaceComponent(data.components);
        this.workspaceCurrent = data;
        this.workspaceCurrent.mode = 'edit';
        resolve(this.workspaceCurrent);
      }).catch(error => {
        reject(error);
      });
    });
    // return new Promise((resolve, reject) => {
    //   this.trigger('persist_start');
    //   $.ajax({
    //     method: 'post',
    //     url: '../data/core/workspace/' + localStorage.user_id,
    //     data: JSON.stringify(this.workspaceCurrent),
    //     contentType: 'application/json',
    //     headers: {
    //       "Authorization": "JTW" + " " + localStorage.token
    //     },
    //   }).done(function(data) {
    //     this.trigger('persist_end', data);
    //     //data.mode = 'init';
    //     //his.menu='information'
    //     this.workspaceBusiness.connectWorkspaceComponent(data.components);
    //     this.workspaceCurrent = data;
    //     //console.log('update data ||', data);
    //     this.trigger('workspace_current_persist_done', data);
    //     this.trigger('workspace_current_changed', this.workspaceCurrent);
    //     this.menu = 'component';
    //     this.trigger('workspace_editor_menu_changed', 'component');
    //     resolve(data);
    //   }.bind(this));
    // });
  }; //<= create

  // --------------------------------------------------------------------------------
  //TODO passer par le proxy client
  this.update = function(data) {
    console.log("data update", data)
    return new Promise((resolve, reject) => {
      var ajax_data = JSON.stringify(this.workspaceBusiness.serialiseWorkspace(this.workspaceCurrent))
      this.trigger('persist_start');
      $.ajax({
        method: 'put',
        url: '../data/core/workspace',
        data: ajax_data,
        contentType: 'application/json',
        headers: {
          "Authorization": "JTW" + " " + localStorage.token
        },
      }).done(function(data) {
        this.trigger('persist_end', data);
        data.mode = 'edit';
        this.workspaceBusiness.connectWorkspaceComponent(data.components);
        this.workspaceCurrent = data;
        //console.log('update data ||', data);
        this.trigger('workspace_current_persist_done', this.workspaceCurrent);
        this.trigger('workspace_current_changed', this.workspaceCurrent);
        if (this.viewBox) {
          this.computeGraph();
        }
        resolve(data);
      }.bind(this));
    })
  }; //<= update

  this.updateList = function(data) {
    console.log("data update", data)
    return new Promise((resolve, reject) => {
      var ajax_data = JSON.stringify(data)
      $.ajax({
        method: 'put',
        url: '../data/core/workspacerowId',
        data: ajax_data,
        contentType: 'application/json',
        headers: {
          "Authorization": "JTW" + " " + localStorage.token
        },
      }).done(function(data) {
        console.log("update done", data)
      }.bind(this));
    })
  }; //<= updateList

  //
  // this.on('workspace_list_persist', function(workspaceCurrent) {
  //   // this.updateList(workspaceCurrent).then(data => {
  //   //   console.log("UPDATE DONE")
  //   // }); // <= workspace_current_persist
  // })

  // --------------------------------------------------------------------------------

  this.delete = function(record) {
    console.log('delete row', record);
    this.trigger('persist_start');
    $.ajax({
      method: 'delete',
      url: '../data/core/workspace/' + record._id + '/' + localStorage.user_id,
      contentType: 'application/json',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
    }).done(function(data) {
      console.log("delete done",record);
      this.globalWorkspaceCollection=sift({'workspace._id':{$ne:record._id}}, this.globalWorkspaceCollection);
      this.setGlobalWorkspaceCollection(this.globalWorkspaceCollection);
      this.trigger('persist_end', data);
      this.trigger('workspace_collection_changed', this.workspaceCollection);
      //this.trigger('workspace_collection_changed', this.workspaceCollection);
      // this.load(function() {
      //   this.trigger('persist_end', data);
      //   this.trigger('workspace_collection_changed', this.workspaceCollection);
      // }.bind(this));
    }.bind(this));
  }; //<= delete

  // --------------------------------------------------------------------------------

  this.updateUserListe = function(data) {
    console.log('updateUserListe', data);
    $.ajax({
      method: 'get',
      url: '../data/core/workspaces/' + data._id + '/user/' + localStorage.user_id,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json'
    }).done(function(data) {
      console.log('updateUserListeDone', data);
      if (data != false) {
        this.trigger('all_profil_by_workspace_loaded', data)
      } else {
        this.trigger('no_profil')
      }

    }.bind(this));
  }; // <= updateUserListe


  // --------------------------------------------------------------------------------


  // this.updateComponentListe = function(data) {
  //   console.log('update Component Liste', data);
  //   $.ajax({
  //     method: 'get',
  //     url: '../data/core/workspace/' + data._id,
  //     headers: {
  //       "Authorization": "JTW" + " " + localStorage.token
  //     },
  //     contentType: 'application/json'
  //   }).done(function(data) {
  //     console.log("update Component Liste Done ||", data)
  //     if (data != false) {
  //       if (this.workspaceCurrent) {
  //         this.workspaceCurrent = data
  //         this.workspaceCurrent.mode = "edit"
  //         this.trigger('all_component_by_workspace_loaded', data)
  //         this.trigger('workspace_current_changed', data);
  //       }
  //     }
  //   }.bind(this));
  // }; // <= updateComponentList


  // --------------------------------------------------------------------------------

  this.select = function(record) {
    return new Promise((resolve, reject) => {
      utilStore.ajaxCall({
        method: 'get',
        url: '../data/core/workspace/' + record._id
      }, true).then(data => {
        console.log(data);
        this.workspaceBusiness.connectWorkspaceComponent(data.components);
        this.workspaceCurrent = data;
        this.workspaceCurrent.mode = 'edit';
        this.menu = 'component'
        //this.workspaceCurrent.synchronized =true;
        resolve(data);
      }).catch(error => {
        reject(error);
      });
    });


  }; // <= select

  this.computeGraph = function(viewBox) {
    if (viewBox) {
      this.viewBox = viewBox;
    }

    var selectedNodes = [];
    var selectedLinks = [];

    if (this.graph != undefined) {

      // console.log("selectedNodes |", this.graph.nodes);
      // console.log("selectedNodes |", sift({
      //   selected: true
      // }, this.graph.nodes));
      // //console.log("selectedNodes |", selectedNodes);

      selectedNodes = sift({
        selected: true
      }, this.graph.nodes).map(n => n.id);
      selectedLinks = sift({
        selected: true
      }, this.graph.links).map(n => n.id);
    }



    this.graph = {};
    this.graph.nodes = [];
    this.graph.links = [];
    this.graph.workspace = this.workspaceCurrent;


    var inputs = 0;
    var outputs = 0;
    var middles = 0;

    // determine le nombre d inputs et d outputs
    console.log(this.workspaceCurrent.components);
    for (record of this.workspaceCurrent.components) {
      if (record.connectionsBefore.length == 0 && record.graphPositionX == undefined && record.graphPositionY == undefined) {
        inputs++;
      } else if (record.connectionsAfter.length == 0 && record.graphPositionX == undefined && record.graphPositionY == undefined) {
        outputs++;
      } else if (record.graphPositionX == undefined && record.graphPositionY == undefined) {
        middles++;
      }
    }

    // console.log(inputs, outputs); calcule une distance type pour positionner les inputs et outputs du graphe
    var inputsOffset = this.viewBox.height / (inputs + 1);
    var outputsOffset = this.viewBox.height / (outputs + 1);
    var middlesOffset = this.viewBox.height / (middles + 1);

    var inputCurrentOffset = inputsOffset;
    var outputCurrentOffset = outputsOffset;
    var middleCurrentOffset = middlesOffset;

    //console.log("automatic repartition", inputs, inputsOffset, middles, middlesOffset, outputs, outputsOffset);

    //console.log(inputsOffset, outputsOffset);

    for (record of this.workspaceCurrent.components) {
      var node = {};
      if (record.connectionsBefore.length == 0 && record.graphPositionX == undefined && record.graphPositionY == undefined) { // si rien n est connecte avant
        node = {
          text: record.type, //-
          id: record._id,
          graphIcon: record.graphIcon,
          // fx: record.graphPositionX || 10, //positionne l'élémént sur le bord gauche fy: record.graphPositionY || inputCurrentOffset,
          x: 30, //positionne l'élémént sur le bord gauche
          y: inputCurrentOffset,
          component: record
        }
        inputCurrentOffset += inputsOffset;
      } else if (record.connectionsAfter.length == 0 && record.graphPositionX == undefined && record.graphPositionY == undefined) {
        node = {
          text: record.type,
          id: record._id,
          graphIcon: record.graphIcon,
          // fx: record.graphPositionX || width - 10 - record.type.length * 10, // positionne l'element en largeur par rapport au bord droit du graphe fy: record.graphPositionY || outputCurrentOffset,
          x: this.viewBox.width - 250, // positionne l'element en largeur par rapport au bord droit du graphe
          y: outputCurrentOffset,
          component: record
        }
        outputCurrentOffset += outputsOffset;
      } else { // tous ceux du milieu
        node = {
          text: record.type,
          id: record._id,
          graphIcon: record.graphIcon,
          x: record.graphPositionX || this.viewBox.width / 2,
          y: record.graphPositionY || middleCurrentOffset,
          component: record
        }
        if (record.graphPositionY == undefined) {
          middleCurrentOffset += middlesOffset;
        }

      }
      if (selectedNodes.indexOf(node.id) != -1) {
        node.selected = true;
      }
      this.graph.nodes.push(node);
    }

    for (record of this.workspaceCurrent.components) {
      for (connection of record.connectionsAfter) {
        let id = record._id + '-' + connection._id;
        this.graph.links.push({
          source: sift({
            id: record._id
          }, this.graph.nodes)[0],
          target: sift({
            id: connection._id
          }, this.graph.nodes)[0],
          id: id,
          selected: selectedLinks.indexOf(id) != -1
        }) // creation de tous les links
      }
    }

    console.log(this.graph);
    this.trigger('workspace_graph_compute_done', this.graph);

  }

  this.on('workspace_graph_compute', function(viewBox) {
    this.computeGraph(viewBox);
  });

  this.on('component_current_set', function(data) {
    this.graph.nodes.forEach(n => {
      n.selected = false;
    });

    this.graph.links.forEach(l => {
      l.selected = false;
    });
    sift({
      'component._id': data._id
    }, this.graph.nodes).forEach(n => {
      n.selected = true;
    });
    //this.trigger('workspace_graph_compute_done', this.graph)
    this.trigger('workspace_graph_selection_changed', this.graph);

  });

  this.on('selection_reset', function() {

    this.graph.links.forEach(l => {
      l.selected = false;
      l.connectAfterMode = false;
      l.connectBeforeMode = false;
    });
    this.graph.nodes.forEach(n => {
      n.selected = false;
      n.connectAfterMode = false;
      n.connectBeforeMode = false;
    });
    this.trigger('workspace_graph_selection_changed', this.graph);


  });

  this.on('connection_current_set', function(source, target) {

    this.graph.nodes.forEach(n => {
      n.selected = false
    });

    this.graph.links.forEach(l => {
      l.selected = false;
    });

    sift({
      $and: [{
        'source.component._id': source._id
      }, {
        'target.component._id': target._id
      }]
    }, this.graph.links).forEach(l => {
      l.selected = true
    });
    this.trigger('workspace_graph_selection_changed', this.graph);
  });


  // ----------------------------------------- EVENT  -----------------------------------------

  this.on('workspace_delete', function(record) {
    console.log('ON workspace_delete ||', record);
    this.delete(record);
  }); // <= workspace_delete

  // --------------------------------------------------------------------------------

  this.setGlobalWorkspaceCollection=function(data){
    //console.log('setGlobalWorkspaceCollection',data.map(r=>r.workspace));
    this.globalWorkspaceCollection=data;
    this.workspaceCollection=sift({role:'owner'},data).map(r=>r.workspace);
    this.workspaceShareCollection=sift({role:'editor'},data).map(r=>r.workspace);
  }

  this.on('workspace_collection_load', function(record) {
    console.log('workspace_collection_load',this.workspaceCollection);
    if (this.workspaceCollection == undefined) {
      this.load(this.workspaceCurrent).then(data => {
        this.trigger('workspace_collection_changed', this.workspaceCollection);
      })
    } else {
      this.trigger('workspace_collection_changed', this.workspaceCollection);
    }
  }); // <= workspace_collection_load
  this.on('workspace_collection_filter', function(filter) {
    var re = new RegExp(filter, 'gi');
    this.trigger('workspace_collection_changed', sift({
      name: {
        $regex: re
      }
    }, this.workspaceCollection));
  });
  // --------------------------------------------------------------------------------



  this.on('workspace_collection_share_load', function(record) {

    if (this.workspaceShareCollection == undefined) {
      this.loadShareWorkspace().then(data => {
        this.trigger('workspace_share_collection_changed', this.workspaceShareCollection);
      })
    } else {
      this.trigger('workspace_share_collection_changed', this.workspaceShareCollection);
    }
  }); // <= workspace_collection_share_load
  this.on('workspace_collection_share_filter', function(filter) {
    var re = new RegExp(filter, 'gi');
    this.trigger('workspace_share_collection_changed', sift({
      name: {
        $regex: re
      }
    }, this.workspaceShareCollection));
  });



  // --------------------------------------------------------------------------------


  // this.on('workspace_synchoniseFromServer_byId', function(id) {
  //   console.log('workspace_synchoniseFromServer_workspace_byId', id);
  //   $.ajax({
  //     method: 'get',
  //     url: '../data/core/workspace/' + id,
  //     headers: {
  //       "Authorization": "JTW" + " " + localStorage.token
  //     }
  //   }).done(function(data) {
  //     var synchronizedWorkspaceCollection = [];
  //     for (var workspace of this.workspaceCollection) {
  //       if (workspace._id == data._id) {
  //         // data.components = this.workspaceBusiness.connectWorkspaceComponent(data.components);
  //         synchronizedWorkspaceCollection.push(data);
  //         console.log('workspace_synchoniseFromServer_workspace_byId | workspaceCurrent | ', this.workspaceCurrent);
  //         console.log('workspace_synchoniseFromServer_workspace_byId | New workspaceCurrent | ', data);
  //         this.workspaceCurrent = data;
  //       } else {
  //         synchronizedWorkspaceCollection.push(workspace);
  //       }
  //     }
  //     this.workspaceCollection = synchronizedWorkspaceCollection;
  //     this.trigger('workspace_synchoniseFromServer_done', this.workspaceCollection);
  //     this.trigger('workspace_collection_changed', this.workspaceCollection);
  //   }.bind(this));
  // }); // <= workspace_synchoniseFromServer_byId

  // --------------------------------------------------------------------------------

  this.on('workspace_current_updateField', function(message) {
    console.log('workspace_current_updateField ||', message)
    this.workspaceCurrent[message.field] = message.data;
    this.workspaceCurrent.synchronized = false;
    this.trigger('workspace_current_changed', this.workspaceCurrent);
  }); // <= workspace_current_updateField




  // --------------------------------------------------------------------------------

  // this.on('workspace_current_select', function(record) {
  //
  //   this.select(record).then(workspace => {
  //     console.log('workspace_current_select ||', record)
  //     this.trigger('workspace_current_select_done', workspace);
  //     //this.trigger('workspace_current_changed', workspace);
  //   })
  // }); // <= workspace_current_select

  this.on('navigation', function(entity, id, action) {
    //console.log('WARNING');
    if (entity == "workspace") {
      //console.log('ALLO');
      if (id == 'new') {
        this.workspaceCurrent = {
          name: "",
          description: "",
          components: [],
          users: []
        };
        this.action = action;
        this.workspaceCurrent.mode = 'init';
        this.trigger('navigation_control_done', entity, action);
      } else {
        if (this.workspaceCurrent != undefined && this.workspaceCurrent._id == id) {
          this.action = action;
          this.trigger('navigation_control_done', entity, action);
        } else {
          this.select({
            _id: id
          }).then(workspace => {
            this.action = action;
            this.trigger('navigation_control_done', entity, action);
          });
        }
      }
    }
  });
  // --------------------------------------------------------------------------------

  this.on('workspace_current_cancel', function(record) {
    console.log('workspace_current_cancel ||', this.workspaceCurrent)
    this.workspaceCurrent.mode = 'read'
    this.select(this.workspaceCurrent);
  }); // <= workspace_current_cancel

  // --------------------------------------------------------------------------------

  this.on('workspace_current_edit', function(data) {
    this.workspaceCurrent.mode = 'edit';
    this.trigger('workspace_current_changed', this.workspaceCurrent);

  }); // <= workspace_current_edit

  // --------------------------------------------------------------------------------

  this.on('workspace_current_init', function() {
    //console.log('model : workspace_current_init');
    this.workspaceCurrent = {
      name: "",
      description: "",
      components: [],
      users: []
    };
    this.workspaceCurrent.mode = 'init';
    this.menu = 'information';
    this.trigger('workspace_current_select_done', this.workspaceCurrent);
    //this.trigger('workspace_editor_menu_changed', this.menu);
    //this.trigger('workspace_current_changed', this.workspaceCurrent);
  }); // <= workspace_current_init

  // --------------------------------------------------------------------------------


  this.on('workspace_current_refresh', function() {
    //console.log('workspace_current_refresh || ', this.workspaceCurrent);
    this.trigger('workspace_editor_menu_changed', this.action);
    this.trigger('workspace_current_changed', this.workspaceCurrent);
  }); // <= workspace_current_refresh

  // --------------------------------------------------------------------------------


  this.on('workspace_current_persist', function() {
    console.log('Workspace STORE persist FINAL', this.workspaceCurrent);
    var mode = this.workspaceCurrent.mode;
    if (mode == 'init') {
      this.create().then(ws => {
        route('workspace/' + ws._id + '/component');
      })
    } else if (mode == 'edit') {
      this.update(this.workspaceCurrent).then(data => {
        //nothing to do. specific action in other case
      })
    }
  }.bind(this)); // <= workspace_current_persist


  RiotControl.on('persistClick', function(data) {
    // console.log("WORKSPACE STORE PERSIST START");
    // this.componentView = true;
    // this.userView = true;
    // this.DescriptionView = true;
    // RiotControl.trigger('workspace_current_updateField', {
    //   field: 'name',
    //   data: data.name
    // });
    // RiotControl.trigger('workspace_current_updateField', {
    //   field: 'description',
    //   data: data.description
    // });
    RiotControl.trigger('workspace_current_persist');
  }.bind(this));


  // --------------------------------------------------------------------------------

  // this.on('workspace_current_add_component', function(data) {
  //   console.log("workspace_current_add_component ||", data)
  //   data.workspaceId = this.workspaceCurrent._id;
  //   data.specificData = {};
  //   this.workspaceCurrent.components.push(data);
  //   // this.trigger('save_auto', {
  //   //   compoenent:data,
  //   //   workspace: this.workspaceCurrent,
  //   // })
  //   this.trigger('save_auto')
  // });
  this.on('set_componentSelectedToAdd', function(message) {
    //console.log('set_componentSelectedToAdd',message);
    this.componentSelectedToAdd = message;
  }); // <= workspace_current_updateField
  this.on('workspace_current_add_components', function() {
    console.log("workspace_current_add_components", this.componentSelectedToAdd);
    this.componentSelectedToAdd.forEach(c => {
      c.workspaceId = this.workspaceCurrent._id;
      c.specificData = {};
      c.connectionsBefore = [];
      c.connectionsAfter = []
      c.consumption_history = {}
      this.workspaceCurrent.components.push(c);
    })
    this.componentSelectedToAdd = [];

    this.update(this.workspaceCurrent).then(data => {
      this.trigger('workspace_current_add_components_done', this.workspaceCurrent);
      //route('workspace/'+this.workspaceCurrent+'/component')
    })
  }.bind(this));

  // --------------------------------------------------------------------------------

  this.on('workspace_current_delete_component', function(record) {
    console.log("workspace_current_delete_component ||", record)
    this.workspaceCurrent.components.splice(this.workspaceCurrent.components.indexOf(record), 1);
    console.log('workspace_current_delete_component_before_update', this.workspaceCurrent);
    this.update(this.workspaceCurrent);
    //this.trigger('workspace_current_changed', this.workspaceCurrent);

  }); //<= workspace_current_delete_component

  // --------------------------------------------------------------------------------


  // this.on('item_current_cancel', function(data) {
  //   console.log('item_current_cancel ||', data);
  //   this.workspaceCurrent.mode = 'read';
  //   this.cancelRequire = true;
  // }); //<= item_current_cancel

  // --------------------------------------------------------------------------------



  // --------------------------------------------------------------------------------

  // this.on('workspace_current_graph', function(data) {
  //   this.trigger('workspace_current_graph_changed', this.workspaceCurrent);
  //   // $.ajax({
  //   //   method: 'get',
  //   //   url: '../data/core/workspaceComponent/load_all_component/' + this.workspaceCurrent._id,
  //   //   headers: {
  //   //     "Authorization": "JTW" + " " + localStorage.token
  //   //   },
  //   //   contentType: 'application/json',
  //   // }).done(function (data) {
  //   //   this.workspaceCurrent = data
  //   //   console.log("CURRENT GRAPH TRIGGER", this.workspaceCurrent)
  //   //   this.trigger('workspace_current_graph_changed', this.workspaceCurrent);
  //   // }.bind(this));
  // }); //<= own_all_workspace

  ///GESTION DES DROIT DE USER
  this.on('set-email-to-share', function(email) {
    this.emailToShare = email;
  })

  this.on('share-workspace', function(data) {
    console.log('share-workspace |', data, localStorage.token);
    $.ajax({
      method: 'put',
      url: '../data/core/share/workspace/',
      data: JSON.stringify({
        email: this.emailToShare,
        worksapce_id: this.workspaceCurrent._id
      }),
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      // beforeSend: function() {
      //   this.trigger('share_change_send');
      // }.bind(this),
      contentType: 'application/json'
    }).done(function(data) {
      console.log('in share data', data)
      if (data == false) {
        this.trigger('share_change_no_valide')
      } else if (data == "already") {
        this.trigger('share_change_already')
      } else {
        //this.userCurrrent = data,
        console.log('share-workspace', data);
        this.workspaceBusiness.connectWorkspaceComponent(data.workspace.components);
        this.workspaceCurrent = data.workspace;
        this.workspaceCurrent.mode='edit';
        this.trigger('share_change', {
          user: data.user,
          workspace: data.workspace
        });
        route('workspace/'+data.workspace._id+'/user');
      }
    }.bind(this));
  });


  this.on('item_current_connect_before_show', function(data) {
    this.modeConnectBefore = !this.modeConnectBefore;
    this.modeConnectAfter = false;
    this.trigger('item_curent_connect_show_changed', {
      before: this.modeConnectBefore,
      after: this.modeConnectAfter
    });

    sift({
      selected: true
    }, this.graph.nodes).forEach(n => {
      n.connectBeforeMode = true;
    });
    this.trigger('workspace_graph_selection_changed', this.graph);
  });

  this.on('item_current_connect_after_show', function(data) {
    this.modeConnectBefore = false;
    this.modeConnectAfter = !this.modeConnectAfter;
    this.trigger('item_curent_connect_show_changed', {
      before: this.modeConnectBefore,
      after: this.modeConnectAfter
    });

    sift({
      selected: true
    }, this.graph.nodes).forEach(n => {
      n.connectAfterMode = true;
    });
    this.trigger('workspace_graph_selection_changed', this.graph);
  });


  this.on('connect_components', function(source, destination) {
    source.connectionsAfter.push(destination);
    destination.connectionsBefore.push(source);
    this.update(this.workspaceCurrent);
    this.modeConnectBefore = false;
    this.modeConnectAfter = false;
    this.trigger('item_curent_connect_show_changed', {
      before: this.modeConnectBefore,
      after: this.modeConnectAfter
    });

    sift({
      selected: true
    }, this.graph.nodes).forEach(n => {
      n.connectAfterMode = false;
      n.connectBeforeMode = false;
    });
    this.trigger('workspace_graph_selection_changed', this.graph);

  });

  this.on('disconnect_components', function(source, destination) {
    source.connectionsAfter.splice(source.connectionsAfter.indexOf(destination), 1);
    destination.connectionsBefore.splice(destination.connectionsBefore.indexOf(source), 1);
    this.update(this.workspaceCurrent);
  });

  //it is here because genericStore manage the current item and drad&drop impact others
  this.on('item_updateField', function(message) {
    console.log('item_current_updateField ', message);
    let item = sift({
      _id: message.id
    }, this.workspaceCurrent.components)[0];
    item[message.field] = message.data;
    this.trigger('workspace_current_changed', this.workspaceCurrent);
  }); //<= item_current_updateField

  this.on('workspace_editor_change_menu', function(menu) {
    this.menu = menu;
    this.trigger('workspace_editor_menu_changed', this.menu);
  });


}
