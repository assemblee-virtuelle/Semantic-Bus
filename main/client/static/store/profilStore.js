function ProfilStore (utilStore) {
  riot.observable(this)
  this.utilStore = utilStore
  this.setUserCurrent = function (user) {
    this.userCurrrent = user
  }

  this.on('get_user_from_storage', () => {
    this.trigger('profil_menu_changed', this.menu)
    this.trigger('user_from_storage', this.userCurrrent)
  })

  this.on('load_user_workspace_graph', () => {
    this.utilStore.ajaxCall({
      method: 'get',
      url: '../data/core/users/me/graph',
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).then(data => {
      this.trigger('profil_menu_changed', this.menu)
      this.trigger('load_user_workspace_graph_done', data.workspaceGraph)
    })
  })

  this.on('send_back_email', function (data) {
    this.utilStore.ajaxCall({
      method: 'post',
      url: '../data/core/users/mail?mail=' + data.user.credentials.email,
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).then(() => {
      this.trigger('ajax_sucess', `Un mail vous a  été envoyé, consultez votre boite mail`)
    })
  })

  this.on('load_all_profil_by_email', function (message) {
    this.utilStore.ajaxCall({
      method: 'get',
      url: '../data/core/users',
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).then(function (data) {
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
    this.utilStore.ajaxCall({
      method: 'put',
      url: '../data/core/users/me',
      data: JSON.stringify(data),
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).then(function (data) {
      this.trigger('ajax_sucess', `Votre profil à été mis à jour`)
      this.trigger('user_from_storage', data)
    }.bind(this))
  })

  this.on('navigation', function (entity, id, action) {
    if (entity === 'profil') {
      this.menu = action
      this.trigger('navigation_control_done', entity, action)
    }
  })

  this.on('logout', function (message) {
    localStorage.clear();
    window.open('../ihm/login.html', '_self')
  })
}
