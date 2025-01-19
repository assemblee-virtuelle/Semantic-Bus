'use strict';
class CacheNosql {
  constructor () {
    this.workspace_component_lib = require('../../core/lib/workspace_component_lib')
    this.cache_lib = require('../../core/lib/cache_lib')
    // this.fragment_lib = require('../../core/lib/fragment_lib_scylla')
    this.stepNode = true
  }


  pull (data, flowData, queryParams, processId) {
    // console.log('pull cache : ',processId)
    return new Promise((resolve, reject) => {
      if (flowData != undefined && flowData[0].data != undefined) {
        // resolve({data:flowData[0].data});
        // console.log('PERSIST CACHE')
        this.cache_lib.persist(data, flowData[0].data, data.specificData.history,processId.toString()).then(cachedData => {
          resolve({ data: flowData[0].data })
        }).catch(e => {
          reject(e)
        })
      } else {
        // console.log('cache PULL',data);
        this.cache_lib.get(data, true, processId.toString()).then(cachedData => {
          // console.log('cachedData',cachedData);
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
