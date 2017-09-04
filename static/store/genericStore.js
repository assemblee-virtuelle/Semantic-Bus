function GenericStore(specificStoreList) {


  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------


  riot.observable(this) // Riot provides our event emitter.
  for (specificStore of specificStoreList) {
    specificStore.genericStore=this;
  }
  this.workspaceBusiness = new WorkspaceBusiness();
  this.itemCurrent;
  this.connectMode;


  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------


  // ----------------------------------------- FUNCTION  -----------------------------------------


  this.update = function() {
    console.log('GenericStore || update',this.itemCurrent);
    $.ajax({
      method: 'put',
      url: '../data/core/workspaceComponent',
      data: JSON.stringify(this.itemCurrent),
      contentType: 'application/json',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      }
    }).done(function(data) {
      console.log("final ajax", data)
      this.itemCurrent = data;
      this.trigger('item_current_persist_done', this.itemCurrent);
    }.bind(this));
  };//<= update

  // --------------------------------------------------------------------------------

   this.persist = function() {
    console.log('GenericStore || persist',this.itemCurrent);
    var mode = this.itemCurrent.mode;
    if (mode == 'init') {
      this.create();
    } else if (mode == 'edit') {
      this.update();
    }
  }//<= persist

  // ----------------------------------------- EVENT  -----------------------------------------

  this.on('item_current_edit', function(data) {
    console.log("data out ajax item_current_edit ||", data)
    $.ajax({
      method: 'get',
      url: '../data/core//workspaceComponent/ConnectBeforeConnectAfter/' + data._id,
      contentType: 'application/json',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      }
    }).done(function(data) {
      this.itemCurrent = data;

      this.itemCurrent.mode = 'edit';
      this.itemCurrent.specificData=this.itemCurrent.specificData||{};
      console.log('item_current_edit | ',this.itemCurrent);
      this.trigger('item_current_edit_mode', 'generic', this.itemCurrent);
      this.trigger('workspace_current_click', this.itemCurrent);
      this.trigger('item_current_changed', this.itemCurrent);
    }.bind(this));
  }); //<= item_current_edit



  // --------------------------------------------------------------------------------


  this.on('item_current_updateField', function(message) {
    console.log('item_current_updateField ', message);
    this.itemCurrent[message.field] = message.data;
    this.trigger('item_current_changed', this.itemCurrent);
  });//<= item_current_updateField

  // --------------------------------------------------------------------------------



  this.on('item_current_persist', function(message) {
    console.log('item_current_persist',   this.workspaceBusiness.serialiseWorkspaceComponent(this.itemCurrent));
    this.persist();
  });//<=  item_current_persist

  // --------------------------------------------------------------------------------


  this.on('item_current_testPull', function(message) {
    console.log('item_current_testPull | itemCurrent:', this.itemCurrent);
    var id = this.itemCurrent._id;
    $.ajax({
      method: 'get',
      url: '../data/core/workspaceComponent/' + id + '/test',
      contentType: 'application/json',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      }
    }).done(function(data) {
      this.trigger('item_current_testPull_done', data);
    }.bind(this));
  });//<= item_current_testPull

  // --------------------------------------------------------------------------------


  this.on('item_current_work', function(message) {
    console.log('item_current_testWork | itemCurrent:', this.itemCurrent);
    var id = this.itemCurrent._id;
    $.ajax({
      method: 'get',
      url: '../data/core/workspaceComponent/' + id + '/work',
      contentType: 'application/json',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      }
    }).done(function(data) {
      this.trigger('item_current_work_done', data);
    }.bind(this));
  });//<= item_current_work

  // --------------------------------------------------------------------------------

  this.on('item_current_cancel', function(data) {
    console.log('item_current_cancel :',this.itemCurrent);
    if (this.itemCurrent) {
      this.itemCurrent.mode = undefined;
    }
  });
  this.on('item_current_connect_before', function(data) {
    this.connectMode = 'before';
  });
  this.on('item_current_connect_after', function(data) {
    this.connectMode = 'after';
  });//<= item_current_cancel

  // --------------------------------------------------------------------------------

  this.on('item_current_add_component', function(data) {
    console.log('item_current_add_component',this.connectMode);
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
  });//<= item_current_add_component

  // --------------------------------------------------------------------------------

  this.on('component_current_select',function(data){
    this.itemCurrent=data;
    this.trigger('item_current_edit_mode','generic', this.itemCurrent);
    this.trigger('item_current_changed', this.itemCurrent);
  });//<= item_current_select

   // --------------------------------------------------------------------------------
}
