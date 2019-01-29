"use strict";
class RestApiPost{
  constructor(){
    this.type = 'Post provider';
    this.description = `Déclencher un flux de donnée sur une API http POST.`;
    this.editor = 'rest-api-post-editor';
    this.graphIcon = 'Post_provider.png';
    this.tags = [
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/APIComponents'
    ],
    this.stepNode = false;
    this.workspace_component_lib = require('../../../core/lib/workspace_component_lib');
    this.data2xml = require('data2xml');
    this.dataTraitment = require("../dataTraitmentLibrary/index.js");
    this.json2yaml = require('json2yaml');
  }

  initialise(router,stompClient) {
    router.post('/:urlRequiered', function(req, res, next) {
      //console.log("IN POST", req.body);
      var urlRequiered = req.params.urlRequiered;
      //this require is live because constructor require cause cyclic dependencies (recursivPullResolvePromise->restApiGet)
      //TODO require use cache object  : need to build one engine per request
      this.engine = require('../engine')
      var specificData;

      this.workspace_component_lib.get({
        "specificData.url": urlRequiered
      }).then(component => {

          specificData = component.specificData;
          console.log(req.body);
          return this.engine.execute(component, 'push',stompClient,undefined,{data:req.body})

      }).then(dataToSend => {

        res.send({data: dataToSend.data});

      }).catch(err => {
        //console.log('FAIL', err);
        if (err.code) {
          res.status(err.code).send(err.message);
        } else {
          next(err)
          //res.status(500).send("serveur error");
        }
      });
    }.bind(this));
  }

  pull(data, flowData) {
    //console.log('Flow Agregator | pull : ',data,' | ',flowData);
    return new Promise((resolve, reject) => {
        resolve({
          data: null
        })
    })
  }
}

module.exports = new RestApiPost();
