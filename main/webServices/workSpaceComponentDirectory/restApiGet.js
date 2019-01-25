"use strict";

let workspace_component_lib = require('../../../core/lib/workspace_component_lib');
let data2xml = require('data2xml');
let dataTraitment = require("../dataTraitmentLibrary/index.js");
let json2yaml = require('json2yaml');
let pathToRegexp = require('path-to-regexp');
let recursivPullResolvePromise  = require('../engine.js');

module.exports = {
  type :'Get provider',
  description :'Exposer un flux de donnée sur une API http GET.',
  editor :'rest-api-get-editor',
  graphIcon :'Get_provider.png',
  tags :[
      'http://semantic-bus.org/data/tags/outComponents',
      'http://semantic-bus.org/data/tags/APIComponents'
    ],
  stepNode :false,
  initialise :(router, app, stompClient) => {
    console.log('------------- before initialise', router)
    router.get('*', (req, res, next) => {
      console.log('------------- RestApiGet initialise');
      const urlRequiered = req.params[0];
      let targetedComponent;

      workspace_component_lib.get_all({
        module: 'restApiGet'
      }).then(components => {
        let matched = false;
        for (let component of components) {
          if (component.specificData.url != undefined) {
            //console.log(component.specificData.url,urlRequiered);
            let keys = [];
            let regexp = pathToRegexp(component.specificData.url, keys);
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
                  //console.warn('restApiGet : error parsing query', queryKey ,req.query[queryKey],e);
                }
              }
              //console.log('QUERY',req.query);
              break;
            }
          }
        }
        if (!matched) {
          return new Promise((resolve, reject) => {
            reject({
              codeHTTP: 404,
              message: "no API for this url"
            })
          })
        } else {
          //console.log(recursivPullResolvePromise);
          return recursivPullResolvePromise.execute(targetedComponent, 'work', stompClient, undefined, undefined, {
            query: req.query,
            body: req.body
          });
        }
      }).then(dataToSend => {
        if (targetedComponent.specificData != undefined) { // exception in previous promise
          if (targetedComponent.specificData.contentType != undefined) {
            if(dataToSend.data==undefined){
                next(new Error('data in flow is not defined. please chack your configuration'));
            } else  if (targetedComponent.specificData.contentType.search('application/vnd.ms-excel') != -1) {
              res.setHeader('content-type', targetedComponent.specificData.contentType);
              var responseBodyExel = []
              console.log('data.contentType XLS', targetedComponent.specificData);
              dataTraitment.type.buildFile(undefined, JSON.stringify(dataToSend.data), undefined,true, targetedComponent.specificData.contentType).then((result)=>{
                res.setHeader('Content-disposition', 'attachment; filename='+targetedComponent.specificData.url+'.xlsx');
                res.send(result)
              })
            } else if (targetedComponent.specificData.contentType.search('xml') != -1) {
              res.setHeader('content-type', targetedComponent.specificData.contentType);
              var convert = data2xml();
              var out = "";
              for (let key in dataToSend.data) {
                out += convert(key, dataToSend.data[key]);
              }
              //console.log(out);
              res.send(out);
            } else if (targetedComponent.specificData.contentType.search('yaml') != -1) {
              res.setHeader('content-type', targetedComponent.specificData.contentType);
              res.send(json2yaml.stringify(dataToSend.data));

            } else if (targetedComponent.specificData.contentType.search('json') != -1) {
              res.setHeader('content-type', targetedComponent.specificData.contentType);
              //console.log('restApiGet json data',dataToSend.data);
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
        if (err.codeHTTP!=undefined) {
          res.status(err.codeHTTP).send(err.message);
        } else {
          next(err)
        }
      });
    });
  },
  pull: (data, flowData) => {
    return new Promise((resolve, reject) => {
      if (flowData != undefined) {
        resolve({
          data: flowData[0].data
        })
      } else {
        reject(new Error('composant finale : ne peux etre branché comme source'));
      }
    })
  }
};
