'use strict';
class CacheNosql {
  constructor () {
    this.workspace_component_lib = require('../../core/lib/workspace_component_lib')
    this.cache_lib = require('../../core/lib/cache_lib')
    this.fragment_lib = require('../../core/lib/fragment_lib')
    this.stepNode = true
  }

  initialise (router) {
    router.get('/getCache/:compId', function (req, res, next) {
      var compId = req.params.compId

      this.workspace_component_lib.get({
        _id: compId
      }).then(component => {
        this.cache_lib.get(component, false).then(cachedData => {
          if (cachedData != undefined) {
            res.json(cachedData)
          } else {
            res.json([])
          }
        }).catch(e => {
          next(e)
        })
      })
    }.bind(this))
  }

  pull (data, flowData, queryParams) {
    return new Promise((resolve, reject) => {
      if (flowData != undefined && flowData[0].data != undefined) {
        // resolve({data:flowData[0].data});
        this.cache_lib.persist(data, flowData[0].data, data.specificData.history).then(cachedData => {
          resolve({ data: flowData[0].data })
        }).catch(e => {
          reject(e)
        })
      } else {
        // console.log('cache PULL',data);
        this.cache_lib.get(data, true).then(cachedData => {
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
