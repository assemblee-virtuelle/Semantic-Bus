'use strict'

class GoogleGetJson {
  constructor () {
    this.type = 'Google Sheets'
    this.description = 'Interroger une feuille de calcule Google Sheets qui fournit un flux JSON.'
    this.editor = 'google-get-json-editor'
    this.graphIcon = 'Google_sheets.svg'
  }
}
module.exports = new GoogleGetJson()
