'use strict'
class KeyToArray {
  constructor () {
    this.type = 'KeyToArray'
    this.description = 'Transformer les clefs d\'un objet en tableau'
    this.editor = 'key-to-array-editor'
    this.graphIcon = 'default.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleQueryingComponents'
    ]
  }
}
module.exports = new KeyToArray()
