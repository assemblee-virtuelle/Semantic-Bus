'use strict';

class Unicity {
  constructor() {
    this.type = 'Unicity';
    this.description = 'Structurer les données en vérifiant l\'unicité par champ et répartir les valeurs par source.';
    this.editor = 'unicity-editor';
    this.graphIcon = 'Unicity.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleComponentsAgregation'
    ];
  }
}
module.exports = new Unicity();
