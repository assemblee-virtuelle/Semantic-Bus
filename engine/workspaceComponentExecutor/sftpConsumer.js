'use strict';
class SftpConsumer {
  constructor() {
    this.sftpClient = require('ssh2-sftp-client');
    this.dataTraitment = require('../../core/dataTraitmentLibrary/index.js');
    this.propertyNormalizer = require('../utils/propertyNormalizer.js')
    // this.stringReplacer = require('../utils/stringReplacer.js')
  }

  getFile(specificData, pullParams) {
    return new Promise((resolve, reject) => {
      let sftp = new this.sftpClient();
      sftp.connect({
        host: specificData.host,
        port: specificData.port,
        username: specificData.login,
        password: specificData.password
      }).then((dumy) => {
        return sftp.get(specificData.path);
      }).then((readableStream)=>{

        const fakeName=specificData.path.replace('/','_')

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


  pull(data, flowdata, pullParams) {
    return this.getFile(data.specificData, pullParams)
  }
}
module.exports = new SftpConsumer()
