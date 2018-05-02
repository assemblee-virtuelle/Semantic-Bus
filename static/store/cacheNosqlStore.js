function CacheNosqlStore(utilStore) {
  riot.observable(this) // Riot provides our event emitter.
  this.utilStore = utilStore;
  this.on('item_current_reloadCache', function(data) {
    console.log('item_current_reloadCache');
    console.log(this.genericStore);
    $.ajax({
      method: 'get',
      url: '../data/specific/reloadcache/' + this.genericStore.itemCurrent._id,
      contentType: 'application/json',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
    }).done(function(data) {
      console.log(data);
    }.bind(this));
  });

  this.on('cache_frag_load', (fragId, jsTreeId) => {
    this.utilStore.ajaxCall({
      method: 'get',
      url: '../data/core/fragment/' + fragId
    }, true).then(frag => {
      //console.log('load frag', frag);
      //this.workspaceCollection = data;
      //resolve(data);
      this.trigger('cache_frag_loaded',frag.data,jsTreeId)
    }).catch(error => {
      console.log(error);
    });
    //  this.trigger('cache_frag_loaded',{'key':'coucou'},jsTreeId)
  });


  this.on('item_current_getCache', function(data) {
    console.log('item_current_reloadCache');
    console.log(this.genericStore);

    this.utilStore.ajaxCall({
      method: 'get',
      url: '../data/specific/getCache/' + this.genericStore.itemCurrent._id,
    }, true).then(data => {
      this.trigger('item_current_getCache_done', data);
    }).catch(error => {
      console.log(error);
    });
  });
}
