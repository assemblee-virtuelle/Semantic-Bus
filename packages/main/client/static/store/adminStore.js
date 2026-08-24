function AdminStore (utilStore) {
  riot.observable(this)
  this.utilStore = utilStore


  this.on('clean_garbage_simple', () => {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'post',
        url: '../data/core/cleanGarbageSimple'
      }, true).then(data => {
        resolve()
        this.trigger('garbage_cleaned')
      }).catch(error => {
        reject(error)
      })
    })
  })

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

  this.on('load_users', () => {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'get',
        url: '../data/core/users'
      }, true).then(users => {
        this.trigger('users_loaded', users)
        resolve(users)
      }).catch(error => {
        reject(error)
      })
    })
  })

  this.on('set_user_admin', (userId, isAdmin) => {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'put',
        data: JSON.stringify({ admin: isAdmin }),
        url: '../data/core/users/' + userId + '/admin'
      }, true).then(data => {
        this.trigger('user_admin_changed', data)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  })

  this.on('load_user_workflows', (userId) => {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'get',
        url: '../data/core/users/' + userId + '/workflows'
      }, true).then(workflows => {
        this.trigger('user_workflows_loaded', { userId, workflows })
        resolve(workflows)
      }).catch(error => {
        reject(error)
      })
    })
  })

}
