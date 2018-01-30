module.exports = {
  type: 'Cache NoSql',
  description: 'sauvegarder un flux et le réutiliser sans avoir besoin de requeter la source',
  editor: 'cache-nosql-editor',
  mLabPromise: require('../mLabPromise'),
  graphIcon: 'cacheNosql.png',
  tags: [
    'http://semantic-bus.org/data/tags/persistComponents',
    'http://semantic-bus.org/data/tags/persistCacheComponents'
  ],
  workspace_component_lib: require('../../lib/core/lib/workspace_component_lib'),
  cache_lib: require('../../lib/core/lib/cache_lib'),
  stepNode: true,
  //recursivPullResolvePromise : require('../recursivPullResolvePromise'),


  initialise: function(router, recursivPullResolvePromise) {
    this.recursivPullResolvePromise = recursivPullResolvePromise;
    //console.log('INIT',router);
    router.get('/reloadcache/:compId', function(req, res) {
      var compId = req.params.compId;
      //console.log(compId);
      this.workspace_component_lib.get({
        _id: compId
      }).then(component => {
        //console.log('Cache NoSql | reload |', component);
        this.recursivPullResolvePromise.resolveComponent(component, 'work').then(data => {
          //console.log('CACHE LOADED');
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
        this.pull(component, undefined).then(cachedData => {
          res.json(cachedData.data);
        });
      });
    }.bind(this));
  },

  pull: function(data, flowData, undefined) {
    console.log('--------- cash data START --------  : ', data);
    return new Promise((resolve, reject) => {
      if (flowData != undefined && flowData[0].data != undefined) {
        // console.log("----- cache data stock ----",flowData[0])
        this.cache_lib.get(data).then(cachedData => {
          
          cachedData = cachedData || {};
          cachedData.data = JSON.stringify(flowData[0].data);
          cachedData.date = new Date();
          
          if (data.specificData.history == true) {
            cachedData.history = cachedData.history || [];
            cachedData.history.push({
              data: JSON.stringify(flowData[0].data)
            });
          }

          this.cache_lib.persist(data, cachedData).then(data => {
            console.log('PERSIST CACHE DONE');
            resolve(data);      
          }).catch(e => {
            reject(e)
          })
        });
      } else {
        this.cache_lib.get(data).then(cachedData => {
          
          console.log("----- cache data get ----",typeof cachedData.data)
          if (cachedData != undefined) {
            if(typeof cachedData.data == "string"){
              try {
                cachedData.data = JSON.parse(cachedData.data);
              }catch (e){
                //simple string
              }
            };
            if (data.specificData.historyOut == true) {
              //console.log('RETURN CACHE',cachedData);
              cachedData.history.map((historyItem)=>{
                let out;
                if(typeof historyItem == "string"){
                  try {
                    out = JSON.parse(cachedData.data);
                  }catch (e){
                    out = historyItem
                  }
                }
                return out;
              });
              resolve({
                //data : JSON.parse(JSON.stringify(cachedData))
                data: cachedData
                //data: {data:cachedData.data,history:cachedData.history}
              });
            } else {
              resolve({
                //data: JSON.parse(JSON.stringify(cachedData.data))
                data: cachedData.data
              });
            }

          } else {
            reject(new Error('empty cache'))
          }
        })
      }
    })
  }
}
