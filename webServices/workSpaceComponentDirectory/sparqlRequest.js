"use strict";
module.exports = {
  type: 'SPARQL',
  description: 'Requêter en SPARQL sur un fichier JSON ld.',
  editor: 'sparql-request-editor',
  graphIcon: 'Sparql.png',
  tags: [
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleQueryingComponents'
  ],
  rdfstore: require('rdfstore'),

  makeRequest: function(flowData, request) {
    return new Promise((resolve, reject) => {

      //var query = request;
      if (request == undefined) {
        reject(new Error("empty request"))
      } else {
        try {

          new this.rdfstore.Store({name:'test', overwrite:true},(err, store) => {
          //this.rdfstore.create((err, store) => {
            try {

              store.load("application/ld+json", flowData, (err, results) => {


                //console.log(JSON.stringify(results));
                //console.log(query);
                try {
                  store.execute(request, (err, graph) => {
                    //console.log('err',err,'graph',graph);
                    if (err != null && err != undefined) {
                      reject(new Error(err));
                    } else {
                      resolve({
                        data: graph
                      })
                    }
                  })
                } catch(e) {
                  reject(e);
                }
              })
            } catch(e) {
              reject(e);
            }
          });
        } catch(e) {
          reject(e);
        }
      }

    })
  },
  pull: function(data, flowData) {
    //console.log('REST Get JSON | pull : ',data);
    // console.log("flowDataAAAAAAAAA", flowData[0].data)
    return this.makeRequest(flowData[0].data, data.specificData.request);
  }
};
