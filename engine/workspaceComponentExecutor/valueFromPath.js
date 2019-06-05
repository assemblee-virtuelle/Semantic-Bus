'use strict';
class ValueFromPath {
  constructor() {
    this.dotProp = require('dot-prop');
    this.objectSizeOf = require("object-sizeof");
  }

  progress(node, pathArray, pathObject, currentKey, counter) {
    // console.log('progress',counter,pathArray,currentKey);

    // if(counter<100){
    pathArray = JSON.parse(JSON.stringify(pathArray))
    pathObject = JSON.parse(JSON.stringify(pathObject))
    // console.log('progress', pathArray,node, pathObject);

    let index = parseInt(pathArray[0])

    if (Array.isArray(node) && isNaN(index) && pathArray.length > 0) {

      let out = []
      node.forEach(r => {
        // console.log('r before', r);
        out.push(this.progress(r, pathArray, pathObject, currentKey, ++counter))
        // console.log('r after', r);
      })
      // console.log('out',out);
      return out
    } else {
      if (pathArray.length == 0) {
        // console.log('RFP2',node,currentKey);
        let out = node;
        // console.log('ALLO1');
        if (Array.isArray(node)) {
          // console.log('ALLO1',node);
          out = [];
          node.forEach(n => {
            if (typeof n === 'object') {
              for (let pathObjectKey in pathObject) {
                n[pathObjectKey] = pathObject[pathObjectKey]
              }
            } else {
              //Do Nothing
            }
            out.push(n);
          })
          // console.log('ALLO2',out);
        } else if (typeof node === 'object') {
          out = node;
          for (let pathObjectKey in pathObject) {
            out[pathObjectKey] = pathObject[pathObjectKey]
          }
        } else {
          out = node;
        }


        return out;
      } else {
        // console.log('RFP1',node,currentKey);
        let key = pathArray.shift()
        for (let keyNode in node) {
          // console.log('copare',keyNode,key,keyNode.localeCompare(key));
          if (keyNode.localeCompare(key) != 0 && this.objectSizeOf(node[keyNode]) < 1000 && !Array.isArray(node[keyNode])) {
            // console.log('ALLO');
            // let targetKey=currentKey==undefined?keyNode:targetKey+'-'+keyNode;
            pathObject[currentKey + '-' + keyNode] = node[keyNode]
          }
        }

        if (node.hasOwnProperty(key)) {
          let out = this.progress(node[key], pathArray, pathObject, key, ++counter);
          // console.log('out',out);
          return out;
        } else {
          return undefined
        }
        // console.log('pathObject increment',pathObject);
      }
    }
    // }else{
    //   return node
    // }

  }

  resolve(source, specificData) {
    let matches = specificData.path.split('.')
    // console.log('matches',matches);
    let result = this.progress(source, matches, {}, 'root', 0)
    //let result = source;
    // console.log('result',result);
    return (result)
  }

  pull(data, flowData) {
    return new Promise((resolve, reject) => {
      // console.log(flowData[0],data.specificData.path);
      // let value=this.dotProp.get(flowData[0].data, data.specificData.path)
      try {
        let value = this.resolve(flowData[0].data, data.specificData);
        // console.log('RESOLVE',value);
        resolve({
          data: value
        })
      } catch (e) {
        console.error(e);
        // console.log('REJECT');
        reject(e);
      }

    })
  }
}

module.exports = new ValueFromPath()
