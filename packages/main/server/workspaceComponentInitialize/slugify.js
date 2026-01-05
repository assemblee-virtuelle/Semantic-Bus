'use strict';

class Slugify {
  constructor() {
    this.type = 'Slugify';
    this.description = 'genere un slug à partir d\'une chaine de catactères';
    this.editor = 'slugify-editor';
    this.graphIcon = 'default.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/manipulation',
      'http://semantic-bus.org/data/tags/manipulationEvaluation'
    ];
  }
}
module.exports = new Slugify();
