'use strict';
class Scrapper {
  constructor() {
    this.type = 'Scrapper';
    this.description = 'Scrapper une page HTML.';
    this.editor = 'scrapper-editor';
    this.graphIcon = 'Scrapper.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/scrapperComponents'
    ];
  }
}

module.exports = new Scrapper();
