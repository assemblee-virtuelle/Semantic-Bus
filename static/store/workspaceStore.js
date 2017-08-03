function WorkspaceStore() {


  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------


  riot.observable(this)
  this.workspaceCollection = [];
  this.workspaceShareCollection = []
  this.workspaceCurrent;
  this.workspaceBusiness = new WorkspaceBusiness();
  this.cancelRequire = false;


  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------


   // ----------------------------------------- FUNCTION  -----------------------------------------


  this.load = function (callback) {
    console.log('load workspace to ||', localStorage.user_id);
    $.ajax({
      method: 'get',
      url: '../data/core/workspaceByUser/' + localStorage.user_id,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json',
    }).done(function (data) {
      console.log('load workspace', data);
      this.workspaceCollection = data;
      if (callback != undefined) {
        callback();
      }
      this.trigger('workspace_collection_changed', this.workspaceCollection);

    }.bind(this));
  }; //<= load_workspace

  // --------------------------------------------------------------------------------

  this.loadShareWorkspace = function (callback) {
    console.log('load share workspace');
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
      this.trigger('workspace_share_collection_changed', this.workspaceShareCollection);
    }.bind(this));
  }; //<= load_share_workspace

  // --------------------------------------------------------------------------------

  this.create = function () {
    console.log('create');
    $.ajax({
      method: 'post',
      url: '../data/core/workspace/' + localStorage.user_id,
      data: JSON.stringify(this.workspaceCurrent),
      contentType: 'application/json',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
    }).done(function (data) {
      this.load(function (data) {
        this.trigger('workspace_current_persist_done');
        data.mode = 'read';
        this.select(data);
      }.bind(this, data));
    }.bind(this));
  }; //<= create

  // --------------------------------------------------------------------------------

  this.update = function (data) {
    console.log('update');
    if (data) {
      if (data.component) {
        var ajax_data = JSON.stringify({
          workspace: this.workspaceBusiness.serialiseWorkspace(this.workspaceCurrent),
          component: data.component
        });
        console.log(JSON.stringify(ajax_data))
      } else {
        var ajax_data = JSON.stringify(this.workspaceBusiness.serialiseWorkspace(this.workspaceCurrent))
      }
    } else {
      var ajax_data = JSON.stringify(this.workspaceBusiness.serialiseWorkspace(this.workspaceCurrent))
    }
    $.ajax({
      method: 'put',
      url: '../data/core/workspace',
      data: ajax_data,
      contentType: 'application/json',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
    }).done(function (data) {
      console.log('update data ||', data);
      this.load(function () {
        data.mode = 'read';
        this.trigger('workspace_current_persist_done', data);
      }.bind(this));
      this.workspaceCurrent.mode = 'edit';
    }.bind(this));
  }; //<= update

  // --------------------------------------------------------------------------------

  this.delete = function (record) {
    console.log('delete row');
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
  }; //<= delete

  // --------------------------------------------------------------------------------

  this.updateUserListe = function (data) {
    console.log('updateUserListe');
    $.ajax({
      method: 'get',
      url: '../data/core/workspaces/' + data._id + '/user/' + localStorage.user_id,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json'
    }).done(function (data) {
      if (data != false) {
        this.trigger('all_profil_by_workspace_loaded', data)
      } else {
        this.trigger('no_profil')
      }

    }.bind(this));
  }; // <= updateUserListe


  // --------------------------------------------------------------------------------


  this.updateComponentListe = function (data) {
    console.log('update Component Liste');
    $.ajax({
      method: 'get',
      url: '../data/core/workspace/' + data._id,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json'
    }).done(function (data) {
      console.log("update Component Liste Done ||", data)
      if (data != false) {
        this.workspaceCurrent = data
        this.trigger('all_component_by_workspace_loaded', data)
      } else {
        this.trigger('no_profil')
      }

    }.bind(this));
  }; // <= updateComponentList


  // --------------------------------------------------------------------------------

  this.select = function (record) {
    console.log('select ||', record);
    //record.mode = 'read';
    this.workspaceCurrent = record;
    //this.workspaceCurrent.mode = 'read';
    // for (listRecord of this.workspaceCollection) {
    //   console.log(listRecord)
    //   if (listRecord._id.$oid == record._id.$oid) {
    //     listRecord.mainSelected = true;
    //   }
    // }
    this.trigger('workspace_current_changed', this.workspaceCurrent);
    this.updateUserListe(this.workspaceCurrent)
    this.updateComponentListe(this.workspaceCurrent)
  };// <= select

  // ----------------------------------------- EVENT  -----------------------------------------

  this.on('workspace_delete', function (record) {
     console.log('ON workspace_delete ||', record);
    this.delete(record);
  });// <= workspace_delete

  // --------------------------------------------------------------------------------

  this.on('workspace_collection_load', function (record) {
    console.log('ON workspace_collection_load ||', record);
    if (this.cancelRequire == false) {
      this.load()
    } else {
      this.cancelRequire = false;
      this.select(this.workspaceCurrent);
    }
  });// <= workspace_collection_load

 // --------------------------------------------------------------------------------

  this.on('workspace_collection_share_load', function (record) {
    console.log('ON workspace_collection_share_load ||', record);
    if (this.cancelRequire == false) {
      this.loadShareWorkspace(function () {
        for (workspace of this.workspaceShareCollection) {
          workspace.components = this.workspaceBusiness.connectWorkspaceComponent(workspace.components);
        }
        this.trigger('workspace_share_collection_changed', this.workspaceShareCollection);
      }.bind(this));
    } else {
      this.cancelRequire = false;
      this.select(this.workspaceCurrent);
    }
  });// <= workspace_collection_share_load


  // -------------------------------------------------------------------------------- 


  this.on('workspace_synchoniseFromServer_byId', function (id) {
    console.log('workspace_synchoniseFromServer_workspace_byId', id);
    $.ajax({
      method: 'get',
      url: '../data/core/workspace/' + id,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      }
    }).done(function (data) {
      var synchronizedWorkspaceCollection = [];
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
  });// <= workspace_synchoniseFromServer_byId

  // -------------------------------------------------------------------------------- 

  this.on('workspace_current_updateField', function (message) {
    console.log('workspace_current_updateField ||',message)
    this.workspaceCurrent[message.field] = message.data;
    this.trigger('workspace_current_changed', this.workspaceCurrent);
  }); // <= workspace_current_updateField

  // -------------------------------------------------------------------------------- 

  this.on('workspace_current_select', function (record) {
    console.log('workspace_current_select ||',record)
    record.mode = 'read'
    this.select(record);
  });// <= workspace_current_select

  // -------------------------------------------------------------------------------- 

  this.on('workspace_current_share_select', function (record) {
    console.log('workspace_current_share_select ||',record)
    record.mode = 'read'
    this.select(record);
  });// <= workspace_current_share_select

  // -------------------------------------------------------------------------------- 

  this.on('workspace_current_cancel', function (record) {
    console.log('workspace_current_cancel ||',record)
    this.workspaceCurrent.mode = 'read'
  });// <= workspace_current_cancel

  // -------------------------------------------------------------------------------- 

  this.on('workspace_current_edit', function (data) {
    console.log("workspace_current_edit", data)
    this.workspaceCurrent.mode = 'edit';
    this.trigger('workspace_current_changed', this.workspaceCurrent);
  });// <= workspace_current_edit

  // -------------------------------------------------------------------------------- 

  this.on('workspace_current_init', function () {
    console.log('model : workspace_current_init');
    this.workspaceCurrent = {
      name: "",
      description: "",
      components: []
    };
    this.workspaceCurrent.mode = 'init';
    this.trigger('workspace_current_changed', this.workspaceCurrent);
  });// <= workspace_current_init

  // -------------------------------------------------------------------------------- 


  this.on('workspace_current_refresh', function () {
    console.log('workspace_current_refresh || ', this.workspaceCurrent);
    this.trigger('workspace_current_changed', this.workspaceCurrent);
  });// <= workspace_current_refresh

  // -------------------------------------------------------------------------------- 


  this.on('workspace_current_persist', function (data) {
    console.log('workspace_current_persist ||', data);
    var mode = this.workspaceCurrent.mode;
    if (mode == 'init') {
      this.create();
    } else if (mode == 'edit') {
      this.update(data);
    }
  });// <= workspace_current_persist

  // -------------------------------------------------------------------------------- 

  this.on('technicalComponent_current_select', function (data) {
    console.log("technicalComponent_current_select ||", data)
    data.workspaceId = this.workspaceCurrent._id
    this.workspaceCurrent.components.push(data);
    this.trigger('save_auto', {
      workspace: this.workspaceCurrent,
      component: data
    })
  }); //<= technicalComponent_current_select

// -------------------------------------------------------------------------------- 

  this.on('workspace_current_delete_component', function (record) {
     console.log("workspace_current_delete_component ||", record)
    this.workspaceCurrent.components.splice(record.rowId, 1);
    this.trigger('workspace_current_changed', this.workspaceCurrent);

  });//<= workspace_current_delete_component
  
// -------------------------------------------------------------------------------- 


  this.on('item_current_cancel', function (data) {
    console.log('item_current_cancel ||',data);
    this.workspaceCurrent.mode = 'read';
    this.cancelRequire = true;
  });//<= item_current_cancel

  // -------------------------------------------------------------------------------- 


  this.on('own_all_workspace', function (data) {
    $.ajax({
      method: 'get',
      url: '../data/core/workspaceOwnAll/' + localStorage.user_id,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json',
    }).done(function (data) {
      this.workspaceCollection = data;
      this.trigger('workspace_collection_changed', this.workspaceCollection);
    }.bind(this));
  });//<= own_all_workspace

   // -------------------------------------------------------------------------------- 



}