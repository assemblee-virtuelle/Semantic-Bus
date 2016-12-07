module.exports = {
  type: 'Cache NoSql',
  description: 'sauvegarder un flux et le réutiliser sans avoir besoin de requeter la source',
  editor: 'cache-nosql-editor',
  mLabPromise :require('../mLabPromise'),
  stepNode : true,


  test: function(data, flowData) {
    //console.log('Flow Agregator | test : ',data,' | ',flowData);
    return new Promise((resolve, reject) => {
      if (flowData != undefined) {
        //console.log('cash data | ',flowData);
        this.mLabPromise.request('PUT', 'cache/' + data._id.$oid, {data:flowData[0]}).then(function(data) {
          resolve(data);
          //console.log('cache | test| ',data);
          //return recursivPullResolvePromise.resolveComponentPull(data);
        });
      } else {
        this.mLabPromise.request('GET', 'cache/' + data._id.$oid).then(function(data) {
          resolve(data.data);
          //console.log('cache | test| ',data);
          //return recursivPullResolvePromise.resolveComponentPull(data);
        });
      }
    })
  }
}
