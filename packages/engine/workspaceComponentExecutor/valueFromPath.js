'use strict';
class ValueFromPath {
  constructor() {
    this.dotProp = require('dot-prop');
    this.objectSizeOf = require("object-sizeof");
  }

  progress(node, pathArray, pathObject, currentKey, counter) {
    // console.log('___progress',  pathArray, currentKey)

    if (node===undefined){
      return undefined;
    }

    // console.log('progress',counter,pathArray,currentKey);

    // if(counter<100){
    // pathArray = JSON.parse(JSON.stringify(pathArray))
    pathArray= [...pathArray];
    // pathObject = JSON.parse(JSON.stringify(pathObject))
    pathObject = {...pathObject};

    // console.log('progress', pathArray,node, pathObject);

    let index = parseInt(pathArray[0])

    if (Array.isArray(node) && isNaN(index) && pathArray.length > 0) {

      let out = []
      node.forEach((r,i) => {
        // console.log(`${i}/${node.length}`);
        // console.log('r before', r);
        out.push(this.progress(r, pathArray, pathObject, currentKey, ++counter))
        // console.log('r after', r);
      })
      // console.log('out',out);
      // console.log('__POGRESS return', out.length);
      // console.log('__POGRESS return', JSON.stringify(out));
      return out
    } else {

      if (pathArray.length == 0) {
        // console.log('__progress 2',node,currentKey);
        // console.log('RFP end',node,currentKey,pathObject);
        let out = node;
        if (Array.isArray(node)) {
          out = [];
          node.forEach((n,i) => {
            // if (i%100==0){
            //   console.log(`${i}/${node.length}`);
            // }

            if (typeof n === 'object') {
              for (let pathObjectKey in pathObject) {
                n[pathObjectKey] = pathObject[pathObjectKey]
              }
            } else {
              //Do Nothing
            }
            out.push(n);
          })
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
        // console.log('__progress 1',node,currentKey);
        // console.log('RFP1',node,currentKey);
        let key = pathArray.shift()
        for (let keyNode in node) {
          // console.log('copare',keyNode,key,keyNode.localeCompare(key));
          if (keyNode.localeCompare(key) != 0 && this.objectSizeOf(node[keyNode]) < 100000) {
            // let targetKey=currentKey==undefined?keyNode:targetKey+'-'+keyNode;
            pathObject[currentKey + '-' + keyNode] = node[keyNode]
          }
        }

        if (node.hasOwnProperty(key)) {
          let out = this.progress(node[key], pathArray, pathObject, key, ++counter);
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
    // console.log('___resolve', source[0][0].organization)
    let matches = specificData.path.split('.');
    // console.log('__resolve', JSON.stringify(source), JSON.stringify(matches))
    let result = this.progress(source, matches, {}, 'root', 0);
    // console.log('__RESOLVE', JSON.stringify(result));
    // console.log('___result', result[0][0])
    return (result)
  }

  pull(data, flowData) {
    return new Promise((resolve, reject) => {
      // console.log('VALUE FROM PATH START');
      // let value=this.dotProp.get(flowData[0].data, data.specificData.path)
      try {
        let value = this.resolve(flowData[0].data, data.specificData);
        // console.log('RESOLVE',JSON.stringify(value));
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
