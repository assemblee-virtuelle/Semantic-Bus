'use strict';
class PostConsumer {
  constructor () {
    this.type = 'Post consumer'
    this.description = 'Envoyer les données en POST vers une URL externe.'
    this.editor = 'post-consumer-editor'
    this.graphIcon = 'Post_consumer.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/outComponents',
      'http://semantic-bus.org/data/tags/APIComponents'
    ]
  }
}

module.exports = new PostConsumer()
