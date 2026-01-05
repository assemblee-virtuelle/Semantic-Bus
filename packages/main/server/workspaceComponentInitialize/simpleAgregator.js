'use strict';

class SimpleAgregator {
  constructor() {
    this.type = 'Aggregate';
    this.description = 'Agréger plusieurs flux pour n\'en former qu\'un seul.';
    this.editor = 'simple-agregator-editor';
    this.graphIcon = 'Aggregate.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/manipulation',
      'http://semantic-bus.org/data/tags/manipulationAggregation'
    ];
  }
}
module.exports = new SimpleAgregator();
