'use strict';
class JsEvaluation {
  constructor() {
    this.type = 'JS evaluation';
    this.description = 'Applique du code Javascript aux données';
    this.editor = 'js-evaluation-editor';
    this.graphIcon = 'default.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/manipulation',
      'http://semantic-bus.org/data/tags/manipulationEvaluation'
    ];
  }
}

module.exports = new JsEvaluation();
