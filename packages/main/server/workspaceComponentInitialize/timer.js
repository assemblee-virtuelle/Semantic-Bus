'use strict';
class Timer {
  constructor() {
    this.type = 'Timer';
    this.description = 'Déclencher un traitement à intervalle régulier par minute.';
    this.editor = 'timer-editor';
    this.graphIcon = 'Timer.svg';
    this.stepNode = false;
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleUtilitiesComponents'
    ];
  }
}
module.exports = new Timer();
