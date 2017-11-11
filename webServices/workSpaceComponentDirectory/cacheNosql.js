module.exports = {
  type: 'Cache NoSql',
  description: 'sauvegarder un flux et le réutiliser sans avoir besoin de requeter la source',
  editor: 'cache-nosql-editor',
  mLabPromise: require('../mLabPromise'),
  graphIcon:'cacheNosql.png',
  tags:[
    'http://semantic-bus.org/data/tags/persistComponents',
    'http://semantic-bus.org/data/tags/persistCacheComponents'
  ],
  workspace_component_lib : require('../../lib/core/lib/workspace_component_lib'),
  cache_lib : require('../../lib/core/lib/cache_lib'),
  stepNode: true,
  //recursivPullResolvePromise : require('../recursivPullResolvePromise'),
  initialise: function(router,recursivPullResolvePromise) {
    this.recursivPullResolvePromise = recursivPullResolvePromise;
    //console.log('INIT',router);
    router.get('/reloadcache/:compId', function(req, res) {
      var compId = req.params.compId;
      console.log(compId);
      this.workspace_component_lib.get({
        _id: compId
      }).then(component => {
        console.log('Cache NoSql | reload |', component);
        this.recursivPullResolvePromise.resolveComponent(component, 'work').then(data => {
          console.log('CACHE LOADED');
        });
        res.json({
          message: 'in progress'
        });
      });
    }.bind(this));

    router.get('/getCache/:compId', function(req, res) {
      var compId = req.params.compId;
      //console.log(compId);

      this.workspace_component_lib.get({
        _id: compId
      }).then(component => {
        //console.log('Cache NoSql | get |', component);
        this.pull(component,undefined).then(cachedData=>{
            res.json(cachedData.data);
        });
      });
    }.bind(this));
  },

  pull: function(data, flowData, undefined) {
    //console.log('--------- cash data START --------  : ');
    return new Promise((resolve, reject) => {
      if (flowData!=undefined && flowData[0].data != undefined) {
        console.log("----- cache data stock ----")
        this.cache_lib.create(data,flowData[0]).then(cachedData=>{
          resolve(cachedData);
        });
      } else {
        this.cache_lib.get(data).then(cachedData=>{
          console.log("----- cache data get ----")
          if (cachedData!=undefined){
          resolve({data:cachedData.data});
        }else{
          reject(new Error('empty cache'))
        }
        })
      }
    })
  }
}
