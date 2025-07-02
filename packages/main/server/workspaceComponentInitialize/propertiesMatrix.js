'use strict'
class PropertiesMatrix {
  constructor () {
    this.type = 'Property matrix'
    this.description = 'Reconstruire des objets à partir de plusieurs propriétés en liste.'
    this.editor = 'properties-matrix-editor'
    this.graphIcon = 'Property_matrix.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleQueryingComponents'
    ]
  }
}

module.exports = new PropertiesMatrix()
