'use strict';
//TO REBUILD this Component, RdfStore not maintained -> RDF-Ext migration
class SparqlRequest {
  constructor () {
    // this.rdfstore = require('rdfstore')
  }

  makeRequest (flowData, request) {
    return new Promise((resolve, reject) => {
      reject(new Error("this component is in maintainance"))
      // var query = request;
      // if (request == undefined) {
      //   reject(new Error('empty request'))
      // } else {
      //   try {
      //     new this.rdfstore.Store({ name: 'test', overwrite: true }, (err, store) => {
      //     // this.rdfstore.create((err, store) => {
      //       try {
      //         store.load('application/ld+json', flowData, (err, results) => {
      //           // console.log(JSON.stringify(results));
      //           // console.log(query);
      //           try {
      //             store.execute(request, (err, graph) => {
      //               // console.log('err',err,'graph',graph);
      //               if (err != null && err != undefined) {
      //                 reject(new Error(err))
      //               } else {
      //                 resolve({
      //                   data: graph
      //                 })
      //               }
      //             })
      //           } catch (e) {
      //             reject(e)
      //           }
      //         })
      //       } catch (e) {
      //         reject(e)
      //       }
      //     })
      //   } catch (e) {
      //     reject(e)
      //   }
      // }
    })
  }

  pull (data, flowData) {
    return this.makeRequest(flowData[0].data, data.specificData.request)
  }
}
module.exports = new SparqlRequest()
