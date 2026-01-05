'use strict';
class MongoConnector {
  constructor() {
    this.type = 'Mongo';
    this.description = 'Interroger une base de donnée Mongo.';
    this.editor = 'mongo-connecteur-editor';
    this.graphIcon = 'Mongo.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/integration',
      'http://semantic-bus.org/data/tags/integrationDatabase'
    ];
  }
}

module.exports = new MongoConnector();
