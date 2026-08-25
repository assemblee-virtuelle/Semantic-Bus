'use strict';

const path = require('path');
const fs = require('fs');
const busboy = require('busboy');
const file_lib = require('@semantic-bus/core/lib/file_lib_scylla');
const file_model_scylla = require('@semantic-bus/core/models/file_model_scylla');
const hmac_lib = require('@semantic-bus/core/lib/hmac_lib');
const auth_lib_jwt = require('@semantic-bus/core/lib/auth_lib');
const user_lib = require('@semantic-bus/core/lib/user_lib');
const config = require('../../config.json');

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

  // SÉCURITÉ : l'upload d'un fichier n'est autorisé que si l'appelant est
  // owner ou editor du workspace auquel appartient le composant cible (compId),
  // ou admin. Retourne le workspaceId du composant, ou null si non autorisé.
  async assertUploadAccess(req, compId) {
    const component = await this.workspace_component_lib.get({ _id: compId }).catch(() => null);
    if (!component || !component.workspaceId) return null;
    const workspaceId = component.workspaceId.toString();
    const token = req.body.token || req.query.token || req.headers['authorization'];
    if (!token) return null;
    const decoded = auth_lib_jwt.get_decoded_jwt(token.substring(4, token.length));
    if (!decoded || !decoded.iss) return null;
    const result = await user_lib.getWithRelations(decoded.iss, config);
    if (!result) return null;
    if (result.admin) return workspaceId;
    const member = (result.workspaces || []).find(w =>
      w.workspace && w.workspace._id && w.workspace._id.toString() === workspaceId
    );
    if (member && (member.role === 'owner' || member.role === 'editor')) return workspaceId;
    return null;
  }

  initialise(router) {
    router.post('/upload/:compId', async (req, res, next) => {
      const compId = req.params.compId;

      // SÉCURITÉ : seul un owner/editor du workspace du composant (ou admin) peut uploader.
      const workspaceId = await this.assertUploadAccess(req, compId);
      if (!workspaceId) {
        return res.status(403).send({ success: false, message: 'No right' });
      }

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
              frag: null, // ou toute autre propriété dont vous avez besoin
              workspaceId
            });

            const file = await file_lib.create(fileData);

            const workParams = hmac_lib.signMessage(compId, {
              id: compId,
              queryParams: {
                _file: file.id
              }
            });

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
