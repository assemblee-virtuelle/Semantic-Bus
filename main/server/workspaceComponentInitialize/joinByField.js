'use strict';
class JoinByField {
  constructor () {
    this.type = 'Join'
    this.description = 'Compléter un flux par un second en se basant sur un champ du 1er et un identifiant du 2nd.'
    this.editor = 'join-by-field-editor'
    this.graphIcon = 'Join.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleComponentsAgregation'
    ]
  }
}

module.exports = new JoinByField()
