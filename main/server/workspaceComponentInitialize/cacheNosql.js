'use strict';
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
    this.workspace_component_lib = require('../../../core/lib/workspace_component_lib')
    this.cache_lib = require('../../../core/lib/cache_lib')
    this.fragment_lib = require('../../../core/lib/fragment_lib')
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
}

module.exports = new CacheNosql()
