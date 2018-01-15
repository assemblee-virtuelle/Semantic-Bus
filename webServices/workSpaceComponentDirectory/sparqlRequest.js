module.exports = {
  type: 'Sparql request',
  description: 'Requeter en sparql sur un fichier json ld',
  editor: 'sparql-request-editor',
  graphIcon: 'sparqlRequest.png',
  tags: [
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleQueryingComponents'
  ],
  rdfstore: require('rdfstore'),
  getPriceState: function(){
    return new Promise((resolve,reject)=>{
      resolve({state:true})
    })
  },
  makeRequest: function(flowData, request) {
    return new Promise((resolve, reject) => {
      //var query = request;
      if (request == undefined) {
        reject(new Error("empty request"))
      } else {
        new this.rdfstore.Store(function(err, store) {
          //console.log('store', store);
          try {
            store.load("application/ld+json", flowData, function(err, results) {


              //console.log(JSON.stringify(results));
              //console.log(query);
              try {
                store.execute(request, function(err, graph) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve({
                      data: graph
                    })
                  }
                })
              } catch (e) {
                reject(e);
              }
            })

          } catch (e) {
            reject(e);
          }
        });
      }

    })
  },
  pull: function(data, flowData) {
    //console.log('REST Get JSON | pull : ',data);
    // console.log("flowDataAAAAAAAAA", flowData[0].data)
    return this.makeRequest(flowData[0].data, data.specificData.request);
  }
};
