var mLabPromise = require('../mLabPromise');

module.exports = {

  type: 'Upload',
  description: 'Uploader un fichier',
  editor: 'upload-editor',
  graphIcon:'default.svg',
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
        console.log("DATA TRAITÉE |", resultatTraite)

        var recursivPullResolvePromiseDynamic = require('../recursivPullResolvePromise');
        this.mLabPromise.request('GET', 'workspaceComponent/' + compId, undefined, undefined).then(data => {
          recursivPullResolvePromiseDynamic.getNewInstance().resolveComponent(data, 'push', resultatTraite);
        });

        // return new Promise((resolve, reject) => {
        //
        //
        //   console.log('cash data | ',flowData);
        //   this.mLabPromise.request('PUT', 'cache/' + compId, {
        //     data: JSON.stringify(resultatTraite)
        //   }).then(function (data) {
        //     resolve(data);
        //     console.log('cache | pull| ',data);
        //     //return recursivPullResolvePromise.resolveComponentPull(data);
        //   });
        //
        // })
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
