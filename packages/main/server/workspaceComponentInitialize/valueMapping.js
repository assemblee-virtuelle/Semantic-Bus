'use strict';

class ValueMapping {
  constructor() {
    this.type = 'Value mapping';
    this.description = 'Remplacer les valeurs d\'une propriété par une autre.';
    this.editor = 'value-mapping-editor';
    this.graphIcon = 'Value_mapping.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/manipulation',
      'http://semantic-bus.org/data/tags/manipulationMapping'
    ];
    this.secondFlowConnector = true;
  }
}

module.exports = new ValueMapping();
