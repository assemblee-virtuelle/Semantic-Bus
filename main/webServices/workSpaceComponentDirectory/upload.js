'use strict'
// var mLabPromise = require('../mLabPromise');
// var workspace_component_lib = require('../../core/lib/workspace_component_lib');

module.exports = {
  type: 'Upload',
  description: 'Importer un fichier.',
  workspace_component_lib: require('../../../core/lib/workspace_component_lib'),
  editor: 'upload-editor',
  graphIcon: 'Upload.png',
  tags: [
    'http://semantic-bus.org/data/tags/inComponents',
    'http://semantic-bus.org/data/tags/fileComponents'
  ],
  busboy: require('busboy'),
  mLabPromise: require('../mLabPromise'),
  dataTraitment: require('../dataTraitmentLibrary/index.js'),
  propertyNormalizer: require('../sharedLibrary/propertyNormalizer.js'),
  readable: require('stream').Readable,
  configuration: require('../../configuration.js'),
  stepNode: false,

  initialise: function (router, stompClient) {
    // this.stompClient=stompClient;
    router.post('/upload/:compId', (req, res, next) => {
      var compId = req.params.compId
      const isexel = false
      // return new Promise((resolve, reject) => {

      new Promise((resolve, reject) => {
        var busboy = new this.busboy({
          headers: req.headers
        })
        // var buffer = []
        var string = ''
        var fileName = null
        let buffer

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
          fileName = filename
          let bufferEnconding
          switch (encoding) {
          case '7bit':
            bufferEnconding = 'ascii'
            break
          default:
            bufferEnconding = encoding
            break
          }

          // console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
          file.on('data', (data) => {
            // console.log('data', typeof(data));
            if (buffer == undefined) {
              buffer = Buffer.from(data)
            } else {
              // console.log(data);
              buffer = Buffer.concat([buffer, data])
              // buffer.write(data, bufferEnconding);
            }
            // string += data
          })
          file.on('end', () => {
            // console.log('end');
            // console.log('File [' + fieldname + '] Finished');
            string = buffer.toString('utf-8')
          })
        }).on('finish', () => {
          // console.log('finish');
          this.dataTraitment.type.type_file(fileName, string, buffer).then((result) => {
            let normalized = this.propertyNormalizer.execute(result)
            // console.log(normalized);
            resolve(normalized)
          }, (err) => {
            // console.log("in error ")
            let fullError = new Error(err)
            fullError.displayMessage = 'Upload : ' + err
            reject(fullError)
          })

          // console.log('Data2: ' + base64data);
        })

        busboy.on('error', (err) => {
          let fullError = new Error(err)
          fullError.displayMessage = 'Upload : Erreur lors de votre traitement de fichier'
          reject(fullError)
        })

        // busboy.on('finish', () => {
        //
        //   //res.statusCode = 200;
        //   this.dataTraitment.type.type_file(fileName, string, buffer).then((result) => {
        //     resolve(result)
        //   }, (err) => {
        //     //console.log("in error ")
        //     let fullError = new Error(err);
        //     fullError.displayMessage = "Upload : " + err;
        //     reject(fullError);
        //   })
        // });

        req.pipe(busboy)
      }).then((resultatTraite) => {
        res.json({
          message: 'file upload ok'
        })
        // console.log('HTTP OK');
        // console.log('ALLO');
        // console.log(this);
        var recursivPullResolvePromiseDynamic = require('../engine')
        this.workspace_component_lib.get({
          _id: compId
        }).then(data => {
          // console.log('ALLO',req);
          let token = req.headers['authorization']
          // console.log('token |', token);
          let user
          let jwtSimple = require('jwt-simple')
          if (token != undefined) {
            token.split('')
            let decodedToken = jwtSimple.decode(token.substring(4, token.length), this.configuration.secret)
            // console.log('ALLO', decodedToken);
            user = decodedToken.iss
            // console.log('user |', user);
          }
          // console.log('resultatTraite',resultatTraite);
          recursivPullResolvePromiseDynamic.execute(data, 'push', stompClient, user, resultatTraite.data).then((res) => {
            // resolve({
            //   data: res
            // })
          })
        }).catch(err => {
          // let fullError = new Error(err);
          // fullError.displayMessage = "Upload : Erreur lors de votre traitement de fichier";
          // next(fullError)
        })
      }).catch(err => {
        // console.log("in error 2");
        // res.status(500).send(err);
        next(err)
      })
      // })
    })
  },

  pull: function (data, flowData) {
    return new Promise((resolve, reject) => {
      resolve({})
    })
  }
}
