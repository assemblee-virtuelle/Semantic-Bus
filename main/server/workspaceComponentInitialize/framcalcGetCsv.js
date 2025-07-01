'use strict'

class FramcalcGetCsv {
  constructor () {
    this.type = 'Framacalc'
    this.description = 'Interroger une feuille de calcul Framacalc/Ethercalc qui fournit un flux CSV.'
    this.editor = 'framacalc-get-csv-editor'
    this.graphIcon = 'Framacalc.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/APIComponents'
    ]
  }
}

module.exports = new FramcalcGetCsv()
