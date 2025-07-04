/**
 * @module FlowStore
 * 
 * !!CAUTION!!
 * This module seems to be legacy. it could be removed.
 * 
 * @description
 * This module manages the flow state and interactions within the application.
 * It provides methods for loading, creating, updating, and deleting flows.
 * 
 * @param {Object} utilStore - Utility store for making AJAX calls.
 * 
 * @fires FlowStore#GLF_collection_changed
 * @fires FlowStore#GLF_current_changed
 * 
 * @function load
 * @description Loads the Google Linear Flow collection from the server.
 * 
 * @function create
 * @description Creates a new Google Linear Flow.
 * 
 * @function update
 * @description Updates the current Google Linear Flow.
 * 
 * @function delete
 * @description Deletes a specified Google Linear Flow record.
 * @param {Object} record - The flow record to delete.
 * 
 * @function on
 * @description Registers event listeners for various flow-related events.
 * 
 * @event FlowStore#GLF_collection_changed
 * @description Triggered when the Google Linear Flow collection changes.
 * 
 * @event FlowStore#GLF_current_changed
 * @description Triggered when the current Google Linear Flow changes.
 */

function FlowStore (utilStore) {
  this.utilStore = utilStore
  riot.observable(this) // Riot provides our event emitter.

  this.googleLinearFlowCollection = []
  this.googleLinearFlowCurrent = []

  this.load = function () {
    // console.log('load GLF');
    this.utilStore.ajaxCall({
      method: 'get',
      url: '../data/core/flow',
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      }
    }).then(function (data) {
      console.log('store load', data)
      this.googleLinearFlowCollection = data
      this.trigger('GLF_collection_changed', this.googleLinearFlowCollection)
    }.bind(this))
  }

  this.create = function () {
    this.utilStore.ajaxCall({
      method: 'post',
      url: 'http://localhost:3000/data/core/flow',
      data: JSON.stringify(this.googleLinearFlowCurrent),
      contentType: 'application/json',
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      }
    }).then(function (data) {
      this.googleLinearFlowCurrent.mode = 'edit'
      this.load()
    }.bind(this))
  }

  this.update = function () {
    this.utilStore.ajaxCall({
      method: 'put',
      url: 'http://localhost:3000/data/core/flow',
      data: JSON.stringify(this.googleLinearFlowCurrent),
      contentType: 'application/json',
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      }
    }).then(function (data) {
      this.load()
      this.googleLinearFlowCurrent.mode = 'edit'
    }.bind(this))
  }

  this.delete = function (record) {
    this.utilStore.ajaxCall({
      method: 'delete',
      url: 'http://localhost:3000/data/core/flow',
      data: JSON.stringify(record),
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).then(function (data) {
      this.load()
    }.bind(this))
  }

  // Event listeners
  this.on('GLF_delete', function (record) {
    this.delete(record)
  })

  this.on('GLF_collection_load', function (record) {
    this.load()
  })

  this.on('GLF_current_updateField', function (message) {
    this.googleLinearFlowCurrent[message.field] = message.data
    this.trigger('GLF_current_changed', this.googleLinearFlowCurrent)
  })

  this.on('GLF_current_edit', function (data) {
    this.googleLinearFlowCurrent = data
    this.googleLinearFlowCurrent.mode = 'edit'
    this.trigger('GLF_current_changed', this.googleLinearFlowCurrent)
  })

  this.on('GLF_current_init', function () {
    this.googleLinearFlowCurrent = {
      source: { type: 'googleSpreadSheet' },
      transformer: { entities: ['$..', {}] },
      destination: { type: 'HttpApi' }
    }
    this.googleLinearFlowCurrent.mode = 'init'
    this.trigger('GLF_current_changed', this.googleLinearFlowCurrent)
  })

  this.on('GLF_current_perist', function (message) {
    this.googleLinearFlowCurrent.selected = undefined
    this.googleLinearFlowCurrent.mainSelected = undefined
    var mode = this.googleLinearFlowCurrent.mode
    this.googleLinearFlowCurrent.mode = undefined
    if (mode == 'init') {
      this.create()
    } else if (mode == 'edit') {
      this.update()
    }
  })

  this.on('GLF_currrent_testSource', function () {
    this.utilStore.ajaxCall({
      url: '/data/googleSpreadseetQuery/',
      type: 'get',
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      data: this.googleLinearFlowCurrent.source,
      timeout: 5000
    }).then((data) => {
      RiotControl.trigger('previewJSON', data)
    })
  })

  this.on('GLF_currrent_testApi', function () {
    this.utilStore.ajaxCall({
      url: '/data/query/' + this.googleLinearFlowCurrent.destination.url,
      type: 'get',
      timeout: 5000
    }).then((data) =>{
      RiotControl.trigger('previewJSON', data)
    })
  })
}
