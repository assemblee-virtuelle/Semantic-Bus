'use strict';
class ObjectTransformer {
  constructor() {
    this.type = 'Transform';
    this.description = 'Transformer un objet par mapping grâce à un objet transformation.';
    this.editor = 'object-transformer';
    this.graphIcon = 'Transform.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleQueryingComponents'
    ];
  }
}
module.exports = new ObjectTransformer();
