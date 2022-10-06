function AdminStore (utilStore) {
  riot.observable(this)
  this.utilStore = utilStore

  this.on('clean_fragment', () => {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'post',
        url: '../data/core/cleanFragment'
      }, true).then(data => {
        resolve()
        this.trigger('fragment_cleaned')
      }).catch(error => {
        reject(error)
      })
    })
  })

}
