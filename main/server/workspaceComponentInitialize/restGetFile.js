'use strict';
class HttpGet {
  constructor () {
    this.type = 'File consumer'
    this.description = 'Interroger un fichier mis à disposition sur une API REST avec une requete GET.'
    this.editor = 'rest-get-editor'
    this.graphIcon = 'File_consumer.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/fileComponents'
    ]
  }
}
module.exports = new HttpGet()
