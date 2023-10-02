'use strict'
class Split {
  constructor () {
    this.type = 'Split'
    this.description = "Sélectionne une partie d'un tableau."
    this.editor = 'split-editor'
    this.graphIcon = 'default.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleQueryingComponents'
    ]
  }
}

module.exports = new Split()
