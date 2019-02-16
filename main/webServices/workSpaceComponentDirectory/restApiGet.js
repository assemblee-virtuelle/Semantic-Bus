"use strict";
class RestGetJson{
  constructor(){
    this.type ='Get provider';
    this.description ='Exposer un flux de donnée sur une API http GET.';
    this.editor ='rest-api-get-editor';
    this.graphIcon ='Get_provider.svg';
    this.tags =[
        'http://semantic-bus.org/data/tags/outComponents',
        'http://semantic-bus.org/data/tags/APIComponents'
      ];
    this.stepNode =false;
    this.workspace_component_lib = require('../../../core/lib/workspace_component_lib');
    this.data2xml = require('data2xml');
    this.dataTraitment = require("../dataTraitmentLibrary/index.js");
    this.json2yaml = require('json2yaml');
    this.pathToRegexp = require('path-to-regexp');
    this.engine  = require('../engine.js');
  }

  initialise(router, stompClient){
    router.get('*', (req, res, next) => {
      const urlRequiered = req.params[0].split("/")[1];
      let targetedComponent;

      this.workspace_component_lib.get_all({
        module: 'restApiGet'
      }).then(components => {
        let matched = false;
        for (let component of components) {
          if (component.specificData.url != undefined) {
            let keys = [];
            let regexp = this.pathToRegexp(component.specificData.url, keys);
            if (regexp.test(urlRequiered)) {
              matched = true;
              targetedComponent = component;
              let values = regexp.exec(urlRequiered)
              let valueIndex = 1;
              for (let key of keys) {
                let value = values[valueIndex];
                req.query[key.name] = value;
                valueIndex++;
              }
              // console.log('ALLO');
              for (let queryKey in req.query) {
                try {
                  // console.log('1',req.query[queryKey]);
                  req.query[queryKey] = JSON.parse(req.query[queryKey]);
                } catch (e) {
                  // console.log('2',req.query[queryKey]);
                }
              }
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
          return this.engine.execute(targetedComponent, 'work', stompClient, undefined, undefined, {
            query: req.query,
            body: req.body
          });
        }
      }).then(dataToSend => {
        if (targetedComponent.specificData != undefined) { // exception in previous promise
          if (targetedComponent.specificData.contentType != undefined) {
            if(dataToSend.data==undefined){
                next(new Error('data in flow is not defined. please check your configuration'));
            } else  if (targetedComponent.specificData.contentType.search('application/vnd.ms-excel') != -1) {
              res.setHeader('content-type', targetedComponent.specificData.contentType);
              var responseBodyExel = []
              console.log('data.contentType XLS', targetedComponent.specificData);
              this.dataTraitment.type.buildFile(undefined, JSON.stringify(dataToSend.data), undefined,true, targetedComponent.specificData.contentType).then((result)=>{
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
  }
  pull(data, flowData){
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
}

module.exports=new RestGetJson();
