function BigdataflowStore (utilStore, stompClient) {
  riot.observable(this)
  this.bigdataflowCollection;
  this.bigdataflowCurrent;
  this.utilStore = utilStore;

  // --------------------------------------------------------------------------------
  this.initialize = function (entity, action) {
    console.log('initialize');
    this.bigdataflowCurrent = {
      name: '',
      description: '',
      users: [],
    }
    this.action = action
    this.bigdataflowCurrent.mode = 'init'
  }

  // --------------------------------------------------------------------------------
  this.load = function () {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'get',
        url: '../data/core/bigdataflow/me'
      }, true).then(data => {
        this.bigdataflowCollection = data
        resolve(this.bigdataflowCollection)
      }).catch(error => {
        reject(error)
      })
    })
  } // <= load_workspace (shared & )


  // --------------------------------------------------------------------------------
  this.create = function () {
    console.log('create',this.bigdataflowCurrent);
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'post',
        url: '../data/core/bigdataflow/',
        data: JSON.stringify({ bigdataflow: this.bigdataflowCurrent })
      }, true).then(data => {
        this.bigdataflowCollection.push(data);
        this.bigdataflowCurrent = data;
        this.bigdataflowCurrent.mode = 'edit';
        resolve(this.bigdataflowCurrent);
      }).catch(error => {
        reject(error)
      })
    })
  } // <= create

  // --------------------------------------------------------------------------------
  this.update = function () {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'put',
        url: '../data/core/bigdataflow/' + this.bigdataflowCurrent._id,
        data: this.bigdataflowCurrent
      }).then((data)=>{
        data.mode = 'edit'
        // update only necessery champ
        this.bigdataflowCurrent.description = data.description
        this.bigdataflowCurrent.name = data.name
        this.bigdataflowCurrent.limitHistoric = data.limitHistoric
        this.trigger('bigdataflow-current-changed', this.bigdataflowCurrent)//TODO trigger in main
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  } // <= update

  // --------------------------------------------------------------------------------
  this.delete = function (record) {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'delete',
        url: '../data/core/bigdataflow/' + record._id,
      }).then((data)=>{
        this.bigdataflowCollection = sift({
          '_id': {
            $ne: record._id
          }
        }, this.bigdataflowCollection);
        this.trigger('bigdataflow-collection-changed', this.bigdataflowCollection);
      }).catch(error => {
        reject(error)
      })
    });
  } // <= delete

  // --------------------------------------------------------------------------------
  this.select = function (record) {
    return new Promise((resolve, reject) => {
      this.utilStore.ajaxCall({
        method: 'get',
        url: '../data/core/bigdataflow/' + record._id
      }, true).then(data => {
        this.bigdataflowCurrent = data;
        this.bigdataflowCurrent.mode = 'edit';
        this.action = 'main';
        resolve(data);
      }).catch(error => {
        reject(error);
      })
    })
  } // <= select

  // --------------------------------------------------------------------------------
  this.on('stop-current-process', () => {

  })

  // --------------------------------------------------------------------------------
  this.on('share-bigdataflow', (data) => {
    this.utilStore.ajaxCall({
      method: 'put',
      url: '../data/core/bigdataflow/' + this.bigdataflowCurrent._id + '/share',
      data: JSON.stringify({
        email: this.emailToShare
      }),
    }).then((data)=>{
      if (data == false) {
        this.trigger('share_change_no_valide')
      } else if (data == 'already') {
        this.trigger('share_change_already')
      } else {
        this.bigdataflowCurrent = data.bigdataflow
        this.bigdataflowCurrent.mode = 'edit'
        this.trigger('share_change', {
          user: data.user,
          bigdataflow: data.bigdataflow
        })
        route('bigdataflow/' + data.bigdataflow._id + '/user')
      }
    })
  })


  // ----------------------------------------- EVENT  -----------------------------------------
  this.on('navigation', (entity, id, action, secondId, secondAction)=>{
    if (entity === 'bigdataflow') {
      this.action=action;
      if (id === 'new') {
        this.initialize(entity, action)
        this.trigger('navigation_control_done', entity, action, secondAction)
      } else if (this.bigdataflowCurrent !== undefined && this.bigdataflowCurrent._id === id) {
        this.trigger('navigation_control_done', entity, action, secondAction)
      } else {
          this.select({ _id: id }).then(() => {
              this.trigger('navigation_control_done', entity, action, secondAction)
          })
      }
    }
  })

  // --------------------------------------------------------------------------------
  this.on('bigdataflow-delete', (record)=>{
    this.delete(record)
  }) // <= workspace_delete

  // --------------------------------------------------------------------------------
  this.on('bigdataflow-collection-load', (record)=>{
    if (this.bigdataflowCollection === undefined) {
      this.load().then(data => {
        this.trigger('bigdataflow-collection-changed', this.bigdataflowCollection)
      })
    } else {
      this.trigger('bigdataflow-collection-changed', this.bigdataflowCollection)
    }
  }) // <= workspace_collection_load


  // --------------------------------------------------------------------------------
  this.on('bigdataflow-current-updateField', (message) =>{
    this.bigdataflowCurrent[message.field] = message.data
    this.trigger('bigdataflow-current-changed', this.bigdataflowCurrent)
  }) // <= workspace_current_updateField


  // --------------------------------------------------------------------------------
  this.on('bigdataflow-current-refresh',  () => {
    console.log('bigdataflow-current-refresh',this);
    this.trigger('bigdataflow-editor-menu-changed', this.action)
    this.trigger('bigdataflow-current-changed', this.bigdataflowCurrent)
  }) // <= workspace_current_refresh

  // --------------------------------------------------------------------------------
  this.on('bigdataflow-current-persist', () => {
    var mode = this.bigdataflowCurrent.mode
    if (mode == 'init') {
      this.create().then(ws => {
        route('bigdataflow/' + ws._id + '/component')
      })
    } else if (mode == 'edit') {
      this.update(this.bigdataflowCurrent).then(data => {
        // nothing to do. specific action in other case
      })
    }
  }) // <= workspace_current_persist

  // --------------------------------------------------------------------------------
  this.on('set-componentSelectedToAdd', function (message) {
    this.componentSelectedToAdd = message
  }) // <= workspace_current_updateField

  // --------------------------------------------------------------------------------
  this.on('set-email-to-share', function (email) {
    this.emailToShare = email
  })
}
