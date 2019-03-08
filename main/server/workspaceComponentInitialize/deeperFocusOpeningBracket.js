'use strict';
class DeeperFocusOpeningBracket {
  constructor () {
    this.type = 'Deeper Focus'
    this.description = 'Début de traitement d\'un niveau de profondeur du flux.'
    this.editor = 'deeper-focus-opening-bracket-editor'
    this.graphIcon = 'Deeper_focus.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleUtilitiesComponents'
    ]
  }
}
module.exports = new DeeperFocusOpeningBracket()
