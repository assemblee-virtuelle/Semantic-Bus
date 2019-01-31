function MainController(allStore) {
  riot.observable(this) // Riot provides our event emitter.
  for(store in allStore){
    allStore[store].mainController = this;
    this[store]=allStore[store];
  }

  this.on('is_token_valid?', function() {
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
  });

  this.workspaceStore.on('workspace_current_add_components_done', function(message) {
    route('workspace/'+message._id+'/component')
  }.bind(this));

  this.workspaceStore.on('process_result', function(message) {
    route('workPreview')
  }.bind(this));

  this.workspaceStore.on('share_change', function(record) {
    route('workspace/'+record.workspace._id+'/user')
  }.bind(this));






}
