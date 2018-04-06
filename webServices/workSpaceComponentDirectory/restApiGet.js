"use strict";
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
    this.express = require('express');
    this.cors = require('cors');
    this.pathToRegexp = require('path-to-regexp');
    this.recursivPullResolvePromise=require('../recursivPullResolvePromise.js');

    this.initialise = function(router, app) {

      let apiGetRouteur = this.express.Router();
      apiGetRouteur.use(this.cors());


      // this.workspace_component_lib.get_all({
      //   module: 'restApiGet'
      // }).then(comps => {
      //
      //   for (let comp of comps) {
      //     if (comp.specificData.url != undefined) {
      //       console.log('API comp | ', comp.specificData.url);
      //       apiGetRouteur.get('/' + comp.specificData.url, function(req, res, next) {
      //         console.log('API TRIGGERED');
      //         res.json('API TRIGGERED');
      //       });
      //     }
      //
      //   }
      // })
      // console.log('routes', app._router.map);


      apiGetRouteur.get('/*', (req, res, next) => {
        //console.log('req',req);
        //console.log('query',req.query);
        //console.log('params',req.params);
        let urlRequiered=req.params[0];
        //console.log('urlRequiered',urlRequiered);
        // for(let key in req.params){
        //   urlRequiered=urlRequiered+req.params[key];
        // }
        //console.log(urlRequiered);

        //console.log("in get")
        // console.log('recursivPullResolvePromise',this.recursivPullResolvePromise);
        //   console.log('pathToRegexp', this.pathToRegexp);
        //var urlRequiered = req.params.join('');
        //console.log(urlRequiered);
        //this require is live because constructor require cause cyclic dependencies (recursivPullResolvePromise->restApiGet)
        //TODO require use cache object  : need to build one engine per request
        //this.recursivPullResolvePromiseDynamic = require('../recursivPullResolvePromise')
        var targetedComponent;
        //console.log('urlRequiered', urlRequiered)


        // this.workspace_component_lib.get_all({module:'restApiGet'}).then(comps=>{
        //   for(let comp of comps){
        //       let route = new express.Route('', '/api/users/:username');
        //   }
        //
        // })


        let matches;
        this.workspace_component_lib.get_all({
          module: 'restApiGet'
        }).then(components => {
          //console.log(component);
          var matched=false;
          for (let component of components) {
            if (component.specificData.url != undefined) {
              //console.log(component.specificData.url,urlRequiered);
              let keys = [];
              let regexp = this.pathToRegexp(component.specificData.url, keys);
              //console.log(keys);
              //console.log(re);
              if(regexp.test(urlRequiered)){
                matched=true;
                //console.log('MATCHING',component.specificData.url,urlRequiered);
                component.specificData.url
                targetedComponent=component;
                let values = regexp.exec(urlRequiered)
                //console.log(keys,values);
                let valueIndex=1;
                for(let key of keys){
                  //console.log(key);
                  let value=values[valueIndex];
                  req.query[key.name]=value;
                  valueIndex++;
                }

                for (let queryKey in req.query) {
                  try{
                    req.query[queryKey]=JSON.parse(req.query[queryKey]);
                  }catch(e){
                    console.log(e) ;
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
          if (!matched){
            return new Promise((resolve, reject) => {
              reject({
                code: 404,
                message: "no API for this url"
              })
            })
          }else {
            //console.log(this.recursivPullResolvePromise);
            return this.recursivPullResolvePromise.getNewInstance().resolveComponent(targetedComponent, 'work', undefined, {query:req.query,body:req.body});
            //return this.recursivPullResolvePromiseDynamic.getNewInstance().resolveComponent(component, 'work', undefined, req.query);
            // return new Promise((resolve, reject) => {
            //   resolve({
            //     data: "api finded"
            //   })
            // })
          }







          // if (component != undefined) {
          //
          //   if (component.specificData.contentType == undefined) {
          //     return new Promise((resolve, reject) => {
          //       reject(new Error("API without content-type"));
          //     })
          //   } else {
          //     specificData = component.specificData;
          //     return this.recursivPullResolvePromiseDynamic.getNewInstance().resolveComponent(component, 'work', undefined, req.query);
          //     //return this.recursivPullResolvePromise.resolveComponentPull(data[0], false,req.query);
          //   }
          //
          //
          // } else {
          //   return new Promise((resolve, reject) => {
          //     reject({
          //       code: 404,
          //       message: "no API for this url"
          //     })
          //   })
          // }
        }).then(dataToSend => {
          if (targetedComponent.specificData != undefined) { // exception in previous promise
            if (targetedComponent.specificData.contentType.search('application/vnd.ms-excel') != -1) {
              res.setHeader('content-type', targetedComponent.specificData.contentType);
              var responseBodyExel = []
              //console.log('data.contentType XLS', specificData)
              this.dataTraitment.type.type_file(targetedComponent.specificData.contentType, dataToSend, responseBodyExel, undefined, true).then(function(result) {
                //console.log(result)
                res.send(result)
              })
            } else if (targetedComponent.specificData.contentType.search('xml') != -1) {
              res.setHeader('content-type', targetedComponent.specificData.contentType);
              var convert = this.data2xml();
              var out = "";
              for (key in dataToSend.data) {
                out += convert(key, dataToSend.data[key]);
              }
              //console.log(out);
              res.send(out);
            } else if (targetedComponent.specificData.contentType.search('yaml') != -1) {
              res.setHeader('content-type', targetedComponent.specificData.contentType);
              res.send(this.json2yaml.stringify(dataToSend.data));

            } else if (targetedComponent.specificData.contentType.search('json') != -1) {
              res.setHeader('content-type', targetedComponent.specificData.contentType);
              res.json(dataToSend.data);
            } else {
              next(new Error('no supported madiatype'));
              //res.send('type mime non géré')
            }
          }
        }).catch(err => {
          //console.log('FAIL', err);
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
