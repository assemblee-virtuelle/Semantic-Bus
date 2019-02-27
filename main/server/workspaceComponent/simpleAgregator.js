'use strict';
class SimpleAgregator {
  constructor () {
    this.type = 'Aggregate'
    this.description = 'Agréger plusieurs flux pour n\'en former qu\'un seul.'
    this.editor = 'simple-agregator-editor'
    this.graphIcon = 'Aggregate.svg'
    this.sift = require('sift')
    this.transform = require('jsonpath-object-transform')
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleComponentsAgregation'
    ]
  }
  pull (data, flowData) {
    return new Promise((resolve, reject) => {
      var resultFlow = []
      for (let flow of flowData) {
        if (!Array.isArray(flow.data)) {
          reject(new Error('input flow have to be an array'))
        } else {
          for (let record of flow.data) {
            resultFlow.push(record)
          }
        }
      }
      resolve({
        data: resultFlow
      })
    })
  }
}
module.exports = new SimpleAgregator()
