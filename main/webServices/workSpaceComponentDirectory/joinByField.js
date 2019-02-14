'use strict';
class JoinByField {
  constructor () {
    this.type = 'Join'
    this.description = 'Compléter un flux par un second en se basant sur un champ du 1er et un identifiant du 2nd.'
    this.editor = 'join-by-field-editor'
    this.graphIcon = 'Join.png'
    this.PromiseOrchestrator = require('../../../core/helpers/promiseOrchestrator.js')
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleComponentsAgregation'
    ]

    this.sift = require('sift')
  }
  getPrimaryFlow (data, flowData) {
    var primaryFlow = this.sift({
      componentId: data.specificData.primaryComponentId
    }, flowData)
    return primaryFlow[0]
  }

  join (primaryRecord, secondaryFlowData, data) {
    return new Promise((resolve, reject) => {
      try {
        let filter = {}
        filter[data.specificData.secondaryFlowId] = primaryRecord[data.specificData.primaryFlowFKId]
        let result = this.sift(filter, secondaryFlowData)
        if (data.specificData.multipleJoin == true) {
          primaryRecord[data.specificData.primaryFlowFKName] = result
        } else {
          primaryRecord[data.specificData.primaryFlowFKName] = result[0]
        }

        resolve(primaryRecord)
      } catch (e) {
        // console.log(e);
        reject(e)
      }
    })
  }

  pull (data, flowData) {
    return new Promise((resolve, reject) => {
      try {
        var secondaryFlowData = this.sift({
          componentId: data.specificData.secondaryComponentId
        }, flowData)[0].data
        var primaryFlowData = this.sift({
          componentId: data.specificData.primaryComponentId
        }, flowData)[0].data

        if (!Array.isArray(secondaryFlowData) || !Array.isArray(primaryFlowData)) {
          reject(new Error('Flows have to be an array'))
        } else if (primaryFlowData.length == 0) {
          resolve({
            data: []
          })
        } else {
          var secondaryFlowData = JSON.parse(JSON.stringify(secondaryFlowData)) // in case primary and secandary is the same source
          let paramArray = primaryFlowData.map(r => {
            return [
              r,
              secondaryFlowData,
              data
            ]
          })
          let promiseOrchestrator = new this.PromiseOrchestrator()
          promiseOrchestrator.execute(this, this.join, paramArray, {
            beamNb: 10
          }, this.config).then(primaryFlowCompleted => {
            resolve({
              data: primaryFlowCompleted
            })
          })
        }
      } catch (e) {
        reject(e)
      }
    })
  }
}

module.exports = new JoinByField()
