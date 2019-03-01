'use strict'
class Filter {
  constructor () {
    this.type = 'Filter'
    this.description = 'Filtrer le flux.'
    this.editor = 'filter-editor'
    this.graphIcon = 'Filter.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleQueryingComponents'
    ]
  }
}

module.exports = new Filter()
