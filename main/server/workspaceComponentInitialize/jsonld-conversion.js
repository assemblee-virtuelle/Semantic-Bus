'use strict'
class Flat {
  constructor () {
    this.type = 'JsonLdConversion'
    this.description = 'conversion de donnée JSON-LD (frame)'
    this.editor = 'jsonld-conversion-editor'
    this.graphIcon = 'default.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleQueryingComponents'
    ]
  }
}

module.exports = new Flat()
