'use strict';
class SftpUploader {
  constructor() {
    this.sftpClient = require('ssh2-sftp-client');
    this.stringReplacer = require('../utils/stringReplacer.js');
    this.fileLib = require('../../core/lib/file_lib_scylla.js');
    this.File = require('../../core/model_schemas/file_schema_scylla.js');
    this.fileConvertor = require('../../core/dataTraitmentLibrary/file_convertor.js');
  }

  uploadFile(specificData, data, pullParams, processId) {
    return new Promise((resolve, reject) => {
      let sftp = new this.sftpClient();

      const specificDataParsed = {};

      Object.keys(specificData).forEach(key => {
        if (typeof specificData[key] === 'string' || specificData[key] instanceof String) {
          try {
            specificDataParsed[key] = this.stringReplacer.execute(specificData[key], pullParams, data);
          } catch (e) {
            specificDataParsed[key] = { error: e.message };
          }
        } else {
          specificDataParsed[key] = specificData[key];
        }
      });

      // Configuration pour se connecter au serveur SFTP
      const config = {
        host: specificDataParsed.host,
        port: specificDataParsed.port,
        username: specificDataParsed.login,
        password: specificDataParsed.password
      };

      // Vérifier si nous avons un fichier à uploader
      if (!((data && specificDataParsed.contentType) || (!data._file))) {
        return reject(new Error('Aucun fichier ou contenu à uploader'));
      }

      sftp.connect(config)
        .then(async () => {
          let fileContent;
          let extension = this.fileConvertor.extension(specificDataParsed.fileName, specificDataParsed.contentType);
          let fileName = specificDataParsed.fileName || 'uploaded_file';
          fileName = `${fileName}.${extension}`;

          // Vérifier si nous avons un ID de fichier ou un contenu direct
          if (data._file) {
            try {
              const file = await this.fileLib.get(data._file);
              if (!file || !file.binary) {
                throw new Error('Fichier non trouvé ou sans contenu binaire');
              }
              fileContent = file.binary;
              if (file.filename && !specificDataParsed.fileName) {
                fileName = file.filename;
              }
            } catch (e) {
              return reject(e);
            }
          } else if (data && specificDataParsed.contentType) {
            // Conversion des données en fichier avec le format spécifié
            try {
              const dataString = typeof data === 'string'
                ? data
                : JSON.stringify(data);

              // Si le type de contenu est JSON, on utilise directement les données stringifiées
              if (specificDataParsed.contentType === 'application/json') {
                fileContent = Buffer.from(dataString);
              } else {
                // Sinon, on utilise le convertisseur de fichier pour transformer les données
                fileContent = await this.fileConvertor.buildFile(
                  fileName,
                  dataString,
                  null,
                  null,
                  specificDataParsed.contentType
                );
              }
            } catch (e) {
              return reject(new Error(`Erreur lors de la conversion du fichier: ${e.message || e}`));
            }
          } else if (typeof data === 'string') {
            fileContent = Buffer.from(data);
          } else if (typeof data === 'object') {
            fileContent = Buffer.from(JSON.stringify(data));
          }

          // Construire le chemin complet
          const remotePath = specificDataParsed.path ?
            (specificDataParsed.path.endsWith('/') ? specificDataParsed.path + fileName : specificDataParsed.path + '/' + fileName) :
            fileName;

          // Créer le répertoire si nécessaire
          if (specificDataParsed.createDirectory) {
            const dirPath = remotePath.substring(0, remotePath.lastIndexOf('/'));
            if (dirPath) {
              try {
                await sftp.mkdir(dirPath, true);
              } catch (e) {
                console.warn(`Erreur lors de la création du répertoire ${dirPath}: ${e.message}`);
              }
            }
          }
          try {
            await sftp.put(fileContent, remotePath);
            await sftp.end();
            resolve({
              data: {
                success: true,
                message: `Fichier uploadé avec succès vers ${specificDataParsed.path}`,
                path: specificDataParsed.path
              }
            });
          } catch (e) {
            await sftp.end();
            console.log('error upload');
            reject(e);
          }
        }).catch(e => {
          if (sftp) {
            sftp.end();
          }
          reject(e);
        });
    });
  }

  pull(data, flowData, pullParams, processId) {
    if (!flowData || !flowData[0] || !flowData[0].data) {
      return Promise.reject(new Error('Aucune donnée en entrée'));
    }

    return this.uploadFile(data.specificData, flowData[0].data, pullParams, processId);
  }
}

module.exports = new SftpUploader(); 