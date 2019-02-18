function TechnicalComponentStore (utilStore) {
  riot.observable(this) // Riot provides our event emitter.

  this.technicalComponentCollection = []
  this.technicalComponentCurrent = []

  this.utilStore = utilStore

  this.load = function () {
    // console.log('load GLF');
    this.utilStore.ajaxCall({
      method: 'get',
      url: '../data/core/technicalComponent',
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      }
    }).then((data) => {
      // console.log('store load',data);
      this.technicalComponentCollection = data
      this.trigger('technicalComponent_collection_changed', this.technicalComponentCollection)
    })
  }

  this.on('technicalComponent_collection_load', function (record) {
    this.load()
  })

  this.on('technicalComponent_current_init', function () {
    this.technicalComponentCurrent = {
      name: '',
      description: ''
    }
    this.technicalComponentCurrent.mode = 'init'
    this.trigger('technicalComponent_current_changed', this.technicalComponentCurrent)
  })

  this.on('componentsCategoriesTree_refresh', function () {
    this.utilStore.ajaxCall({
      method: 'get',
      url: '../data/core/technicalComponent/componentsCategoriesTree'
    }, false).then(data => {
      this.trigger('componentsCategoriesTree_changed', data)
    })
  })
}
