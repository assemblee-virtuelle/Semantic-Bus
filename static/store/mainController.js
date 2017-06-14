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
    modeProfilEdition : false,
    modeWorkspaceNavigation : false,
    modeTechnicalComponentNavigation : false,
    modeAdminNavigation : false,
    modeWorkspaceEdition : false,
    modeWorksapceComponentEdition : false,
    modeMenuHide : false
  }
  this.updateMode = function(changedValueMode) {
    for(displayKey in this.displayMode ){
      if(changedValueMode[displayKey]!=undefined){
        this.displayMode[displayKey]=changedValueMode[displayKey];
      }
    }
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
      console.log('is_token_valid | ',data);
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
  this.on('profil_show', function(message) {
    profilStore.trigger('load_profil');
    this.updateMode({
      modeProfilEdition: true,
      modeTechnicalComponentNavigation: false,
      modeWorkspaceNavigation : false,
      modeWorkspaceEdition :false,
      modeAdminNavigation : false
    });
  }.bind(this))

  this.on('admin_show', function(message) {
    this.updateMode({
      modeProfilEdition: false,
      modeTechnicalComponentNavigation: false,
      modeWorkspaceNavigation : false,
      modeWorkspaceEdition :false,
      modeAdminNavigation : true
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
    this.updateMode({
      modeTechnicalComponentNavigation: false,
      modeWorkspaceNavigation : true,
    });
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

  // workSpaceStore.on('item_current_element_added', function(message) {
  //   this.updateMode({
  //     modeNavigation: false,
  //     modeEdition: true
  //   });
  // }.bind(this));

  genericStore.on('item_current_element_added', function(message) {
    this.updateMode({
      modeNavigation: false,
      modeEdition: true
    });
  }.bind(this));



  // this.on('technicalComponent_current_select', function(message) {
  //   //console.log('MAIN technicalComponent_current_select');
  //   this.currentEditStore.addComponent(message);
  // });

  this.on('technicalComponent_show', function(message) {
    this.updateMode({
      modeTechnicalComponentNavigation: true,
      modeProfilEdition : false,
      modeWorkspaceNavigation : false,
      modeAdminNavigation : false,
      modeWorkspaceEdition : false
    });
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


  this.on('workspace_show', function(message) {
    this.updateMode({
      modeTechnicalComponentNavigation: false,
      modeProfilEdition : false,
      modeWorkspaceNavigation : true,
      modeAdminNavigation : false,
      modeWorkspaceEdition : false
    });
  });
  this.on('workspace_current_add_component', function(record) {
    this.updateMode({
      modeNavigation: true,
      modeEdition: false,
      modeTechnicalComponentNavigation: true,
      modeMenuHide:true,
      modeWorkspaceNavigation:false
    });
    //this.trigger('navigator_mount', 'technical-component-table');
  });

  this.on('workspace_current_edit', function(message) {
    this.updateMode({
      modeComponentTest: false,
      modeComponentNetwork: false,
      modeNavigation: true,
      modeEdition: false,
      modeWorkspaceNavigation : false,
      modeWorksapceEdition : true,
      modeMenuHide:true

    });
  });

  this.on('workspace_current_init', function(message) {
    this.updateMode({
      modeComponentTest: false,
      modeComponentNetwork: false,
      modeNavigation: true,
      modeWorkspaceNavigation : false,
      modeWorkspaceEdition : true,
      modeEdition: false,
      modeMenuHide : true
    });
    this.workspaceStore.trigger('workspace_current_init',message);
  });

  this.on('workspace_current_cancel', function(message) {
    this.updateMode({
      modeWorkspaceEdition : true,
      modeWorkspaceNavigation : true,
      modeTechnicalComponentNavigation: false,
    });
  });

  this.on('workspace_current_select', function(record) {
    this.updateMode({
      modeComponentTest: false,
      modeComponentNetwork: false,
      modeNavigation: true,
      modeWorkspaceEdition : true,
      modeEdition: false,
      modeMenuHide : true
    });
    this.workspaceStore.trigger('workspace_current_select',record)
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

  this.on('menu_show', function(data) {
    this.updateMode({
      modeMenuHide : false
    });
  });

  this.on('clone_database', function(data) {

  });

}
