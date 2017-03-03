module.exports = new function() {
  this.type = 'REST API GET';
  this.description = 'exposition du flux de donnée sur une API http uniquement en GET';
  this.editor = 'rest-api-get-editor';
  this.stepNode = false;
  this.mLabPromise = require('../mLabPromise');


  this.initialise = function(router) {
    router.get('/api/:urlRequiered', function(req, res) {
      var urlRequiered = req.params.urlRequiered;
      //this require is live because constructor require cause cyclic dependencies (recursivPullResolvePromise->restApiGet)
      this.recursivPullResolvePromise = require('../recursivPullResolvePromise')
      this.mLabPromise.request('GET', 'workspaceComponent', undefined, {
        q: {
          "specificData.url": urlRequiered
        }
      }).then(function(data) {
        res.setHeader('content-type', data[0].specificData.contentType);
        return this.recursivPullResolvePromise.resolveComponentPull(data[0], false);
      }.bind(this)).then(function(data) {

        res.json(data);
      });

      //console.log('restApiGet webservice Request');

    }.bind(this));
  }

  this.test = function(data, flowData) {
    //console.log('Flow Agregator | test : ',data,' | ',flowData);
    return new Promise((resolve, reject) => {
      if (flowData != undefined) {
        //console.log('cash data | ',flowData);
        resolve(flowData)
      } else {
        throw new Error('composant finale : ne peux etre braché comme source')
      }
    })
  }
}();
