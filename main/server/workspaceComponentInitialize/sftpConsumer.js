'use strict'
class SftpConsumer {
  constructor () {
    this.type = 'SFTP consumer'
    this.description = 'Interroger un fichier mis à disposition sur un serveur FTP.'
    this.editor = 'sftp-consumer-editor'
    this.graphIcon = 'File_consumer.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/fileComponents'
    ]
  }
}
module.exports = new SftpConsumer()
