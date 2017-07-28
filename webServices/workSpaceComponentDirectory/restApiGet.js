module.exports = new function() {
  this.type = 'REST API GET';
  this.description = 'exposition du flux de donnée sur une API http uniquement en GET';
  this.editor = 'rest-api-get-editor';
  this.stepNode = false;
  this.mLabPromise = require('../mLabPromise');
  this.data2xml = require('data2xml');


  this.initialise = function(router) {
    router.get('/:urlRequiered', function(req, res) {
      //console.log(req.query);
      var urlRequiered = req.params.urlRequiered;
      //this require is live because constructor require cause cyclic dependencies (recursivPullResolvePromise->restApiGet)
      this.recursivPullResolvePromise = require('../recursivPullResolvePromise')
      var specificData;
      this.mLabPromise.request('GET', 'workspaceComponent', undefined, {
          q: {
            "specificData.url": urlRequiered
          }
        }).then(function(data) {
          //console.log(data);
          if (data.length > 0) {
            specificData = data[0].specificData;
            res.setHeader('content-type', data[0].specificData.contentType);
            console.log(req.query);
            return this.recursivPullResolvePromise.resolveComponentPull(data[0], false,req.query);
          } else {
            return new Promise((resolve, reject) => {
              reject({
                code: 404,
                message: "pas d'API pour cette url"
              })
            })
          }
        }.bind(this)).catch(err => {
          res.status(err.code).send(err.message)
        }).then(function(dataToSend) {
          //console.log(dataToSend);
          if (specificData.contentType.search('xml') != -1) {
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
        }.bind(this));

      //console.log('restApiGet webservice Request');

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
