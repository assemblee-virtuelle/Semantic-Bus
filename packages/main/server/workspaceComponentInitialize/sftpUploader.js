'use strict';
class SftpUploader {
  constructor() {
    this.type = 'SFTP uploader';
    this.description = 'Envoyer un fichier vers un serveur SFTP.';
    this.editor = 'sftp-uploader-editor';
    this.graphIcon = 'default.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/integration',
      'http://semantic-bus.org/data/tags/integrationFiles'
    ];
  }
}

module.exports = new SftpUploader();
