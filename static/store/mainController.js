function MainController(allStore,stompClient) {
  console.log(allStore);
  riot.observable(this) // Riot provides our event emitter.
  for(store in allStore){
    allStore[store].mainController = this;
    this[store]=allStore[store];
  }

  this.on('https_force?', function() {
    console.log("https_force")
    $.ajax({
      method: 'get',
      url: '/configuration/configurationhttps',
    }).done(data => {
      console.log("in return HTTPS", data)
      console.log(window.location.href)
      if (data == "force") {
        if (window.location.href.substr(0, 5) != "https") {
          console.log(window.location.href)
          window.location.replace("https" + window.location.href.substr(4, window.location.href.split("").length - 1))
          // window.location.replace("https" + window.location.href.substr(5, window.location.href.split("").length -1))
        }
      }
      //return data
    })
  })

  this.on('init_stripe', function() {
    console.log("https_force")
    $.ajax({
      method: 'get',
      url: '/configuration/stripePublicKey',
    }).done(data => {
      console.log("in return STRIPE PUBLIC KEY", data)
      localStorage.stripe_public_key = data
      //return data
    })
  })

  this.on('is_token_valid?', function() {
    console.log(localStorage.token)
    if (localStorage.token == 'null' || localStorage.token == null) {
      this.trigger('login_redirect');
    } else {
      $.ajax({
        method: 'post',
        data: JSON.stringify({
          token: localStorage.token
        }),
        contentType: 'application/json',
        url: '/auth/isTokenValid',
        beforeSend: function() {
          console.log("before send")
          this.trigger('ajax_send');
        }.bind(this),
        success: function(data) {
          console.log("after send")
          // this.trigger('ajax_receipt');
        }.bind(this)
      }).done(data => {
        console.log('is_token_valid | ', data);
        if (data.iss != null) {
          this.trigger('ajax_receipt');
          ///HERE HERE
          localStorage.googleid = data.subject;
          localStorage.user_id = data.iss;
          this.profilStore.setUserCurrent(data.profil);
          this.workspaceStore.setGlobalWorkspaceCollection(data.profil.workspaces);
          this.trigger('user_authentified');
        } else {
          localStorage.token = null
          localStorage.googleid = null
          localStorage.user_id = null
          this.trigger('login_redirect');
          // window.open("../auth/login.html", "_self");
        }
      });
    }
  })

  this.workspaceStore.on('workspace_current_changed', function(message) {
    console.log('workspace_current_changed', this, message);
    this.workspaceCurrent = message;
    this.genericStore.workspaceCurrent = message;
  }.bind(this));

  this.workspaceStore.on('workspace_current_add_components_done', function(message) {
    //this.navigatePrevious();
    route('workspace/'+message._id+'/component')
  }.bind(this));

  //update current component because it can be change after wokspace persist
  this.workspaceStore.on('workspace_current_persist_done', function(message) {
    if (this.genericStore.itemCurrent != undefined) {
      this.genericStore.itemCurrent = sift({
        _id: this.genericStore.itemCurrent._id
      }, message.components)[0];
      //this.genericStore.trigger('component_current_select', );
    }
  }.bind(this));

  this.genericStore.on('item_current_work_done', function(message) {
    route('workPreview')
  }.bind(this));

  this.workspaceStore.on('share_change', function(record) {
    route('workspace/'+record.workspace._id+'/user')
  }.bind(this));






}
