'use strict'

const path = require('path');
const fs = require('fs');
const busboy = require('busboy');
const file_lib = require('../../../core/lib/file_lib_scylla')
const file_model_scylla = require('../../../core/models/file_model_scylla')

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
    // this.dataTraitment = require('../../../core/dataTraitmentLibrary/index.js')
    this.file_convertor = require('../../../core/dataTraitmentLibrary/file_convertor.js')
    this.propertyNormalizer = require('../utils/propertyNormalizer.js')
    this.readable = require('stream').Readable
    this.workspace_component_lib = require('../../../core/lib/workspace_component_lib')
    this.configuration = require('../../config.json')
    this.stepNode = false
    this.request = require('request')
    this.config = require('../../config.json')
  }

  setAmqp(amqpConnection){
    // console.log('set AMQP')
    this.amqpConnection=amqpConnection;
  }

  initialise (router, stompClient) {
    router.post('/upload/:compId', (req, res, next) => {
      var compId = req.params.compId

      var busboyInstance = new busboy({
        headers: req.headers
      })

      let fileName = null
      let saveTo = null
      busboyInstance.on('file', (fieldname, file, filename, encoding, mimetype) => {
        fileName = filename;
        let buffer = Buffer.alloc(0);

        file.on('data', (data) => {
          buffer = Buffer.concat([buffer, data]);
        });

        file.on('end', async () => {
          try {
            const fileData = new file_model_scylla.model({
              binary: buffer, // Utiliser la chaîne hexadécimale ici
              filename: fileName,
              frag: null, // ou toute autre propriété dont vous avez besoin
            });

            const file = await file_lib.create(fileData);

            const workParams = {
              id: compId,
              queryParams: {
                _file: file.id,
              },
            };

            // console.log('workParams',workParams);

            this.amqpConnection.sendToQueue(
              'work-ask',
              Buffer.from(JSON.stringify(workParams)),
              null,
              (err, ok) => {
                if (err !== null) {
                  console.error('Erreur lors de l\'envoi du message :', err);
                  res.status(500).send({
                    error: 'AMQP server no connected',
                  });
                }
              }
            );

            res.json({
              message: 'file upload ok',
            });
          } catch (error) {
            console.error('Error processing file:', error);
            res.status(500).send({
              error: 'Error processing file',
            });
          }
        });
      })
      // busboyInstance.on('finish', async () => {
      //   res.json({
      //     message: 'file upload ok'
      //   })

      //   const file = await file_lib.create({
      //     filePath:saveTo,
      //     fileName:fileName
      //   })

      //   const workParams={
      //     id : compId,
      //     queryParams: {
      //       _file : file._id
      //     }
      //   }

      //   this.amqpConnection.sendToQueue(
      //     'work-ask',
      //     Buffer.from(JSON.stringify(workParams)),
      //     null,

      //     (err, ok) => {
      //       if (err !== null) {
      //         console.error('Erreur lors de l\'envoi du message :', err);
      //         res.status(500).send({
      //            error: 'AMQP server no connected'
      //          })
      //       } else {
      //        //  console.log(`Message envoyé à la file `);
      //         // res.send(workParams);
      //       }
      //     }
      //   )
      // })

      busboyInstance.on('error', (err) => {
        let fullError = new Error(err)
        fullError.displayMessage = 'Upload : Erreur lors de votre traitement de fichier'
        reject(fullError)
      })

      req.pipe(busboyInstance)
    })
  }

}

module.exports = new Upload()


