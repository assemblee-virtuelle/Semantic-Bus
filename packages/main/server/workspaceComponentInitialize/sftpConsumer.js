'use strict';
class SftpConsumer {
  constructor() {
    this.type = 'SFTP consumer';
    this.description = 'Récupérer un fichier depuis un serveur SFTP.';
    this.editor = 'sftp-consumer-editor';
    this.graphIcon = 'default.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/integration',
      'http://semantic-bus.org/data/tags/integrationFiles'
    ];
  }
}

module.exports = new SftpConsumer();
