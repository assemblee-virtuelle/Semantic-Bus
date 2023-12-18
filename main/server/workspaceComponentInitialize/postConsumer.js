'use strict';
class PostConsumer {
  constructor () {
    this.type = 'HTTP consumer'
    this.description = 'Appeler une API HTTP; Executer une requête HTTP.'
    this.editor = 'post-consumer-editor'
    this.graphIcon = 'Post_consumer.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/outComponents',
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/APIComponents'
    ]
  }
}

module.exports = new PostConsumer()
