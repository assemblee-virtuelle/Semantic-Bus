'use strict';
class HttpGet {
  constructor () {
    this.type = 'File consumer'
    this.description = 'Interroger un fichier mis à disposition sur une API REST avec une requete GET.'
    this.editor = 'rest-get-editor'
    this.graphIcon = 'File_consumer.svg'
  }
}
module.exports = new HttpGet()
