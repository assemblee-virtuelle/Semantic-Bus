function CacheNosqlStore (utilStore) {
  riot.observable(this) // Riot provides our event emitter.
  this.utilStore = utilStore
  this.on('item_current_reloadCache', function (data) {
    this.utilStore.ajaxCall({
      method: 'get',
      url: '../data/specific/reloadcache/' + this.genericStore.itemCurrent._id,
      contentType: 'application/json',
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      }
    })
  })

  this.on('cache_frag_load', (fragId, jsTreeId) => {
    this.utilStore.ajaxCall({
      method: 'get',
      url: '../data/core/fragment/' + fragId
    }, true).then(frag => {
      // console.log('frag',frag);
      this.trigger('cache_frag_loaded', frag.data, jsTreeId)
    })
  })

  this.on('item_current_getCache', function (data) {
    this.utilStore.ajaxCall({
      method: 'get',
      url: '../data/specific/getCache/' + this.genericStore.itemCurrent._id
    }, true).then(data => {
      this.trigger('item_current_getCache_done', data)
    })
  })
}
