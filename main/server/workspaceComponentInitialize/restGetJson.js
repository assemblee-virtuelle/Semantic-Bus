'use strict'
class RestGetJson {
  constructor () {
    this.type = 'Flow consumer'
    this.description = 'Interroger une API REST avec une requête GET qui fournit un flux JSON; XML.'
    this.editor = 'rest-get-json-editor'
    this.graphIcon = 'Flow_consumer.svg'
  }
}
module.exports = new RestGetJson()