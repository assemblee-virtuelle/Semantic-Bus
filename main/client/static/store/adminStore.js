function AdminStore (utilStore) {
  riot.observable(this)
  this.utilStore = utilStore

  this.on('clean_garbage', () => {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'post',
        url: '../data/core/cleanGarbage'
      }, true).then(data => {
        resolve()
        this.trigger('garbage_cleaned')
      }).catch(error => {
        reject(error)
      })
    })
  })

  this.on('clean_process', () => {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'post',
        url: '../data/core/cleanProcess'
      }, true).then(data => {
        resolve()
        this.trigger('process_cleaned')
      }).catch(error => {
        reject(error)
      })
    })
  })

  this.on('execute_timers', () => {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'post',
        url: '../data/core/executeTimers'
      }, true).then(data => {
        resolve()
        this.trigger('timers_executed')
      }).catch(error => {
        reject(error)
      })
    })
  })

}
