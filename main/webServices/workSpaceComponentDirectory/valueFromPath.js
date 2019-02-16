"use strict";
class ValueFromPath {
  constructor() {
    this.type = 'Root from path';
    this.description = 'Extraire une valeur par son chemin.';
    this.editor = 'value-from-path-editor';
    this.graphIcon = 'Root_from_path.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleQueryingComponents'
    ];
    this.dotProp = require('dot-prop');
  }

  progress(node, pathArray, pathObject,currentKey) {
    pathArray = JSON.parse(JSON.stringify(pathArray));
    pathObject = JSON.parse(JSON.stringify(pathObject));
    // console.log('progress', pathArray,node, pathObject);

    if (Array.isArray(node)) {
      let out=[];
      node.forEach(r => {
        console.log('r before', r);
        out.push(this.progress(r, pathArray, pathObject,currentKey));
        // console.log('r after', r);
      });
      console.log('out',out);
      return out;

    } else {
      if (pathArray.length == 0) {
        for (let pathObjectKey in pathObject) {
          node[pathObjectKey]=pathObject[pathObjectKey];
        }
        return node;
      } else {
        let key = pathArray.shift();
        for (let keyNode in node) {
           // console.log('copare',keyNode,key,keyNode.localeCompare(key));
          if (keyNode.localeCompare(key) != 0) {
            // console.log('ALLO');
            //let targetKey=currentKey==undefined?keyNode:targetKey+'-'+keyNode;
            pathObject[currentKey+'-'+keyNode] = node[keyNode];
          }
        }

        if(node.hasOwnProperty(key)){
            return this.progress(node[key], pathArray, pathObject,key);
        }else {
          return undefined;
        }
        // console.log('pathObject increment',pathObject);

      }
    }

  }

  resolve(source, specificData) {
    let matches = specificData.path.split('.');
    let result = this.progress(source, matches, {},'root');
    // console.log('result',result);
    return (result)

  }

  pull(data, flowData) {
    return new Promise((resolve, reject) => {
      //console.log(flowData[0],data.specificData.path);
      //let value=this.dotProp.get(flowData[0].data, data.specificData.path)
      let value = this.resolve(flowData[0].data, data.specificData)
      resolve({
        data: value
      });
    })
  }
}

module.exports = new ValueFromPath();
