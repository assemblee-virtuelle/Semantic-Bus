"use strict";
module.exports = {
  type: 'Cache NoSQL',
  description: 'Sauvegarder un flux et le réutiliser sans avoir besoin de requêter la source.',
  editor: 'cache-nosql-editor',
  mLabPromise: require('../mLabPromise'),
  graphIcon: 'Cache_nosql.png',
  tags: [
    'http://semantic-bus.org/data/tags/persistComponents',
    'http://semantic-bus.org/data/tags/persistCacheComponents'
  ],
  workspace_component_lib: require('../../../core/lib/workspace_component_lib'),
  cache_lib: require('../../../core/lib/cache_lib'),
  fragment_lib: require('../../../core/lib/fragment_lib'),
  stepNode: true,



  initialise: function(router) {
    //this.recursivPullResolvePromise = require('../engine'),;
    //console.log('INIT',router);
    // router.get('/reloadcache/:compId', function(req, res) {
    //   var compId = req.params.compId;
    //   //console.log(compId);
    //   this.workspace_component_lib.get({
    //     _id: compId
    //   }).then(component => {
    //     //console.log('Cache NoSql | reload |', component);
    //     this.recursivPullResolvePromise.execute(component, 'work',stompClient).then(data => {
    //       //console.log('CACHE LOADED');
    //     });
    //     res.json({
    //       message: 'in progress'
    //     });
    //   });
    // }.bind(this));

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
  },

  pull: function(data, flowData, queryParams) {
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
