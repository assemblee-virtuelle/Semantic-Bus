'use strict';
class CacheNosql {
  constructor () {
    this.workspace_component_lib = require('../../core/lib/workspace_component_lib')
    this.cache_lib = require('../../core/lib/cache_lib')
    this.stepNode = true
  }


  pull (data, flowData, queryParams, processId) {
    // console.log('pull cache : ',processId)
    return new Promise((resolve, reject) => {
      if (flowData != undefined && flowData[0].data != undefined) {
        // console.log('PERSIST CACHE')
        this.cache_lib.persist(data, flowData[0].data, data.specificData.history,processId.toString()).then(cachedData => {
          resolve({ data: flowData[0].data })
        }).catch(e => {
          reject(e)
        })
      } else {
        
        this.cache_lib.get(data, true, processId.toString()).then(cachedData => {
          if (cachedData != undefined) {
            resolve({ data: cachedData })
          } else {
            reject(new Error('empty cache'))
          }
        }).catch(e => {
          reject(e)
        })
      }
    })
  }
}

module.exports = new CacheNosql()
