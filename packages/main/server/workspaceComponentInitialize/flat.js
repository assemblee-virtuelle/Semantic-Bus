'use strict';
class Flat {
  constructor() {
    this.type = 'Flat';
    this.description = 'Transforme un tableau de tableaux en un seul tableau.';
    this.editor = 'flat-editor';
    this.graphIcon = 'default.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/manipulation',
      'http://semantic-bus.org/data/tags/manipulationRestructure'
    ];
  }
}

module.exports = new Flat();
