'use strict'

class GoogleGetJson {
  constructor () {
    this.type = 'Google Sheets'
    this.description = 'Interroger une feuille de calcule Google Sheets qui fournit un flux JSON.'
    this.editor = 'google-get-json-editor'
    this.graphIcon = 'Google_Sheets.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/APIComponents'
    ]
  }
}
module.exports = new GoogleGetJson()
