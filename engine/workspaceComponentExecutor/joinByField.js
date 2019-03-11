'use strict';
class JoinByField {
  constructor () {
    this.sift = require('sift');
    this.PromiseOrchestrator = require('../../core/helpers/promiseOrchestrator')
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
          console.log('PromiseOrchestrator',this.PromiseOrchestrator);
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
