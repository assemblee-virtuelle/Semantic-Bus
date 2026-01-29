'use strict';

const path = require('path');
const fs = require('fs');
const busboy = require('busboy');
const file_lib = require('@semantic-bus/core/lib/file_lib_scylla');
const file_model_scylla = require('@semantic-bus/core/models/file_model_scylla');

class Upload {
  constructor() {
    this.type = 'Upload';
    this.description = 'Importer un fichier.';
    this.editor = 'upload-editor';
    this.graphIcon = 'Upload.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/integration',
      'http://semantic-bus.org/data/tags/integrationFiles',
      'http://semantic-bus.org/data/tags/triggers'
    ];
    // this.dataTraitment = require('../../../core/dataTraitmentLibrary/index.js')
    this.file_convertor = require('@semantic-bus/core/dataTraitmentLibrary/file_convertor.js');
    this.propertyNormalizer = require('../utils/propertyNormalizer.js');
    this.readable = require('stream').Readable;
    this.workspace_component_lib = require('@semantic-bus/core/lib/workspace_component_lib');
    this.configuration = require('../../config.json');
    this.stepNode = false;
    this.config = require('../../config.json');
  }

  setAmqp(amqpConnection) {
    this.amqpConnection = amqpConnection;
  }

  initialise(router) {
    router.post('/upload/:compId', (req, res, next) => {
      const compId = req.params.compId;

      const busboyInstance = busboy({
        headers: req.headers
      });

      let fileName = null;
      const saveTo = null;
      busboyInstance.on('file', (fieldname, file, info) => {
        console.log('UPLOAD', info);
        fileName = info.filename;
        let buffer = Buffer.alloc(0);

        file.on('data', (data) => {
          buffer = Buffer.concat([buffer, data]);
        });

        file.on('end', async() => {
          try {
            // console.log('_WRITE to file scylla');
            const fileData = new file_model_scylla.model({
              binary: buffer, // Utiliser la chaîne hexadécimale ici
              filename: fileName,
              frag: null // ou toute autre propriété dont vous avez besoin
            });

            const file = await file_lib.create(fileData);

            const workParams = {
              id: compId,
              queryParams: {
                _file: file.id
              }
            };

            console.log('workParams', workParams);

            this.amqpConnection.sendToQueue(
              'work-ask',
              Buffer.from(JSON.stringify(workParams)),
              null,
              (err, ok) => {
                if (err !== null) {
                  console.error('Erreur lors de l\'envoi du message :', err);
                  res.status(500).send({
                    error: 'AMQP server no connected'
                  });
                }
              }
            );

            res.json({
              message: 'file upload ok'
            });
          } catch (error) {
            console.error('Error processing file:', error);
            res.status(500).send({
              error: 'Error processing file'
            });
          }
        });
      });
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
        const fullError = new Error(err);
        fullError.displayMessage = 'Upload : Erreur lors de votre traitement de fichier';
        reject(fullError);
      });

      req.pipe(busboyInstance);
    });
  }
}

module.exports = new Upload();
