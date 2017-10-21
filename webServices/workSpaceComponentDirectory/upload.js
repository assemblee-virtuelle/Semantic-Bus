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
  initialise: function(router, recursivPullResolvePromise) {    
    router.post('/upload/:compId', function(req, res) {

      var compId = req.params.compId;
      const isexel = false
      new Promise(function(resolve, reject) {
        var busboy = new this.busboy({
          headers: req.headers
        });
        var buffer = []
        var string = ""
        var fileName = null
        
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
          fileName = filename
          file.on('data', function(data) {
            buffer.push(data)
            string += data
          });
        });

        busboy.on('error', function(err) {
          let fullError = new Error(err);
          fullError.displayMessage = "Upload : Erreur lors de votre traitement de fichier";
          reject(fullError)
        });

        busboy.on('finish', function() {
          res.statusCode = 200;
          this.dataTraitment.type.type_file(fileName, string, buffer).then(function(result) {
            resolve(result)
          })
        }.bind(this));

        req.pipe(busboy);

      }.bind(this)).then(function(resultatTraite) {
        var recursivPullResolvePromiseDynamic = require('../recursivPullResolvePromise');
        workspace_component_lib.get({_id: compId}).then(data => {
          recursivPullResolvePromiseDynamic.getNewInstance().resolveComponent(data, 'push', resultatTraite);
        }, function(err){
          let fullError = new Error(err);
          fullError.displayMessage = "Upload : Erreur lors de votre traitement de fichier";
          reject(fullError)
        });
      }.bind(this))
    }.bind(this))
  },



  pull: function(data, flowData) {
    return new Promise((resolve, reject) => {
      resolve({});
    })
  }
}
