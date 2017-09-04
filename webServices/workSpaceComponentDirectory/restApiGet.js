  module.exports = new function () {
    this.type = 'REST API GET';
    this.description = 'exposition du flux de donnée sur une API http uniquement en GET';
    this.editor = 'rest-api-get-editor';
    this.stepNode = false;
    this.mLabPromise = require('../mLabPromise');
    this.workspace_component_lib = require('../../lib/core/lib/workspace_component_lib');
    this.data2xml = require('data2xml');
    this.dataTraitment = require("../dataTraitmentLibrary/index.js");


    this.initialise = function (router) {
      router.get('/:urlRequiered', function (req, res) {
        //console.log(req.query);
        var urlRequiered = req.params.urlRequiered;
        //this require is live because constructor require cause cyclic dependencies (recursivPullResolvePromise->restApiGet)
        //TODO require use cache object  : need to build one engine per request
        this.recursivPullResolvePromiseDynamic = require('../recursivPullResolvePromise')
        var specificData;
        console.log('urlRequiered',urlRequiered)
        this.workspace_component_lib.get({
          "specificData.url": urlRequiered
        }).then(component => {
          console.log(component);
          if (component != undefined) {
            specificData = component.specificData;

            res.setHeader('content-type', component.specificData.contentType);
            return this.recursivPullResolvePromiseDynamic.getNewInstance().resolveComponent(component, 'work', req.query);
            //return this.recursivPullResolvePromise.resolveComponentPull(data[0], false,req.query);
          } else {
            return new Promise((resolve, reject) => {
              reject({
                code: 404,
                message: "pas d'API pour cette url"
              })
            })
          }
        }).catch(err => {
          console.log('FAIL', err);
          res.status(err.code).send(err.message)
        }).then(dataToSend => {
          console.log('API data', dataToSend);
          if (specificData.contentType.search('application/vnd.ms-excel') != -1) {
            var responseBodyExel = []
            console.log('data.contentType XLS', data.specificData)
            this.dataTraitment.type.type_file(data.specificData.contentType, flowData, responseBodyExel, data.specificData.xls, true).then(function (result) {
              console.log(result)
              // resolve({
              //   data: result
              // })
            })
          }
          else if (specificData.contentType.search('xml') != -1) {
            var convert = this.data2xml();
            var out = "";
            for (key in dataToSend.data) {
              out += convert(key, dataToSend.data[key]);
            }
            //console.log(out);
            res.send(out);
          } else if (specificData.contentType.search('json') != -1) {
            res.json(dataToSend.data);
          } else {
            res.send('type mime non géré')
          }
        });


      }.bind(this));
    }

    this.pull = function (data, flowData) {
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








 