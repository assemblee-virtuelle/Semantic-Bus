function GenericStore(utilStore, specificStoreList) {


  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------


  riot.observable(this) // Riot provides our event emitter.
  for (specificStore of specificStoreList) {
    specificStore.genericStore = this;
  }
  this.workspaceBusiness = new WorkspaceBusiness();
  this.itemCurrent;
  this.connectMode;

  this.modeConnectBefore = false;
  this.modeConnectAfter = false;


  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------


  // ----------------------------------------- FUNCTION  -----------------------------------------




  this.update = function() {
    return new Promise((resolve, reject) => {
      this.trigger('persist_start');

      console.log('GenericStore || update', this.workspaceBusiness.serialiseWorkspaceComponent(this.itemCurrent));
      $.ajax({
        method: 'put',
        url: '../data/core/workspaceComponent',
        data: JSON.stringify(this.workspaceBusiness.serialiseWorkspaceComponent(this.itemCurrent)),
        contentType: 'application/json',
        headers: {
          "Authorization": "JTW" + " " + localStorage.token
        }
      }).done(function(data) {
        console.log("final ajax", data)
        this.itemCurrent = data;
        this.trigger('persist_end');
        this.trigger('item_current_persist_done', this.itemCurrent);
        resolve(this.itemCurrent);
      }.bind(this));
    })

  }; //<= update

  // --------------------------------------------------------------------------------

  this.persist = function() {
    console.log('GenericStore || persist', this.itemCurrent);
    // var mode = this.itemCurrent.mode;
    // if (mode == 'init') {
    //   this.create();
    // } else if (mode == 'edit') {
    //   this.update();
    // }
    this.update();
  } //<= persist

  // ----------------------------------------- EVENT  -----------------------------------------

  // this.on('item_current_edit', function(data) {
  //   console.log("data out ajax item_current_edit ||", data)
  //   $.ajax({
  //     method: 'get',
  //     url: '../data/core//workspaceComponent/ConnectBeforeConnectAfter/' + data._id,
  //     contentType: 'application/json',
  //     headers: {
  //       "Authorization": "JTW" + " " + localStorage.token
  //     }
  //   }).done(function(data) {
  //     this.itemCurrent = data;
  //
  //     this.itemCurrent.mode = 'edit';
  //     this.itemCurrent.specificData=this.itemCurrent.specificData||{};
  //     console.log('item_current_edit | ',this.itemCurrent);
  //     this.trigger('item_current_edit_mode', 'generic', this.itemCurrent);
  //     this.trigger('workspace_current_click', this.itemCurrent);
  //     this.trigger('item_current_changed', this.itemCurrent);
  //   }.bind(this));
  // }); //<= item_current_edit



  // --------------------------------------------------------------------------------


  this.on('item_current_updateField', function(message) {
    console.log('item_current_updateField ', message);
    this.itemCurrent[message.field] = message.data;
    this.trigger('item_current_changed', this.itemCurrent);
  }); //<= item_current_updateField

  // --------------------------------------------------------------------------------



  this.on('item_current_persist', function(message) {
    console.log('item_current_persist', this.workspaceBusiness.serialiseWorkspaceComponent(this.itemCurrent));
    this.persist();
  }); //<=  item_current_persist

  // --------------------------------------------------------------------------------


  // this.on('item_current_testPull', function(message) {
  //   console.log('item_current_testPull | itemCurrent:', this.itemCurrent);
  //   var id = this.itemCurrent._id;
  //   $.ajax({
  //     method: 'get',
  //     url: '../data/core/workspaceComponent/' + id + '/test',
  //     contentType: 'application/json',
  //     headers: {
  //       "Authorization": "JTW" + " " + localStorage.token
  //     }
  //   }).done(function(data) {
  //     this.trigger('item_current_testPull_done', data);
  //   }.bind(this));
  // });//<= item_current_testPull

  // --------------------------------------------------------------------------------

  this.on('item_current_work', function(message) {
    console.log('item_current_testWork | itemCurrent:', this.itemCurrent);
    var id = this.itemCurrent._id;
    this.trigger('item_current_work_start');
    utilStore.ajaxCall({
      method: 'get',
      url: '../data/core/workspaceComponent/' + id + '/work'
    }, false).then(data => {
      this.currentPreview = data;
      this.trigger('item_current_work_done', data);
    }).catch(error => {
      this.trigger('item_current_work_fail');
    });
  }); //<= item_current_work



  this.on('previewJSON_refresh', function() {
    //console.log('workspace_current_refresh || ', this.workspaceCurrent);
    this.trigger('previewJSON', this.currentPreview);
  }); // <= workspace_current_refresh

  // --------------------------------------------------------------------------------

  this.on('item_current_cancel', function(data) {
    console.log('item_current_cancel :', this.itemCurrent);
    if (this.itemCurrent) {
      this.itemCurrent.mode = undefined;
    }
  });
  // this.on('item_current_connect_before', function(data) {
  //   this.connectMode = 'before';
  // });
  // this.on('item_current_connect_after', function(data) {
  //   this.connectMode = 'after';
  // });
  // this.on('item_current_connect_before_show', function(data) {
  //   this.modeConnectBefore = !this.modeConnectBefore;
  //   this.modeConnectAfter = false;
  //   this.trigger('item_curent_connect_show_changed', {
  //     before: this.modeConnectBefore,
  //     after: this.modeConnectAfter
  //   });
  // });
  //
  // this.on('item_current_connect_after_show', function(data) {
  //   this.modeConnectBefore = false;
  //   this.modeConnectAfter = !this.modeConnectAfter;
  //   this.trigger('item_curent_connect_show_changed', {
  //     before: this.modeConnectBefore,
  //     after: this.modeConnectAfter
  //   });
  // });
  //
  // this.on('item_current_connect_cancel_show', function(data) {
  //   this.modeConnectBefore = false;
  //   this.modeConnectAfter = false;
  //   this.trigger('item_curent_connect_show_changed', {
  //     before: this.modeConnectBefore,
  //     after: this.modeConnectAfter
  //   });
  // });
  //
  // this.on('item_current_connect_before', function(data) {
  //   console.log('item_current_add_component', this.connectMode);
  //   this.itemCurrent.connectionsBefore = this.itemCurrent.connectionsBefore || [];
  //   this.itemCurrent.connectionsBefore.push(data);
  //   this.update().then((record) => {
  //     this.modeConnectBefore = false;
  //     this.trigger('item_curent_connect_show_changed', {
  //       before: this.modeConnectBefore,
  //       after: this.modeConnectAfter
  //     });
  //     this.trigger('item_curent_available_connections', this.computeAvailableConnetions());
  //     this.trigger('item_current_changed', this.itemCurrent);
  //   });
  //
  // })
  //
  //
  //
  // this.on('item_current_disconnect_after', function(data) {
  //   this.itemCurrent.connectionsAfter = this.itemCurrent.connectionsAfter || [];
  //   this.itemCurrent.connectionsAfter.splice(this.itemCurrent.connectionsAfter.indexOf(data), 1);
  //   this.update().then((record) => {
  //     this.modeConnectAfter = false;
  //     this.trigger('item_curent_connect_show_changed', {
  //       before: this.modeConnectBefore,
  //       after: this.modeConnectAfter
  //     });
  //     this.trigger('item_curent_available_connections', this.computeAvailableConnetions());
  //     this.trigger('item_current_changed', this.itemCurrent);
  //   });
  // });
  //
  // this.on('item_current_disconnect_before', function(data) {
  //   console.log('item_current_add_component', this.connectMode);
  //   this.itemCurrent.connectionsBefore = this.itemCurrent.connectionsBefore || [];
  //   this.itemCurrent.connectionsBefore.splice(this.itemCurrent.connectionsBefore.indexOf(data), 1);
  //   this.update().then((record) => {
  //     this.modeConnectBefore = false;
  //     this.trigger('item_curent_connect_show_changed', {
  //       before: this.modeConnectBefore,
  //       after: this.modeConnectAfter
  //     });
  //     this.trigger('item_curent_available_connections', this.computeAvailableConnetions());
  //     this.trigger('item_current_changed', this.itemCurrent);
  //   });
  // });


  // --------------------------------------------------------------------------------

  // this.on('item_current_add_component', function(data) {
  //   console.log('item_current_add_component', this.connectMode);
  //   switch (this.connectMode) {
  //     case 'before':
  //       this.itemCurrent.connectionsBefore = this.itemCurrent.connectionsBefore || [];
  //       this.itemCurrent.connectionsBefore.push(data);
  //       break;
  //     case 'after':
  //       this.itemCurrent.connectionsAfter = this.itemCurrent.connectionsAfter || [];
  //       this.itemCurrent.connectionsAfter.push(data);
  //       break;
  //     default:
  //   }
  //   this.trigger('item_current_element_added', this.workspaceCurrent);
  //   this.trigger('item_current_changed', this.itemCurrent);
  // }); //<= item_current_add_component

  // --------------------------------------------------------------------------------
  this.computeAvailableConnetions = function() {

    let beforeConnectionAvailable = sift({
      $and: [{
        _id: {
          $nin: this.itemCurrent.connectionsBefore.map(c => c._id)
        }
      }, {
        _id: {
          $ne: this.itemCurrent._id
        }
      }]
      //workspace of component should filled but is'nt (should be filled in workspace load/deserialized)
    }, this.workspaceCurrent.components);

    let afterConnectionAvailable = sift({
      $and: [{
        _id: {
          $nin: this.itemCurrent.connectionsAfter.map(c => c._id)
        }
      }, {
        _id: {
          $ne: this.itemCurrent._id
        }
      }]
      //workspace of component should filled but is'nt (should be filled in workspace load/deserialized)
    }, this.workspaceCurrent.components);
    let out = {
      before: beforeConnectionAvailable,
      after: afterConnectionAvailable
    };

    return out;
  }
  this.on('component_current_set', function(data) {
    this.itemCurrent = data;
  });

  this.on('component_current_select', function(data) {
    //console.log('WARNING');
    this.itemCurrent = data;
    //this.trigger('item_current_edit_mode','generic', this.itemCurrent);
    this.trigger('component_current_select_done');
  }); //<= item_current_select

  this.refresh = function() {
    this.trigger('item_current_editor_changed', this.itemCurrent.editor);
    this.modeConnectBefore = false;
    this.modeConnectAfter = false;
    this.trigger('item_curent_connect_show_changed', {
      before: this.modeConnectBefore,
      after: this.modeConnectAfter
    });
    this.trigger('item_curent_available_connections', this.computeAvailableConnetions());
    console.log('genericStore | component_current_select |', this.itemCurrent);
    this.trigger('item_current_changed', this.itemCurrent);
  }

  this.on('component_current_refresh', function() {
    //console.log('WARNING');
    //this.trigger('item_current_edit_mode','generic', this.itemCurrent);
    this.refresh();
  }); //<= item_current_select


  // --------------------------------------------------------------------------------
}
