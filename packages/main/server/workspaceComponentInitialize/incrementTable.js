'use strict';
class IncrementTable {
  constructor() {
    this.type = 'IncrementTable';
    this.description = 'Crée un tableau de chiffres incrémentés de l\'index du début à l\'index de fin.';
    this.editor = 'increment-table-editor';
    this.graphIcon = 'default.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/utilities'
    ];
  }
}

module.exports = new IncrementTable();
