'use strict';
class HttpConsumer {
  constructor () {
    this.type = 'HTTP consumer'
    this.description = 'Appeler une API HTTP; Executer une requête HTTP.'
    this.editor = 'http-consumer-editor'
    this.graphIcon = 'Post_consumer.svg'
    this.tags = [
    ]
  }
}

module.exports = new HttpConsumer()
