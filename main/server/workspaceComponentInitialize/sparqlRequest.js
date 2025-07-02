'use strict'
class SparqlRequest {
  constructor () {
    this.type = 'SPARQL'
    this.description = 'Requêter en SPARQL sur un fichier JSON ld.'
    this.editor = 'sparql-request-editor'
    this.graphIcon = 'Sparql.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleQueryingComponents'
    ]
  }
}
module.exports = new SparqlRequest()
