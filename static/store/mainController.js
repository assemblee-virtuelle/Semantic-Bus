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
    modeProfilEdition: false,
    modeWorkspaceNavigation: false,
    modeWorkspaceShareNavigation: false,
    modeTechnicalComponentNavigation: false,
    modeAdminNavigation: false,
    modeWorkspaceEdition: false,
    modeWorksapceComponentEdition: false,
    modeConnectBefore: false,
    modeConnectAfter: false,
    modeMenuHide: false,
    modeGraph: false,
    modeUserList: false,
    modeTechnicalUserNavigation: false
  }
  this.updateMode = function (changedValueMode) {
    for (displayKey in this.displayMode) {
      if (changedValueMode[displayKey] != undefined) {
        this.displayMode[displayKey] = changedValueMode[displayKey];
      }
    }
    this.trigger('navigation_mode_changed', this.displayMode);
  }.bind(this)
  ////ON TEST SI LE USER A UN TOKEN VALIDE A CHAQUE ENTRE SUR APPLICATION.HTML///
  // Rmq : Call ajax a deplacer dans le profil Store ou User Store ?
  this.on('https_force?', function () {
    console.log("https_force")
     $.ajax({
        method: 'get',
        url: '/configuration/configurationhttps',
        }).done(data => {
          if(data == "force"){
            if(window.location.href.substr(0, 5) != "https"){
              console.log(window.location.href)
              window.location.replace("https" + window.location.href.substr(4, window.location.href.split("").length -1))
              // window.location.replace("https" + window.location.href.substr(5, window.location.href.split("").length -1))
            }
          }
          return data
        })
    })

  this.on('is_token_valid?', function () {
    console.log("trigger", localStorage.token)
    if (localStorage.token == null) {
      console.log("in null")
      this.trigger('login_redirect');
    } else {
      $.ajax({
        method: 'post',
        data: JSON.stringify({
          token: localStorage.token
        }),
        contentType: 'application/json',
        url: '/auth/isTokenValid',
        beforeSend: function () {
          console.log("before send")
          this.trigger('ajax_send');
        }.bind(this),
        success: function (data) {
          console.log("after send")
          // this.trigger('ajax_receipt');
        }.bind(this)
      }).done(data => {
        console.log('is_token_valid | ', data);
        if (data.iss != null) {
          this.trigger('ajax_receipt');
          console.log(data);
          ///HERE HERE
          localStorage.googleid = data.subject;
          localStorage.user_id = data.iss;
          console.log(localStorage);
          this.trigger('user_authentified');
        } else {
          this.trigger('login_redirect');
          // window.open("../auth/login.html", "_self");
        }
      });
    }
  })

  this.on('item_current_persist', function () {
    this.trigger('persist_start');
  });

  //PROFIL STORE
  this.on('profil_show', function (message) {
    console.log("profil_show")
    profilStore.trigger('load_profil');
    this.updateMode({
      modeProfilEdition: true,
      modeTechnicalComponentNavigation: false,
      modeWorkspaceNavigation: false,
      modeWorkspaceShareNavigation: false,
      modeWorkspaceEdition: false,
      modeAdminNavigation: false
    });
  }.bind(this))

  this.on('admin_show', function (message) {
    this.updateMode({
      modeProfilEdition: false,
      modeTechnicalComponentNavigation: false,
      modeWorkspaceNavigation: false,
      modeWorkspaceEdition: false,
      modeWorkspaceShareNavigation: false,
      modeAdminNavigation: true
    });
  }.bind(this))

  genericStore.on('item_current_persist_done', function (message) {
    if (message.workspaceId != undefined) {
      workSpaceStore.trigger('workspace_synchoniseFromServer_byId', message.workspaceId);
    } else {
      this.trigger('workspace_synchoniseFromServer_done', this.workspaceCollection);
    }
  }.bind(this));

  workSpaceStore.on('workspace_synchoniseFromServer_done', function (message) {
    console.log('SYNC DONE');
    this.trigger('persist_end');
  }.bind(this));

  workSpaceStore.on('workspace_current_persist_done', function (message) {
    this.updateMode({
      modeTechnicalComponentNavigation: false,
      modeTechnicalUserNavigation: false
      //modeWorkspaceNavigation : false,
    });
    this.trigger('persist_end');
  }.bind(this));
  this.on('workspace_current_persist', function () {
    this.trigger('persist_start');
  });

  workSpaceStore.on('item_current_element_added', function (message) {
    this.updateMode({
      modeTechnicalComponentNavigation: false,
    });
  }.bind(this));

  genericStore.on('item_current_element_added', function (message) {
    this.updateMode({
      modeNavigation: false,
      modeEdition: true,
      modeConnectBefore: false,
      modeConnectAfter: false
    });
  }.bind(this));



  // this.on('technicalComponent_current_select', function(message) {
  //   //console.log('MAIN technicalComponent_current_select');
  //   this.currentEditStore.addComponent(message);
  // });

  this.on('technicalComponent_show', function (message) {
    this.updateMode({
      modeTechnicalComponentNavigation: true,
      modeProfilEdition: false,
      modeWorkspaceNavigation: false,
      modeAdminNavigation: false,
      modeWorkspaceEdition: false,
      modeWorkspaceShareNavigation: false
    });
  });

  this.on('navigation_mode_edition_only', function (message) {
    this.updateMode({
      modeNavigation: false,
      modeEdition: true
    });
  });
  this.on('navigation_mode_edition_and_navigation', function (message) {
    this.updateMode({
      modeProfilEdition: true,
      modeNavigation: true,
      modeEdition: true
    });
  });

  this.on('navigation_mode_user_list', function (message) {
    this.updateMode({
      modeUserList: true,
    });
  });

  this.on('navigation_mode_composant_list', function (message) {
    this.updateMode({
      modeUserList: false,
    });
  });

  this.on('workspace_show', function (message) {
    this.updateMode({
      modeTechnicalComponentNavigation: false,
      modeProfilEdition: false,
      modeWorkspaceNavigation: true,
      modeAdminNavigation: false,
      modeWorkspaceEdition: false,
      modeWorkspaceShareNavigation: false
    });
  });

  this.on('workspace_share_show', function (message) {
    this.updateMode({
      modeTechnicalComponentNavigation: false,
      modeProfilEdition: false,
      modeWorkspaceNavigation: false,
      modeAdminNavigation: false,
      modeWorkspaceEdition: false,
      modeWorkspaceShareNavigation: true
    });
  });
  this.on('workspace_current_add_component', function (record) {
    this.updateMode({
      modeNavigation: true,
      modeEdition: false,
      modeTechnicalComponentNavigation: true,
      modeTechnicalUserNavigation: false,
      modeMenuHide: true,
      modeWorkspaceNavigation: false,
      modeWorkspaceShareNavigation: false
    });
    // this.trigger('navigator_mount', 'technical-component-table');
  });

  this.on('workspace_current_add_user', function (record) {
    this.updateMode({
      modeNavigation: true,
      modeEdition: false,
      modeTechnicalComponentNavigation: false,
      modeTechnicalUserNavigation: true,
      modeMenuHide: true,
      modeWorkspaceShareNavigation: false,
      modeWorkspaceNavigation: false
    });
  });

  this.on('workspace_current_edit', function (message) {
    this.updateMode({
      modeComponentTest: false,
      modeComponentNetwork: false,
      modeNavigation: true,
      modeEdition: false,
      modeWorkspaceNavigation: false,
      modeWorksapceEdition: true,
      modeWorkspaceShareNavigation: false,
      modeMenuHide: true
    });
  });

  this.on('workspace_current_graph', function (message) {
    this.updateMode({
      modeComponentTest: false,
      modeComponentNetwork: false,
      modeNavigation: false,
      modeEdition: true,
      modeGraph: true,
      modeWorkspaceNavigation: false,
      modeWorkspaceShareNavigation: false,
      modeWorksapceEdition: false,
      modeMenuHide: true

    });
  });

  this.on('workspace_current_init', function (message) {
    this.updateMode({
      modeComponentTest: false,
      modeComponentNetwork: false,
      modeNavigation: true,
      modeWorkspaceNavigation: false,
      modeWorkspaceEdition: true,
      modeWorkspaceShareNavigation: false,
      modeEdition: false,
      modeMenuHide: true
    });
    this.workspaceStore.trigger('workspace_current_init', message);
  });

  this.on('workspace_current_cancel', function (message) {
    this.updateMode({
      modeWorkspaceEdition: true,
      modeWorkspaceNavigation: false,
      modeTechnicalComponentNavigation: false,
      modeTechnicalUserNavigation: false
    });
  });

  this.on('workspace_current_select', function (record) {
    this.updateMode({
      modeComponentTest: false,
      modeComponentNetwork: false,
      modeNavigation: true,
      modeWorkspaceNavigation: false,
      modeWorkspaceEdition: true,
      modeWorkspaceShareNavigation: false,
      modeEdition: false,
      modeMenuHide: true
    });
    this.workspaceStore.trigger('workspace_current_select', record)
  });

  this.on('item_current_cancel', function (message) {
    this.updateMode({
      modeNavigation: true,
      modeEdition: false
    });
  });

  this.on('item_current_click', function (message) {
    //console.log('MainController | item_current_click');
    if (this.displayMode.modeNavigation && !this.displayMode.modeEdition) {
      this.genericStore.trigger('item_current_edit', message);
    } else if (this.displayMode.modeConnectBefore || this.displayMode.modeConnectAfter) {
      //console.log('MainController | add Component');
      this.genericStore.trigger('item_current_add_component', message);
    }
  });

  genericStore.on('item_current_edit_mode', function (message) {
    //console.log('currentItemType  Before:',this.currentItemType);
    this.currentEditStore = genericStore;
    this.updateMode({
      modeComponentNetwork: true,
      modeEdition: true,
      modeGraph: false,
      modeNavigation: false,
    });
    //console.log('currentItemType  :',this.currentItemType);
  }.bind(this));


  workSpaceStore.on('item_current_edit_mode', function (message) {
    //console.log('currentItemType  Before:',this.currentItemType);
    this.currentEditStore = workSpaceStore;
    //console.log('currentItemType  :',this.currentItemType);
  }.bind(this));

  this.on('item_current_connect_before', function (data) {
    this.updateMode({
      modeConnectBefore: true,
    });
  });

  this.on('item_current_cancel_connect_before', function (data) {
    //console.log('item_current_cancel_connect_before');
    this.updateMode({
      modeConnectBefore: false
    });
  });

  this.on('item_current_connect_after', function (data) {
    this.updateMode({
      modeConnectAfter: true
    });
  });

  this.on('item_current_cancel_connect_after', function (data) {
    this.updateMode({
      modeConnectAfter: false,
    });
  });

  this.on('item_current_editById', function (id) {
    console.log('GenericStore edit byId | components |', this.workspaceStore.workspaceCurrent.components);
    for (var workspaceComponent of this.workspaceStore.workspaceCurrent.components) {
      if (workspaceComponent._id.$oid == id) {
        console.log('GenericStore edit byId | component finded |', workspaceComponent);
        genericStore.trigger('item_current_edit', workspaceComponent);
        break;
      }
    }
  });

  this.on('menu_show', function (data) {
    this.updateMode({
      modeMenuHide: false
    });
  });

  this.on('clone_database', function (data) {
    $.ajax({
      method: 'get',
      url: '../data/core/cloneDatabase',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json',
    }).done(function (data) {
      //console.log('store load', data);
      //this.workspaceCollection = data;
      //if (callback != undefined) {
      //  callback();
      //}
      this.trigger('dataBase_cloned', this.workspaceCollection);

    }.bind(this));
  });

}