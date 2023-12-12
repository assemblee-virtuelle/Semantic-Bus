'use strict';
class HttpFileConsumer {
  constructor () {
    this.type = 'HTTP File Consumer'
    this.description = 'Interroger un fichier mis à disposition sur une API REST avec une requete GET.'
    this.editor = 'http-file-consumer-editor'
    this.graphIcon = 'File_consumer.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/fileComponents'
    ]
  }
}
module.exports = new HttpFileConsumer()
