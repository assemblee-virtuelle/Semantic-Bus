'use strict';
class SftpConsumer {
  constructor() {
    this.sftpClient = require('ssh2-sftp-client');
    this.dataTraitment = require('../../core/dataTraitmentLibrary/index.js');
    this.propertyNormalizer = require('../utils/propertyNormalizer.js')
    this.stringReplacer = require('../utils/stringReplacer.js');
    // this.stringReplacer = require('../utils/stringReplacer.js')
  }

  getFile(specificData, data, pullParams) {
    return new Promise((resolve, reject) => {
      let sftp = new this.sftpClient();

      const specificDataParsed = {};

      for (const key of Object.keys(specificData)) {;
        try {
          specificDataParsed[key] = this.stringReplacer.execute(specificData[key], pullParams, data)
        } catch (e) {
          specificDataParsed[key] = {error:e.message};
          // console.log(e.message);
        }
      }

      sftp.connect({
        host: specificDataParsed.host,
        port: specificDataParsed.port,
        username: specificDataParsed.login,
        password: specificDataParsed.password
      }).then((dumy) => {
        return sftp.get(specificDataParsed.path);
      }).then((readableStream)=>{

        const fakeName=specificDataParsed.path.replace('/','_');



        this.dataTraitment.type.type_file(fakeName, readableStream.toString(), readableStream).then((result) => {
          let normalized = this.propertyNormalizer.execute(result)
          resolve({
            data: normalized
          })
        }, (err) => {
          let fullError = new Error(err)
          fullError.displayMessage = 'SFTP : Erreur lors du traitement de votre fichier';
          reject(fullError)
        })
      }).catch((err) => {
        reject(err);
      })
    })
  }


  pull(data, flowData, pullParams) {
    return this.getFile(data.specificData, flowData[0].data, pullParams)
  }
}
module.exports = new SftpConsumer()
