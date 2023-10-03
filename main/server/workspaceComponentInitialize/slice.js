'use strict'
class Slice {
  constructor () {
    this.type = 'Slice'
    this.description = "Sélectionne une partie d'un tableau."
    this.editor = 'slice-editor'
    this.graphIcon = 'default.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleQueryingComponents'
    ]
  }
}

module.exports = new Slice()
