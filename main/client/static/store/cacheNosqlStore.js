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
      url: '../data/core/fragment/' + fragId,
    }, true).then(frag => {
      // console.log('frag',frag);
      this.trigger('cache_frag_loaded', frag.data, jsTreeId)
    })
  })

  this.on('cache_file_load', (fileId, jsTreeId) => {
    console.log('cache_file_load', fileId, jsTreeId);
    this.utilStore.ajaxCall({
      method: 'get',
      url: '../data/core/file/' + fileId
    }, true).then(file => {
      console.log('file',file);
      this.trigger('cache_file_loaded', file, jsTreeId)
    })
  })

  this.on('cache_file_download', (url,filename) => {
    console.log('cache_file_download', url,filename);
    const urlDownload = `../data/core/file/${url}/download`;
    this.utilStore.ajaxCall({
      method: 'get',
      url: urlDownload,
      responseType: 'blob'
    }).then(blob => {
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename; // Remplacez par le nom souhaité
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
    }).catch(error => {
      console.error('Erreur lors du téléchargement du fichier:', error);
    });
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
