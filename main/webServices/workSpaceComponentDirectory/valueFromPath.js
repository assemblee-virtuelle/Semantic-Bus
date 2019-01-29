"use strict";
class ValueFromPath {
  constructor() {
    this.type= 'Root from path';
    this.description= 'Extraire une valeur par son chemin.';
    this.editor='value-from-path-editor';
    this.graphIcon='Root_from_path.png';
    this.tags=[
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleQueryingComponents'
    ];
    this.dotProp = require('dot-prop');
  }

  pull(data,flowData) {
    return new Promise((resolve, reject) => {
      //console.log(flowData[0],data.specificData.path);
      let value=this.dotProp.get(flowData[0].data, data.specificData.path)
      resolve({data:value});
    })
  }
}

module.exports= new ValueFromPath();
