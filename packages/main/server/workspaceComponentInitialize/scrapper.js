'use strict';
class Scrapper {
  constructor() {
    this.type = 'Web scrapper';
    this.description = 'Extraire des données d\'une page web.';
    this.editor = 'scrapper-editor';
    this.graphIcon = 'Scrapper.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/integration',
      'http://semantic-bus.org/data/tags/integrationApi'
    ];
  }
}

module.exports = new Scrapper();
