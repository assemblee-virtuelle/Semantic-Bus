module.exports = {
  type: 'Cache NoSql',
  description: 'sauvegarder un flux et le réutiliser sans avoir besoin de requeter la source',
  editor: 'cache-nosql-editor',
  mLabPromise: require('../mLabPromise'),
  stepNode: true,
  //recursivPullResolvePromise : require('../recursivPullResolvePromise'),
  initialise: function(router,recursivPullResolvePromise) {
    this.recursivPullResolvePromise = recursivPullResolvePromise;
    //console.log('INIT',router);
    router.get('/specific/reloadcache/:compId', function(req, res) {
      var compId = req.params.compId;
      console.log(compId);
      //this require is live because constructor require cause cyclic dependencies (recursivPullResolvePromise->restApiGet)
      this.mLabPromise.request('GET', 'workspaceComponent/'+compId).then(function(data) {
        console.log('Cache NoSql | reload |', data);
        this.recursivPullResolvePromise.resolveComponentPull(data, false).then(data => {
          console.log('CACHE LOADED');
        })
        res.json({
          message: 'in progress'
        });
      }.bind(this));

      //console.log('restApiGet webservice Request');

    }.bind(this));
  },

  test: function(data, flowData) {
    //console.log('Flow Agregator | test : ',data,' | ',flowData);
    return new Promise((resolve, reject) => {
      if (flowData != undefined) {
        //console.log('cash data | ',flowData);
        this.mLabPromise.request('PUT', 'cache/' + data._id.$oid, {
          data: flowData[0].data
        }).then(function(data) {
          resolve(data);
          //console.log('cache | test| ',data);
          //return recursivPullResolvePromise.resolveComponentPull(data);
        });
      } else {
        this.mLabPromise.request('GET', 'cache/' + data._id.$oid).then(function(cachedData) {
          resolve({data:cachedData.data});
          //console.log('cache | test| ',data);
          //return recursivPullResolvePromise.resolveComponentPull(data);
        });
      }
    })
  }
}
