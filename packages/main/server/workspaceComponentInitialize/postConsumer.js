'use strict';
class PostConsumer {
  constructor() {
    this.type = 'HTTP consumer';
    this.description = 'Appeler une API HTTP; Executer une requête HTTP.';
    this.editor = 'post-consumer-editor';
    this.graphIcon = 'Post_consumer.svg';
  }
}

module.exports = new PostConsumer();
