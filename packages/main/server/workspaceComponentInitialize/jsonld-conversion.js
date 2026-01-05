'use strict';
class JsonLdConversion {
  constructor() {
    this.type = 'JsonLdConversion';
    this.description = 'conversion de donnée JSON-LD (frame)';
    this.editor = 'jsonld-conversion-editor';
    this.graphIcon = 'default.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/manipulation',
      'http://semantic-bus.org/data/tags/manipulationConversion'
    ];
  }
}

module.exports = new JsonLdConversion();
