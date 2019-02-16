'use strict'

class Upload {
  constructor () {
    this.type = 'Upload'
    this.description = 'Importer un fichier.'
    this.workspace_component_lib = require('../../../core/lib/workspace_component_lib')
    this.editor = 'upload-editor'
    this.graphIcon = 'Upload.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/fileComponents'
    ]
    this.busboy = require('busboy')
    this.dataTraitment = require('../dataTraitmentLibrary/index.js')
    this.propertyNormalizer = require('../sharedLibrary/propertyNormalizer.js')
    this.readable = require('stream').Readable
    this.configuration = require('../../configuration.js')
    this.stepNode = false
  }

  initialise (router, stompClient) {
    console.log('ALLO-2');
    router.post('/upload/:compId', (req, res, next) => {
      var compId = req.params.compId
      console.log('ALLO-1');

      new Promise((resolve, reject) => {
        var busboy = new this.busboy({
          headers: req.headers
        })

        var string = ''
        var fileName = null
        let buffer
        console.log('ALLO0');
        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
          console.log('ALLO1');
          fileName = filename
          file.on('data', (data) => {
            if (buffer == undefined) {
              buffer = Buffer.from(data)
            } else {
              buffer = Buffer.concat([buffer, data])
            }
          })
          file.on('end', () => {
            string = buffer.toString('utf-8')
          })
        }).on('finish', () => {
          console.log('ALLO2');
          this.dataTraitment.type.type_file(fileName, string, buffer).then((result) => {
            let normalized = this.propertyNormalizer.execute(result)
            resolve(normalized)
          }, (err) => {
            let fullError = new Error(err)
            fullError.displayMessage = 'Upload : ' + err
            reject(fullError)
          })

        })

        busboy.on('error', (err) => {
          let fullError = new Error(err)
          fullError.displayMessage = 'Upload : Erreur lors de votre traitement de fichier'
          reject(fullError)
        })

        req.pipe(busboy)
      }).then((resultatTraite) => {
        res.json({
          message: 'file upload ok'
        })

        var recursivPullResolvePromiseDynamic = require('../engine')
        this.workspace_component_lib.get({
          _id: compId
        }).then(data => {
          let token = req.headers['authorization']
          let user
          let jwtSimple = require('jwt-simple')
          if (token != undefined) {
            token.split('')
            let decodedToken = jwtSimple.decode(token.substring(4, token.length), this.configuration.secret)
            user = decodedToken.iss
          }
          recursivPullResolvePromiseDynamic.execute(data, 'push', stompClient, user, resultatTraite.data).then((res) => {
          })
        }).catch(_err => {
          let fullError = new Error(_err)
          fullError.displayMessage = 'Upload : Erreur lors de votre traitement de fichier'
        })
      }).catch(err => {
        // console.log("in error 2");
        // res.status(500).send(err);
        next(err)
      })
      // })
    })
  }

  pull () {
    return new Promise((resolve, reject) => {
      resolve({})
    })
  }
}

module.exports = new Upload()
