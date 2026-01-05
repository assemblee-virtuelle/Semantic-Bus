'use strict';
class BinaryExtractor {
  constructor() {
    this.type = 'Binary Extractor';
    this.description = 'Extraire les données d\'un fichier binaire';
    this.editor = 'binary-extractor-editor';
    this.graphIcon = 'default.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/manipulation',
      'http://semantic-bus.org/data/tags/manipulationConversion'
    ];
  }
}
module.exports = new BinaryExtractor();
