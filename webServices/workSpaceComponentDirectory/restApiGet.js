  module.exports = new function() {
    this.type = 'REST API GET';
    this.description = 'exposition du flux de donnée sur une API http uniquement en GET';
    this.editor = 'rest-api-get-editor';
    this.graphIcon = 'restApiGet.png';
    this.tags = [
      'http://semantic-bus.org/data/tags/outComponents',
      'http://semantic-bus.org/data/tags/APIComponents'
    ],
    this.stepNode = false;
    this.workspace_component_lib = require('../../lib/core/lib/workspace_component_lib');
    this.data2xml = require('data2xml');
    this.dataTraitment = require("../dataTraitmentLibrary/index.js");
    this.json2yaml = require('json2yaml');


    this.initialise = function(router) {
      router.get('/:urlRequiered', function(req, res, next) {
        //console.log(req.query);
        console.log("in get")
        var urlRequiered = req.params.urlRequiered;
        //this require is live because constructor require cause cyclic dependencies (recursivPullResolvePromise->restApiGet)
        //TODO require use cache object  : need to build one engine per request
        this.recursivPullResolvePromiseDynamic = require('../recursivPullResolvePromise')
        var specificData;

        console.log('urlRequiered', urlRequiered)
        this.workspace_component_lib.get({
          "specificData.url": urlRequiered
        }).then(component => {

          if (component != undefined) {



            if (component.specificData.contentType == undefined) {
              return new Promise((resolve, reject) => {
                reject(new Error("API without content-type"));
              })
            } else {
              specificData = component.specificData;
              return this.recursivPullResolvePromiseDynamic.getNewInstance().resolveComponent(component, 'work', req.query);
              //return this.recursivPullResolvePromise.resolveComponentPull(data[0], false,req.query);
            }


          } else {
            return new Promise((resolve, reject) => {
              reject({
                code: 404,
                message: "no API for this url"
              })
            })
          }
        }).then(dataToSend => {
          // console.log('API data', specificData);
          // console.log('ALLO');
          // console.log('API component');
          // console.log('ALLO2');
          if (specificData != undefined) { // exception in previous promise
            if (specificData.contentType.search('application/vnd.ms-excel') != -1) {
              res.setHeader('content-type', specificData.contentType);
              var responseBodyExel = []
              console.log('data.contentType XLS', specificData)
              this.dataTraitment.type.type_file(specificData.contentType, dataToSend, responseBodyExel, specificData.xls, true).then(function(result) {
                console.log(result)
                res.send(result)
              })
            } else if (specificData.contentType.search('xml') != -1) {
              res.setHeader('content-type', specificData.contentType);
              var convert = this.data2xml();
              var out = "";
              for (key in dataToSend.data) {
                out += convert(key, dataToSend.data[key]);
              }
              //console.log(out);
              res.send(out);
            } else if (specificData.contentType.search('yaml') != -1) {
              res.setHeader('content-type', specificData.contentType);
              res.send(this.json2yaml.stringify(dataToSend.data));

            } else if (specificData.contentType.search('json') != -1) {
              res.setHeader('content-type', specificData.contentType);
              res.json(dataToSend.data);
            } else {
              next(new Error('no supported madiatype'));
              //res.send('type mime non géré')
            }
          }
        }).catch(err => {
          console.log('FAIL', err);
          if (err.code) {
            res.status(err.code).send(err.message);
          } else {
            next(err)
            //res.status(500).send("serveur error");
          }
        });
      }.bind(this));
    }

    this.pull = function(data, flowData) {
      //console.log('Flow Agregator | pull : ',data,' | ',flowData);
      return new Promise((resolve, reject) => {
        if (flowData != undefined) {
          //console.log('api data | ',flowData);
          resolve({
            data: flowData[0].data
          })
        } else {
          throw new Error('composant finale : ne peux etre branché comme source')
        }
      })
    }
  };
