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
  makeRequest: function(flowData, request) {
    return new Promise((resolve, reject) => {
      var query = request;
      new this.rdfstore.Store(function(err, store) {
        //console.log('flowData', flowData);
        try {
          store.load("application/ld+json", flowData, function(err, results) {

            console.log(results);
            try {
              store.execute(query, function(err, graph) {
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
    })
  },
  pull: function(data, flowData) {
    //console.log('REST Get JSON | pull : ',data);
    // console.log("flowDataAAAAAAAAA", flowData[0].data)
    return this.makeRequest(flowData[0].data, data.specificData.request);
  }
};
