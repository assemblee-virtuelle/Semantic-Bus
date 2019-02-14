function MainController (allStore) {
  riot.observable(this) // Riot provides our event emitter.
  for (store in allStore) {
    allStore[store].mainController = this
    this[store] = allStore[store]
  }

  this.on('bootstrap', function () {
    $.ajax({
      method: 'get',
      contentType: 'application/json',
      url: '../data/core/me',
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      beforeSend: function () {
        this.trigger('ajax_send')
      }.bind(this)
    }).done(data => {
      this.profilStore.setUserCurrent(data)
      this.workspaceStore.setGlobalWorkspaceCollection(data.workspaces)
    })
  })

  this.workspaceStore.on('workspace_current_add_components_done', function (message) {
    route('workspace/' + message._id + '/component')
  })

  this.workspaceStore.on('process_result', function (message) {
    route('workPreview')
  })

  this.workspaceStore.on('share_change', function (record) {
    route('workspace/' + record.workspace._id + '/user')
  })
}
