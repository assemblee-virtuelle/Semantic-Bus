'use strict';
class SftpUploader {
  constructor () {
    this.type = 'SFTP Uploader'
    this.description = 'Envoyer des fichiers vers un serveur SFTP'
    this.editor = 'sftp-uploader-editor'
    this.graphIcon = 'default.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/outComponents',
      'http://semantic-bus.org/data/tags/fileComponents'
    ]
  }
}

module.exports = new SftpUploader() 