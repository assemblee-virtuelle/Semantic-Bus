'use strict'

class SqlConnector {
  constructor () {
    this.type = 'SQL'
    this.description = 'Interroger une base de donnée SQL.'
    this.editor = 'sql-connecteur-editor'
    this.graphIcon = 'Sql.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/BDDComponents'
    ]
  }
}

module.exports = new SqlConnector()
