'use strict';
class HttpConsumer {
  constructor () {
    this.type = 'HTTP consumer'
    this.description = 'Appeler une API HTTP; Executer une requête HTTP.'
    this.editor = 'http-consumer-editor'
    this.graphIcon = 'Post_consumer.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/outComponents',
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/APIComponents'
    ]
  }
}

module.exports = new HttpConsumer()
