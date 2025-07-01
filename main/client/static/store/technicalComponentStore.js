/**
 * @module TechnicalComponentStore
 * 
 * @description
 * This module manages the technical components and their categories within the application.
 * It provides methods for loading and refreshing technical components and their categories.
 * 
 * @param {Object} utilStore - Utility store for making AJAX calls.
 * 
 * @fires TechnicalComponentStore#technicalComponent_collection_changed
 * @fires TechnicalComponentStore#technicalComponent_current_changed
 * @fires TechnicalComponentStore#componentsCategoriesTree_changed
 * 
 * @function load
 * @description Loads the technical component collection if not already loaded.
 * 
 * @function onTechnicalComponentCollectionLoad
 * @description Event handler for loading the technical component collection.
 * 
 * @function onTechnicalComponentCurrentInit
 * @description Initializes the current technical component with default values.
 * 
 * @function onComponentsCategoriesTreeRefresh
 * @description Refreshes the components categories tree.
 * 
 * @event TechnicalComponentStore#technicalComponent_collection_changed
 * @description Triggered when the technical component collection changes.
 * 
 * @event TechnicalComponentStore#technicalComponent_current_changed
 * @description Triggered when the current technical component changes.
 * 
 * @event TechnicalComponentStore#componentsCategoriesTree_changed
 * @description Triggered when the components categories tree changes.
 */

function TechnicalComponentStore (utilStore) {
  riot.observable(this) // Riot provides our event emitter.

  this.componentsCategoriesTree = []
  this.technicalComponentCollection = []

  this.utilStore = utilStore

  this.load = function () {
    // console.log('load GLF');
    if (this.technicalComponentCollection.length == 0) {
      this.utilStore.ajaxCall({
        method: 'get',
        url: '../data/core/technicalComponent',
        headers: {
          'Authorization': 'JTW' + ' ' + localStorage.token
        }
      }).then((data) => {
        this.technicalComponentCollection = data
        this.trigger('technicalComponent_collection_changed', this.technicalComponentCollection)
      })
    } else {
      this.trigger('technicalComponent_collection_changed', this.technicalComponentCollection)
    }
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
    if (this.technicalComponentCollection.length == 0) {
      this.utilStore.ajaxCall({
        method: 'get',
        url: '../data/core/technicalComponent/componentsCategoriesTree'
      }, false).then(data => {
        this.componentsCategoriesTree = data
        this.trigger('componentsCategoriesTree_changed', data)
      })
    } else {
      this.trigger('componentsCategoriesTree_changed', this.componentsCategoriesTree)
    }
  })
}
