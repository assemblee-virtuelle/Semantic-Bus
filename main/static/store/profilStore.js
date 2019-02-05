function ProfilStore () {
  riot.observable(this) // Riot provides our event emitter.
  /// /LE USER STORE EST RELIE A LOGIN EST NON A APPLICATION
  this.userCurrrent

  this.setUserCurrent = function (user) {
    this.userCurrrent = user
    this.trigger('profil_loaded', this.userCurrrent)
  }

  this.on('load_profil', function (message) {
    // if (this.userCurrrent == undefined) {
    $.ajax({
      method: 'get',
      url: '../data/core/users/' + localStorage.user_id,
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).done(function (data) {
      this.setUserCurrent(data)
      console.log('LOAD PROFIL', data)
    }.bind(this))
    // } else {
    //   this.setUserCurrent(this.userCurrrent);
    // }
    this.trigger('profil_menu_changed', this.menu)
  })

  this.on('load_user_workspace_graph', () => {
    $.ajax({
      method: 'get',
      url: '../data/core/users/' + localStorage.user_id + '/workspaces',
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).done(data =>{
      console.log('AJAX DONE',data);
      this.trigger('profil_menu_changed', this.menu)
      this.trigger('load_user_workspace_graph_done', data.workspaceGraph)
    })
  })

  this.on('send_back_email', function (data) {
    $.ajax({
      method: 'get',
      url: '../auth/sendbackmail/' + data.user._id,
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).done(function (data) {
      if (data == 'mail_sent') {
        this.trigger('ajax_sucess', `Un mail vous a  été envoyé, consultez votre boite mail`)
      } else {
        this.trigger('ajax_fail', `Erreur lors de l'envoie de mail contactez nous si cela persiste`)
      }
    }.bind(this))
  })

  this.on('load_all_profil_by_email', function (message) {
    $.ajax({
      method: 'get',
      url: '../data/core/users',
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).done(function (data) {
      var emails = []
      data.forEach(function (user) {
        if (user.credentials) {
          emails.push(user.credentials.email)
        }
      })
      this.trigger('all_profil_by_email_load', emails)
    }.bind(this))
  })

  this.on('update_user', function (data) {
    $.ajax({
      method: 'put',
      url: '../data/core/users/' + localStorage.user_id,
      data: JSON.stringify(data),
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).done(function (data) {
      if (data.err == 'google_user') {
        this.trigger('google_user_update')
      }
      if (data.err == 'email_already_use') {
        this.trigger('email_already_use')
      }
      if (data.err == 'bad_format_email') {
        this.trigger('bad_format_email')
      }
      if (data.err == 'bad_format_job') {
        this.trigger('bad_format_job')
      }
      if (data.err == 'bad_format_society') {
        this.trigger('bad_format_society')
      }
      if (data.err == null) {
        this.trigger('ajax_sucess', `Votre profil à été mis à jour`)
        this.trigger('update_profil_done', data)
      }
    }.bind(this))
  })

  this.on('navigation', function (entity, id, action) {
    if (entity == 'profil') {
      this.menu = action
      this.trigger('navigation_control_done', entity, action)
    }
  })

  this.on('deconnexion', function (message) {
    localStorage.token = null
    localStorage.user_id = null
    window.open('../auth/login.html', '_self')
  })
}
