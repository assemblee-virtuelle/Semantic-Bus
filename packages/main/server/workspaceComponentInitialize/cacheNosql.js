'use strict'
class CacheNosql {
  constructor () {
    this.type = 'Cache NoSQL'
    this.description = 'Sauvegarder un flux et le réutiliser sans avoir besoin de requêter la source.'
    this.editor = 'cache-nosql-editor'
    this.graphIcon = 'Cache_NoSQL.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/persistComponents',
      'http://semantic-bus.org/data/tags/persistCacheComponents'
    ]
    this.workspace_component_lib = require('@semantic-bus/core/lib/workspace_component_lib')
    this.cache_lib = require('@semantic-bus/core/lib/cache_lib')
    // this.fragment_lib = require('../../../core/lib/fragment_lib_scylla')
    this.stepNode = true
  }

  initialise (router) {
    router.get('/getCache/:compId', async function (req, res, next) {
      // console.log('CACHE getCache');
      try {
        var compId = req.params.compId
        const component = await this.workspace_component_lib.get({
          _id: compId
        })

        const cachedData = await this.cache_lib.get(component, false)

        if (cachedData != undefined) {
          res.json(cachedData.data)
        } else {
          res.json([])
        }
      } catch (error) {
        next(error)
      }
    }.bind(this))
  }
}

module.exports = new CacheNosql()
