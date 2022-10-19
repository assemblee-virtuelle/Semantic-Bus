'use strict'

class Upload {
  constructor () {
    this.type = 'Upload'
    this.description = 'Importer un fichier.'
    this.editor = 'upload-editor'
    this.graphIcon = 'Upload.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/fileComponents'
    ]
    this.busboy = require('busboy')
    this.dataTraitment = require('../../../core/dataTraitmentLibrary/index.js')
    this.propertyNormalizer = require('../utils/propertyNormalizer.js')
    this.readable = require('stream').Readable
    this.workspace_component_lib = require('../../../core/lib/workspace_component_lib')
    this.configuration = require('../../configuration.js')
    this.stepNode = false
    this.request = require('request')
    this.config = require('../../configuration')
  }

  initialise (router, stompClient) {
    router.post('/upload/:compId', (req, res, next) => {
      var compId = req.params.compId
      new Promise((resolve, reject) => {
        var busboy = new this.busboy({
          headers: req.headers
        })

        var string = ''
        var fileName = null
        let buffer
        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
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
        this.workspace_component_lib.get({
          _id: compId
        }).then(component => {
          // console.log('resultatTraite.data',resultatTraite.data);
          this.request.post(this.config.engineUrl + '/work-ask/' + component._id,
            { body: {
                pushData: resultatTraite.data,
                queryParams: {
                  upload: resultatTraite.data
                }
             },
              json: true
            }
            // eslint-disable-next-line handle-callback-err
            , (err, dataToSend) => {
              if (err) {
                console.error(err);
                // err.details=err.displayMessage;
                next(err)
              } else {
                res.json({
                  message: 'file upload ok'
                })
              }
            })
        })
      }).catch(err => {
        next(err)
      })
    })
  }
}

module.exports = new Upload()
