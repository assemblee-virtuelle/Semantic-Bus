function GenericStore(specificStoreList) {
  riot.observable(this) // Riot provides our event emitter.
  for (specificStore of specificStoreList) {
    specificStore.genericStore=this;
  }
  this.workspaceBusiness = new WorkspaceBusiness();
  this.itemCurrent;
  this.connectMode;

  this.update = function() {
    console.log('GenericStore || update',this.itemCurrent);
    $.ajax({
      method: 'put',
      url: '../data/core/workspaceComponent',
      data: JSON.stringify(  this.workspaceBusiness.serialiseWorkspaceComponent(this.itemCurrent)),
      contentType: 'application/json',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      }
    }).done(function(data) {
      //this.workspaceCurrent.mode='edit';
      //this.trigger('workspace_current_create_done',this.workspaceCurrent);
      //console.log('GenericStore | update | data returned |',data);
      this.itemCurrent = data;
      //this.trigger('workspace_current_create_done | workspaceCurrent:',this.workspaceCurrent);
      this.trigger('item_current_persist_done', this.itemCurrent);
    }.bind(this));
  };

  this.on('item_current_edit', function(data) {
    console.log('GenericStore edit', data);
    if (data != undefined) {
      this.itemCurrent = data;
    }
    this.itemCurrent.mode = 'edit';
    this.trigger('item_current_edit_mode', 'generic', this.itemCurrent);
    this.trigger('item_current_changed', this.itemCurrent);
  });


  this.on('item_current_updateField', function(message) {
    //console.log('item_current_updateField :', message);
    this.itemCurrent[message.field] = message.data;
    //console.log(this.workspaceCurrent);
    this.trigger('item_current_changed', this.itemCurrent);
  });
  this.persist = function() {
    var mode = this.itemCurrent.mode;
    if (mode == 'init') {
      this.create();
    } else if (mode == 'edit') {
      this.update();
    }
  }

  this.on('item_current_persist', function(message) {
    console.log('item_current_persist',   this.workspaceBusiness.serialiseWorkspaceComponent(this.itemCurrent));

    //this.itemCurrent.selected = undefined;
    //this.itemCurrent.mainSelected = undefined;
    this.persist();
  });

  this.on('item_current_testPull', function(message) {
    console.log('item_current_testPull | itemCurrent:', this.itemCurrent);
    var id = this.itemCurrent._id.$oid;
    $.ajax({
      method: 'get',
      url: '../data/core/workspaceComponent/' + id + '/test',
      contentType: 'application/json',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      }
    }).done(function(data) {
      //this.workspaceCurrent.mode='edit';
      //this.trigger('workspace_current_create_done',this.workspaceCurrent);
      console.log(data);
      this.trigger('item_current_testPull_done', data);
      //this.trigger('previewJSON', data);
      //this.trigger('item_current_persist_done', this.itemCurrent);
    }.bind(this));
  });

  this.on('item_current_work', function(message) {
    console.log('item_current_testWork | itemCurrent:', this.itemCurrent);
    var id = this.itemCurrent._id.$oid;
    $.ajax({
      method: 'get',
      url: '../data/core/workspaceComponent/' + id + '/work',
      contentType: 'application/json',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      }
    }).done(function(data) {
      //this.workspaceCurrent.mode='edit';
      //this.trigger('workspace_current_create_done',this.workspaceCurrent);
      console.log(data);
      this.trigger('item_current_work_done', data);
      //this.trigger('previewJSON', data);
      //this.trigger('item_current_persist_done', this.itemCurrent);
    }.bind(this));
  });

  this.on('item_current_cancel', function(data) {
    //console.log('item_current_cancel :',this.itemCurrent);
    if (this.itemCurrent) {
      this.itemCurrent.mode = undefined;
    }
  });
  this.on('item_current_connect_before', function(data) {
    this.connectMode = 'before';
  });
  this.on('item_current_connect_after', function(data) {
    this.connectMode = 'after';
  });

  this.on('item_current_add_component', function(data) {
    //console.log('item_current_add_component',this.connectMode);
    switch (this.connectMode) {
      case 'before':
        this.itemCurrent.connectionsBefore = this.itemCurrent.connectionsBefore || [];
        this.itemCurrent.connectionsBefore.push(data);
        break;
      case 'after':
        this.itemCurrent.connectionsAfter = this.itemCurrent.connectionsAfter|| [];
        this.itemCurrent.connectionsAfter.push(data);
        break;
      default:
    }
    this.trigger('item_current_element_added', this.workspaceCurrent);
    this.trigger('item_current_changed', this.itemCurrent);
  });

  this.on('item_current_select',function(data){
    this.itemCurrent=data;
    this.trigger('item_current_edit_mode','generic', this.itemCurrent);
    this.trigger('item_current_changed', this.itemCurrent);
  });
}
