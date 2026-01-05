'use strict';
class Slice {
  constructor() {
    this.type = 'Slice';
    this.description = 'Sélectionne une partie d\'un tableau de l\'index du début à l\'index de fin inclu.';
    this.editor = 'slice-editor';
    this.graphIcon = 'default.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/manipulation',
      'http://semantic-bus.org/data/tags/manipulationCollections'
    ];
  }
}

module.exports = new Slice();
