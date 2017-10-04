var mLabPromise = require('../mLabPromise');
var workspace_component_lib = require('../../lib/core/lib/workspace_component_lib');

module.exports = {
  type: 'Upload',
  description: 'Uploader un fichier',
  editor: 'upload-editor',
  graphIcon:'default.png',
  busboy: require('busboy'),
  mLabPromise: require('../mLabPromise'),
  dataTraitment: require("../dataTraitmentLibrary/index.js"),
  readable: require('stream').Readable,
  stepNode: false,
  //recursivPullResolvePromise : require('../recursivPullResolvePromise'),
  initialise: function(router, recursivPullResolvePromise) {
    // this.recursivPullResolvePromise = recursivPullResolvePromise;
    router.post('/upload/:compId', function(req, res) {
      var compId = req.params.compId;
      const isexel = false
      new Promise(function(resolve, reject) {
        console.log("//// UPLOAD  TRAITMENT ////");
        console.log(req.headers)
        // Create an Busyboy instance passing the HTTP Request headers.
        var busboy = new this.busboy({
          headers: req.headers
        });

        var buffer = []
        var string = ""
        var fileName = null
        // Listen for event when Busboy finds a file to stream.
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
          fileName = filename
          // We are streaming! Handle chunks
          file.on('data', function(data) {
            // Here we can act on the data chunks streamed.
            buffer.push(data)
            string += data
          });
        });
        busboy.on('finish', function() {
          res.statusCode = 200;
          this.dataTraitment.type.type_file(fileName, string, buffer).then(function(result) {
            console.log(result)
            resolve(result)
          })
        }.bind(this));
        req.pipe(busboy);
      }.bind(this)).then(function(resultatTraite) {
        console.log("DATA TRAITÉE UPLOAD |", resultatTraite)
        var recursivPullResolvePromiseDynamic = require('../recursivPullResolvePromise');
        workspace_component_lib.get({_id: compId}).then(data => {
          console.log(data)
          recursivPullResolvePromiseDynamic.getNewInstance().resolveComponent(data, 'push', resultatTraite);
        });
      }.bind(this))
    }.bind(this))
  },



  pull: function(data, flowData) {
    //console.log('Flow Agregator | pull : ',data,' | ',flowData);
    return new Promise((resolve, reject) => {
      // this.mLabPromise.request('GET', 'cache/' + data._id.$oid).then(function (cachedData) {
      //   resolve({
      //     data: JSON.parse(cachedData.data)
      //   });
      // });
      resolve({});
    })
  }
}
