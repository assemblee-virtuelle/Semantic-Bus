function MainController (allStore, utilStore) {
  this.utilStore = utilStore
  riot.observable(this) // Riot provides our event emitter.
  for (store in allStore) {
    allStore[store].mainController = this
    this[store] = allStore[store]
  }

  this.on('bootstrap', function () {
    // console.log('MainController bootstrap',this.utilStore);
    this.utilStore.ajaxCall({
      method: 'get',
      contentType: 'application/json',
      url: '../data/core/users/me',
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      }
    }).then(data => {
      this.profilStore.setUserCurrent(data)
      this.trigger('user_from_storage', data)
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
