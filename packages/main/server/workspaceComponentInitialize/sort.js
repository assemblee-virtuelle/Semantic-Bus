'use strict';
class Sort {
  constructor() {
    this.type = 'Sort';
    this.description = 'Trier le flux selon une propriété (syntaxe MongoDB).';
    this.editor = 'sort-editor';
    this.graphIcon = 'Sort.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/manipulation',
      'http://semantic-bus.org/data/tags/manipulationCollections'
    ];
  }
}

module.exports = new Sort();
