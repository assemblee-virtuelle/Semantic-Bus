"use strict";
module.exports = new function() {
  this.type = 'Get provider';
  this.description = 'Exposer un flux de donnée sur une API http GET.';
  this.editor = 'rest-api-get-editor';
  this.graphIcon = 'Get_provider.png';
  this.tags = [
      'http://semantic-bus.org/data/tags/outComponents',
      'http://semantic-bus.org/data/tags/APIComponents'
    ],
    this.stepNode = false;
  this.workspace_component_lib = require('../../lib/core/lib/workspace_component_lib');
  this.data2xml = require('data2xml');
  this.dataTraitment = require("../dataTraitmentLibrary/index.js");
  this.json2yaml = require('json2yaml');
  this.express = require('express');
  this.cors = require('cors');
  this.pathToRegexp = require('path-to-regexp');
  this.recursivPullResolvePromise = require('../engine.js');

  this.initialise = function(router, app, stompClient) {

    let apiGetRouteur = this.express.Router();
    apiGetRouteur.use(this.cors());

    apiGetRouteur.get('/*', (req, res, next) => {
      let urlRequiered = req.params[0];
      var targetedComponent;

      let matches;
      this.workspace_component_lib.get_all({
        module: 'restApiGet'
      }).then(components => {
        //console.log(component);
        var matched = false;
        for (let component of components) {
          if (component.specificData.url != undefined) {
            //console.log(component.specificData.url,urlRequiered);
            let keys = [];
            let regexp = this.pathToRegexp(component.specificData.url, keys);
            //console.log(keys);
            //console.log(re);
            if (regexp.test(urlRequiered)) {
              matched = true;
              //console.log('MATCHING',component.specificData.url,urlRequiered);
              //component.specificData.url
              targetedComponent = component;
              let values = regexp.exec(urlRequiered)
              //console.log(keys,values);
              let valueIndex = 1;
              for (let key of keys) {
                //console.log(key);
                let value = values[valueIndex];
                req.query[key.name] = value;
                valueIndex++;
              }

              for (let queryKey in req.query) {
                try {
                  req.query[queryKey] = JSON.parse(req.query[queryKey]);
                } catch (e) {
                  console.log(e);
                }
              }
              //console.log('QUERY',req.query);
              break;
            }
            // matches = re.exec(urlRequiered);
            // console.log(matches);
            // if(matches.length>1){
            //   matched=true;
            //   break;
            // }
          }
        }
        if (!matched) {
          return new Promise((resolve, reject) => {
            reject({
              code: 404,
              message: "no API for this url"
            })
          })
        } else {
          //console.log(this.recursivPullResolvePromise);
          return this.recursivPullResolvePromise.execute(targetedComponent, 'work', stompClient, undefined, undefined, {
            query: req.query,
            body: req.body
          });
        }
      }).then(dataToSend => {
        //console.log('AALLOO',dataToSend);
        if (targetedComponent.specificData != undefined) { // exception in previous promise
          if (targetedComponent.specificData.contentType != undefined) {
            if (targetedComponent.specificData.contentType.search('application/vnd.ms-excel') != -1) {
              res.setHeader('content-type', targetedComponent.specificData.contentType);
              var responseBodyExel = []
              console.log('data.contentType XLS', targetedComponent.specificData);
              this.dataTraitment.type.buildFile(undefined, JSON.stringify(dataToSend.data), undefined,true, targetedComponent.specificData.contentType).then((result)=>{
                //console.log(result)
                res.setHeader('Content-disposition', 'attachment; filename='+targetedComponent.specificData.url+'.xlsx');
                res.send(result)
              })
            } else if (targetedComponent.specificData.contentType.search('xml') != -1) {
              res.setHeader('content-type', targetedComponent.specificData.contentType);
              var convert = this.data2xml();
              var out = "";
              for (let key in dataToSend.data) {
                out += convert(key, dataToSend.data[key]);
              }
              //console.log(out);
              res.send(out);
            } else if (targetedComponent.specificData.contentType.search('yaml') != -1) {
              res.setHeader('content-type', targetedComponent.specificData.contentType);
              res.send(this.json2yaml.stringify(dataToSend.data));

            } else if (targetedComponent.specificData.contentType.search('json') != -1) {
              res.setHeader('content-type', targetedComponent.specificData.contentType);
              var buf = Buffer.from(JSON.stringify(dataToSend.data));
              res.send(buf);
            } else {
              next(new Error('no supported madiatype'));
              //res.send('type mime non géré')
            }
          }else {
            next(new Error('content-type have to be set'));
            //res.send('type mime non géré')
          }
        }
      }).catch(err => {
        console.log('Engine FAIL for API ',urlRequiered);
        if (err.code) {
          res.status(err.code).send(err.message);
        } else {
          next(err)
          //res.status(500).send("serveur error");
        }
      });
    });

    app.use('/data/api', apiGetRouteur);
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
        reject(new Error('composant finale : ne peux etre branché comme source'));
      }
    })
  }
};
