function WorkspaceStore() {
  riot.observable(this) // Riot provides our event emitter.

  this.workspaceCollection = [];
  this.workspaceShareCollection = []
  this.workspaceCurrent;
  this.workspaceBusiness = new WorkspaceBusiness();
  this.cancelRequire = false;


  //TODO : Promise to replace callback
  this.load = function (callback) {
    console.log('load GLF');
    console.log(localStorage.user_id)
    $.ajax({
      method: 'get',
      url: '../data/core/workspaceByUser/' + localStorage.user_id,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json',
    }).done(function (data) {
      console.log('store load', data);
      this.workspaceCollection = data;
      if (callback != undefined) {
        callback();
      }
      this.trigger('workspace_collection_changed', this.workspaceCollection);

    }.bind(this));
  };

    //TODO : Promise to replace callback
  this.loadShareWorkspace = function (callback) {
    console.log('load GLF');
    console.log(localStorage.user_id)
    $.ajax({
      method: 'get',
      url: '../data/core/workspaces/share/' + localStorage.user_id,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json',
    }).done(function (data) {
      console.log('ShareWorkspace load', data);
      this.workspaceShareCollection = data;
      if (callback != undefined) {
        callback();
      }
      this.trigger('workspace_share_collection_changed',this.workspaceShareCollection);
    }.bind(this));
  };

  this.create = function () {
    console.log(localStorage.user_id)
    $.ajax({
      method: 'post',
      url: '../data/core/workspace/' + localStorage.user_id,
      data: JSON.stringify(this.workspaceBusiness.serialiseWorkspace(this.workspaceCurrent)),
      contentType: 'application/json',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
    }).done(function (data) {
      //this.workspaceCurrent.mode='edit';
      //this.trigger('workspace_current_create_done',this.workspaceCurrent);
      console.log(data);
      this.load(function (data) {
        this.trigger('workspace_current_persist_done');
        data.mode = 'read';
        this.select(data);
        //this.trigger('workspace_current_persist_done', this.workspaceCurrent);
      }.bind(this, data));
      //this.trigger('workspace_collection_changed',this.workspaceCollection);
    }.bind(this));
  };

  this.update = function () {
    $.ajax({
      method: 'put',
      url: '../data/core/workspace',
      data: JSON.stringify(this.workspaceBusiness.serialiseWorkspace(this.workspaceCurrent)),
      contentType: 'application/json',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
    }).done(function (data) {
      this.load(function (data) {
        data.mode = 'read';
        this.trigger('workspace_current_persist_done');
        this.select(data);
        //this.trigger('workspace_current_persist_done', this.workspaceCurrent);
      }.bind(this, data));
      //this.workspaceCurrent.mode='edit';
    }.bind(this));
  };

  this.delete = function (record) {
    //console.log('del Row :', record);
    $.ajax({
      method: 'delete',
      url: '../data/core/workspace/' + record._id.$oid + '/' + localStorage.user_id,
      contentType: 'application/json',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
    }).done(function (data) {
      this.load(function () {
        this.trigger('workspace_collection_changed', this.workspaceCollection);
      }.bind(this));
    }.bind(this));
  };

this.updateUserListe = function (data) {
    console.log('load_all_profil_by_workspace - DEBUT - CALL-AJAX', data);
    $.ajax({
      method: 'get',
      url: '../data/core/workspaces/' + data._id.$oid + '/user/' + localStorage.user_id,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json'
    }).done(function (data) {
      console.log('load_all_profil_by_workspace - FIN - CALL-AJAX', data);
      if (data != false) {
        this.trigger('all_profil_by_workspace_loaded', data)
      } else {
        this.trigger('all_profil_by_workspace_loaded', data)
        this.trigger('no_profil')
      }

    }.bind(this));
  };


  this.select = function (record) {
    console.log('store select :', record);
    //record.mode = 'read';
    this.workspaceCurrent = record;
    console.log(this.workspaceCurrent);
    //this.workspaceCurrent.mode = 'read';
    for (listRecord of this.workspaceCollection) {
      if (listRecord._id.$oid == record._id.$oid) {
        listRecord.mainSelected = true;
      }
    }
    this.trigger('workspace_current_changed', this.workspaceCurrent);
    this.trigger('workspace_current_changed', this.workspaceCurrent);
    this.updateUserListe(this.workspaceCurrent)
  };

  this.on('workspace_delete', function (record) {
    this.delete(record);
  });

  this.on('workspace_collection_load', function (record) {
    if (this.cancelRequire == false) {
      console.log('LOAD');
      this.load(function () {
        for (workspace of this.workspaceCollection) {
          workspace.components = this.workspaceBusiness.connectWorkspaceComponent(workspace.components);
          //console.log('workspace_collection_load |',workspace.components);
        }
        this.trigger('workspace_collection_changed', this.workspaceCollection);
      }.bind(this));
    } else {
      this.cancelRequire = false;
      this.select(this.workspaceCurrent);
      //this.trigger('workspace_collection_changed', this.workspaceCollection);
    }
  });


  this.on('workspace_collection_share_load', function (record) {
    if (this.cancelRequire == false) {
      console.log('LOAD');
      this.loadShareWorkspace(function () {
        for (workspace of this.workspaceShareCollection) {
          workspace.components = this.workspaceBusiness.connectWorkspaceComponent(workspace.components);
          //console.log('workspace_collection_load |',workspace.components);
        }
        this.trigger('workspace_share_collection_changed', this.workspaceShareCollection);
      }.bind(this));
    } else {
      this.cancelRequire = false;
      this.select(this.workspaceCurrent);
      //this.trigger('workspace_collection_changed', this.workspaceCollection);
    }
  });


  this.on('workspace_synchoniseFromServer_byId', function (id) {
    console.log('workspace_synchoniseFromServer_workspace_byId', id);
    $.ajax({
      method: 'get',
      url: '../data/core/workspace/' + id,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      }
    }).done(function (data) {
      console.log('store load', data);
      var synchronizedWorkspaceCollection = [];
      console.log(this.workspaceCollection);
      for (var workspace of this.workspaceCollection) {
        if (workspace._id.$oid == data._id.$oid) {
          data.components = this.workspaceBusiness.connectWorkspaceComponent(data.components);
          synchronizedWorkspaceCollection.push(data);
          console.log('workspace_synchoniseFromServer_workspace_byId | workspaceCurrent | ', this.workspaceCurrent);
          console.log('workspace_synchoniseFromServer_workspace_byId | New workspaceCurrent | ', data);
          this.workspaceCurrent = data;
        } else {
          synchronizedWorkspaceCollection.push(workspace);
        }
      }
      this.workspaceCollection = synchronizedWorkspaceCollection;
      this.trigger('workspace_synchoniseFromServer_done', this.workspaceCollection);
      this.trigger('workspace_collection_changed', this.workspaceCollection);

    }.bind(this));
    /*this.load(function() {
      for (workspace of this.workspaceCollection) {
        workspace.components = this.workspaceBusiness.connectWorkspaceComponent(workspace.components);
        //console.log('workspace_collection_load |',workspace.components);
      }
      this.trigger('workspace_collection_changed', this.workspaceCollection);
    }.bind(this));*/

  });

  this.on('workspace_current_updateField', function (message) {
    //console.log(message.data);
    this.workspaceCurrent[message.field] = message.data;
    //console.log(this.workspaceCurrent);
    this.trigger('workspace_current_changed', this.workspaceCurrent);
  });

  this.on('workspace_current_select', function (record) {
    record.mode = 'read'
    this.select(record);
  });

  this.on('workspace_current_share_select', function (record) {
    record.mode = 'read'
    this.select(record);
  });

  this.on('workspace_current_cancel', function (record) {
    this.workspaceCurrent.mode = 'read'
  });

  this.on('workspace_current_edit', function (data) {
    //console.log('store edit',data||this.workspaceCurrent);
    if (data != undefined) {
      this.workspaceCurrent = data;
    }
    this.workspaceCurrent.mode = 'edit';
    //this.trigger('item_current_edit_mode', 'workspace');
    this.trigger('workspace_current_changed', this.workspaceCurrent);

  });

  this.on('workspace_current_init', function () {
    console.log('model : workspace_current_init');
    this.workspaceCurrent = {
      name: "",
      description: "",
      components: []
    };
    this.workspaceCurrent.mode = 'init';
    this.trigger('workspace_current_changed', this.workspaceCurrent);
  });

  this.on('workspace_current_refresh', function () {
    //console.log('model : workspace_current_refresh : ', this.workspaceCurrent);
    this.trigger('workspace_current_changed', this.workspaceCurrent);
  });

  this.on('workspace_current_persist', function (message) {
    console.log('workspace_current_persist | ', this.workspaceCurrent);
    /*this.workspaceCurrent.selected = undefined;
    this.workspaceCurrent.mainSelected = undefined;
    this.workspaceCurrent.mode = undefined;*/
    var mode = this.workspaceCurrent.mode;
    if (mode == 'init') {
      this.create();
    } else if (mode == 'edit') {
      this.update();
    }
  });


  this.on('technicalComponent_current_select', function (data) {
    //console.log('store select');
    //if (this.workspaceCurrent.mode == 'edit' || this.workspaceCurrent.mode == 'init') {
    //need to delete id because technical component is not a worksapceComponent
    //mlap depency (_id.$oid)
    //data.technicalComponentId=data._id.$oid;
    //data._id=undefined;
    console.log("SELECT TECHNICAL")
    data._id = undefined;
    this.workspaceCurrent.components.push(data);
    this.trigger('save_auto',this.workspaceCurrent)
    this.trigger('workspace_current_changed', this.workspaceCurrent);
    this.trigger('item_current_element_added', this.workspaceCurrent);
    //}
  });



  this.on('workspace_current_delete_component', function (record) {
    // console.log('workspace_current_delete_component', record);
    //var components = [];
    // this.workspaceCurrent.components.forEach(function(component) {
    //   if (component._id.$oid != record._id.$oid) {
    //     components.push(component);
    //   }
    // })
    this.workspaceCurrent.components.splice(record.rowId, 1);
    this.trigger('workspace_current_changed', this.workspaceCurrent);

  });
  /*
    this.on('workspace_current_update_component', function(record) {
      //console.log('workspaceStore | workspace_current_update_component:',record);
      for (workspaceComponentKey in this.workspaceCurrent.components) {
        if (this.workspaceCurrent.components[workspaceComponentKey]._id.$oid == record._id.$oid) {
          this.workspaceCurrent.components[workspaceComponentKey] = record;
        }
      }
      this.trigger('workspace_current_changed', this.workspaceCurrent);
    });*/



  this.on('item_current_cancel', function (data) {
    //console.log('item_current_cancel :',this.workspaceComponentCurrent);
    this.workspaceCurrent.mode = 'read';
    this.cancelRequire = true;
  });

  this.on('own_all_workspace', function (data) {
    $.ajax({
      method: 'get',
      url: '../data/core/workspaceOwnAll/' + localStorage.user_id,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json',
    }).done(function (data) {
      // console.log('store load', data);
      this.workspaceCollection = data;
      // if (callback != undefined) {
      //   callback();
      // }
      this.trigger('workspace_collection_changed', this.workspaceCollection);

    }.bind(this));
  });


}