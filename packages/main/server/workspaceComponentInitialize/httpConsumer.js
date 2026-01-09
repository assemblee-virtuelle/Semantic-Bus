'use strict';
class HttpConsumer {
  constructor() {
    this.type = 'HTTP consumer';
    this.description = 'Appeler une API HTTP; Executer une requête HTTP.';
    this.editor = 'http-consumer-editor';
    this.graphIcon = 'Post_consumer.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/integration',
      'http://semantic-bus.org/data/tags/integrationApi'
    ];
    this.order = 1;
  }
}

module.exports = new HttpConsumer();
