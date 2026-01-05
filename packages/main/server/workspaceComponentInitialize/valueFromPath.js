'use strict';
class ValueFromPath {
  constructor() {
    this.type = 'Root from path';
    this.description = 'Extraire une valeur par son chemin.';
    this.editor = 'value-from-path-editor';
    this.graphIcon = 'Root_from_path.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/manipulation',
      'http://semantic-bus.org/data/tags/manipulationMapping'
    ];
  }
}

module.exports = new ValueFromPath();
