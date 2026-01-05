'use strict';

class SqlConnector {
  constructor() {
    this.type = 'SQL';
    this.description = 'Interroger une base de donnée SQL.';
    this.editor = 'sql-connecteur-editor';
    this.graphIcon = 'Sql.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/integration',
      'http://semantic-bus.org/data/tags/integrationDatabase'
    ];
  }
}

module.exports = new SqlConnector();
