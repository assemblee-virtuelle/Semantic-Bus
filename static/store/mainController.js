function MainController(workSpaceStore, genericStore, profilStore) {
  riot.observable(this) // Riot provides our event emitter.
  this.workspaceStore = workSpaceStore;
  this.genericStore = genericStore;
  this.profilStore = profilStore;
  this.currentEditStore;
  this.displayMode = {
    modeNavigation: true,
    modeEdition: false,
    modeComponentNetwork: false,
    modeComponentTest: false,
    modeProfilEdition : false
  }
  this.updateMode = function(changedValueMode) {
    this.displayMode.modeProfilEdition = changedValueMode.modeProfilEdition != undefined ? changedValueMode.modeProfilEdition : this.displayMode.modeProfilEdition;
    this.displayMode.modeNavigation = changedValueMode.modeNavigation != undefined ? changedValueMode.modeNavigation : this.displayMode.modeNavigation;
    this.displayMode.modeEdition = changedValueMode.modeEdition != undefined ? changedValueMode.modeEdition : this.displayMode.modeEdition;
    this.displayMode.modeComponentNetwork = changedValueMode.modeComponentNetwork != undefined ? changedValueMode.modeComponentNetwork : this.displayMode.modeComponentNetwork;
    this.displayMode.modeComponentTest = changedValueMode.modeComponentTest != undefined ? changedValueMode.modeComponentTest : this.displayMode.modeComponentTest;
    this.trigger('navigation_mode_changed', this.displayMode);
  }.bind(this)

  ////ON TEST SI LE USER A UN TOKEN VALIDE A CHAQUE ENTRE SUR APPLICATION.HTML///
  // Rmq : Call ajax a deplacer dans le profil Store ou User Store ? 
   this.on('is_token_valid?', function() {
    $.ajax({
      method: 'post',
      data: JSON.stringify({token: localStorage.token}),
      contentType: 'application/json',
      url: '/auth/isTokenValid',
    }).done(data => {
      if(data){
        localStorage.user_id = data.iss;
        console.log(localStorage);
      }
      else{
         window.open("../auth/login.html", "_self");
      }
    });
   })

  this.on('item_current_persist', function() {
    this.trigger('persist_start');
  });

  //PROFIL STORE 

  this.on('show_profil', function(message) {
    profilStore.trigger('load_profil');
    this.updateMode({
      modeProfilEdition: true
    });
  }.bind(this))


  /* genericStore.on('item_current_persist_done', function(message) {
        workSpaceStore.trigger('workspace_current_update_component', genericStore.itemCurrent)
      });*/

  genericStore.on('item_current_persist_done', function(message) {
    if(message.workspaceId!=undefined){
      workSpaceStore.trigger('workspace_synchoniseFromServer_byId', message.workspaceId);
    }else{
      this.trigger('workspace_synchoniseFromServer_done', this.workspaceCollection);
    }
  }.bind(this));

  workSpaceStore.on('workspace_synchoniseFromServer_done', function(message) {
    console.log('SYNC DONE');
    this.trigger('persist_end');
  }.bind(this));

  workSpaceStore.on('workspace_current_persist_done', function(message) {
    this.trigger('persist_end');
  }.bind(this));
  this.on('workspace_current_persist', function() {
    this.trigger('persist_start');
  });

  genericStore.on('item_current_edit_mode', function(message) {
    //console.log('currentItemType  Before:',this.currentItemType);
    this.currentEditStore = genericStore;
    this.updateMode({
      modeComponentNetwork: true
    });
    //console.log('currentItemType  :',this.currentItemType);
  }.bind(this));


  workSpaceStore.on('item_current_edit_mode', function(message) {
    //console.log('currentItemType  Before:',this.currentItemType);
    this.currentEditStore = workSpaceStore;
    //console.log('currentItemType  :',this.currentItemType);
  }.bind(this));

  workSpaceStore.on('item_current_element_added', function(message) {
    this.updateMode({
      modeNavigation: false,
      modeEdition: true
    });
  }.bind(this));

  genericStore.on('item_current_element_added', function(message) {
    this.updateMode({
      modeNavigation: false,
      modeEdition: true
    });
  }.bind(this));



  this.on('technicalComponent_current_select', function(message) {
    //console.log('MAIN technicalComponent_current_select');
    this.currentEditStore.addComponent(message);
  });

  this.on('navigation_mode_edition_only', function(message) {
    this.updateMode({
      modeNavigation: false,
      modeEdition: true
    });
  });
  this.on('navigation_mode_edition_and_navigation', function(message) {
    this.updateMode({
      modeProfilEdition: true,
      modeNavigation: true,
      modeEdition: true
    });
  });



  this.on('workspace_current_add_component', function(record) {
    this.updateMode({
      modeNavigation: true,
      modeEdition: true
    });
    this.trigger('navigator_mount', 'technical-component-table');
  });

  this.on('workspace_current_edit', function(message) {
    this.updateMode({
      modeComponentTest: false,
      modeComponentNetwork: false
    });
  });

  this.on('item_current_cancel', function(message) {
    this.updateMode({
      modeNavigation: true,
      modeEdition: false
    });
  });

  this.on('item_current_click', function(message) {
    //console.log('MainController | item_current_click');
    if (this.displayMode.modeNavigation && !this.displayMode.modeEdition) {
      this.genericStore.trigger('item_current_edit', message);
    } else if (this.displayMode.modeNavigation && this.displayMode.modeEdition) {
      //console.log('MainController | add Component');
      this.genericStore.trigger('item_current_add_component', message);
    }
  });

  this.on('item_current_connect_after', function(data) {
    this.updateMode({
      modeNavigation: true
    });
  });

  this.on('item_current_connect_before', function(data) {
    this.updateMode({
      modeNavigation: true
    });
  });

  this.on('item_current_editById', function(id) {
    console.log('GenericStore edit byId | components |', this.workspaceStore.workspaceCurrent.components);
    for (var workspaceComponent of this.workspaceStore.workspaceCurrent.components) {
      if (workspaceComponent._id.$oid == id) {
        console.log('GenericStore edit byId | component finded |', workspaceComponent);
        genericStore.trigger('item_current_edit', workspaceComponent);
        break;
      }
    }
  });

}
