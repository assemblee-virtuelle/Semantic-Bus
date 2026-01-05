'use strict';
class PropertiesMatrix {
  constructor() {
    this.type = 'Property matrix';
    this.description = 'Reconstruire des objets à partir de plusieurs propriétés en liste.';
    this.editor = 'properties-matrix-editor';
    this.graphIcon = 'Property_matrix.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/manipulation',
      'http://semantic-bus.org/data/tags/manipulationRestructure'
    ];
  }
}

module.exports = new PropertiesMatrix();
