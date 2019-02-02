"use strict";
class CacheNosql {
  constructor() {
    this.type = 'Cache NoSQL';
    this.description = 'Sauvegarder un flux et le réutiliser sans avoir besoin de requêter la source.';
    this.editor = 'cache-nosql-editor';
    this.graphIcon = 'Cache_nosql.png';
    this.tags = [
      'http://semantic-bus.org/data/tags/persistComponents',
      'http://semantic-bus.org/data/tags/persistCacheComponents'
    ];
    this.workspace_component_lib = require('../../../core/lib/workspace_component_lib');
    this.cache_lib = require('../../../core/lib/cache_lib');
    this.fragment_lib = require('../../../core/lib/fragment_lib');
    this.stepNode = true;
  }

  initialise(router) {
    router.get('/getCache/:compId', function(req, res,next) {
      var compId = req.params.compId;
      //console.log(compId);

      this.workspace_component_lib.get({
        _id: compId
      }).then(component => {
        this.cache_lib.get(component,false).then(cachedData => {
          if (cachedData != undefined) {
            res.json(cachedData);
          } else {
            next(new Error('empty cache'))
          }
        }).catch(e=>{
          next(e);
        })
      });
    }.bind(this));
  }

  pull(data, flowData, queryParams) {
    //console.log("cache queryParams",queryParams);
    //console.log('--------- cash data START --------  : ', data);
    return new Promise((resolve, reject) => {
      if (flowData != undefined && flowData[0].data != undefined) {
        //console.log("----- cache data persist ----")
        // resolve({data:flowData[0].data});
        this.cache_lib.persist(data, flowData[0].data, data.specificData.history).then(cachedData => {
          //console.log('persist OK',flowData[0]);
          resolve({data:flowData[0].data});
        }).catch(e => {
          //console.log('persist KO',flowData[0].data.length);
          reject(e)
        })

      } else {
        this.cache_lib.get(data,true).then(cachedData => {
          if (cachedData != undefined) {
            resolve({data:cachedData});
          } else {
            reject(new Error('empty cache'))
          }
        }).catch(e=>{
          reject(e);
        })
      }
    })
  }
}

module.exports = new CacheNosql();
