module.exports = {
  type: 'Cache NoSql',
  description: 'sauvegarder un flux et le réutiliser sans avoir besoin de requeter la source',
  editor: 'cache-nosql-editor',
  mLabPromise: require('../mLabPromise'),
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
        // this.recursivPullResolvePromise.resolveComponentPull(component, false).then(data => {
        //   console.log('CACHE LOADED');
        // })
        res.json({
          message: 'in progress'
        });
      });
      // this.mLabPromise.request('GET', 'workspaceComponent/'+compId).then(function(data) {
      //
      // }.bind(this));

      //console.log('restApiGet webservice Request');

    }.bind(this));

    router.get('/getCache/:compId', function(req, res) {
      var compId = req.params.compId;
      console.log(compId);

      this.workspace_component_lib.get({
        _id: compId
      }).then(component => {
        console.log('Cache NoSql | get |', component);
        this.pull(component,undefined).then(cachedData=>{
            res.json(cachedData);
        });
        // this.recursivPullResolvePromise.resolveComponentPull(component, false).then(data => {
        //   console.log('CACHE LOADED');
        // })
      });



      //this require is live because constructor require cause cyclic dependencies (recursivPullResolvePromise->restApiGet)
      // this.mLabPromise.request('GET', 'workspaceComponent/'+compId).then(function(data) {
      //   //console.log('Cache NoSql | reload |', data);
      //   // this.recursivPullResolvePromise.resolveComponentPull(data, false).then(data => {
      //   //   console.log('CACHE LOADED');
      //   // })
      //   this.pull(data,undefined).then(cachedData=>{
      //       res.json(cachedData);
      //   });
      //   // res.json({
      //   //   message: 'in progress'
      //   // });
      // }.bind(this));

      //console.log('restApiGet webservice Request');

    }.bind(this));

  },

  pull: function(data, flowData) {
    //console.log('Flow Agregator | pull : ',data,' | ',flowData);
    return new Promise((resolve, reject) => {
      if (flowData != undefined) {
        console.log('cash data | ',flowData[0]);
        this.cache_lib.create(data,flowData[0]).then(cachedData=>{
          resolve(cachedData);
        });
        // this.mLabPromise.request('PUT', 'cache/' + data._id, {
        //   data: flowData[0].data
        // }).then(function(data) {
        //   resolve(data);
        //   //console.log('cache | pull| ',data);
        //   //return recursivPullResolvePromise.resolveComponentPull(data);
        // });
      } else {
        this.cache_lib.get(data).then(cachedData=>{
          resolve(cachedData);
        })
        // this.mLabPromise.request('GET', 'cache/' + data._id).then(function(cachedData) {
        //   resolve({data:cachedData.data});
        //   //console.log('cache | pull| ',data);
        //   //return recursivPullResolvePromise.resolveComponentPull(data);
        // });
      }
    })
  }
}
