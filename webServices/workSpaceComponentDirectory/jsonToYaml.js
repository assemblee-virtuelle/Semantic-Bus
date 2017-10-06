module.exports = {
    type: 'Json_to_Yaml ',
    description: 'Traduction du flux json en yaml',
    editor: 'json-to-yaml',
    graphIcon:'default.png',
    module: 'Json to Yaml',
    stepNode : false,
    workspace_component_lib : require('../../lib/core/lib/workspace_component_lib'),
    json2yaml: require('json2yaml'),

    initialise : function (router) {
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

            res.setHeader('content-type', 'text/yaml' );
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
          console.log('API data', specificData);

          res.json(dataToSend.data);

        });


      }.bind(this));
    },

    pull: function (data, flowData) {
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
}
