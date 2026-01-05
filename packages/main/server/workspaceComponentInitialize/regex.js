'use strict';

class Regex {
  constructor() {
    this.type = 'Regex';
    this.description = 'applique un match sur la regex fournis';
    this.editor = 'regex-editor';
    this.graphIcon = 'default.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/manipulation',
      'http://semantic-bus.org/data/tags/manipulationEvaluation'
    ];
  }
}
module.exports = new Regex();
