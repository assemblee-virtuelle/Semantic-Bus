"use strict";
module.exports = {
  type: 'Root from path',
  description: 'Extraire une valeur par son chemin.',
  editor:'value-from-path-editor',
  graphIcon:'Root_from_path.png',
  tags:[
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleQueryingComponents'
  ],
  dotProp : require('dot-prop'),

  pull: function(data,flowData) {
    return new Promise((resolve, reject) => {
      //console.log(flowData[0],data.specificData.path);
      let value=this.dotProp.get(flowData[0].data, data.specificData.path)
      resolve({data:value});
    })
  }
}
