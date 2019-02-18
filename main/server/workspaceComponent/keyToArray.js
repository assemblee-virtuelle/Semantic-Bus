"use strict";
class KeyToArray{
  constructor(){
    this.type= 'KeyToArray';
    this.description= 'Transformer les clefs d\'un objet en tableau';
    this.editor= 'key-to-array-editor';
    this.graphIcon= 'default.svg';
    this.tags= [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleQueryingComponents'
    ];
  }


  transform(source,specificData,pullParams) {
    let out=[];
    for(let firstKey in source){
      let item={key:firstKey};
      for (let secondKey in source[firstKey]){
        item[secondKey]=source[firstKey][secondKey];
      }
      out.push(item)
    }
    return out;
  }

  pull(data, flowData,pullParams) {
    return new Promise((resolve, reject) => {
      try {
        if (flowData != undefined) {
          resolve({
            data: this.transform(flowData[0].data, data.specificData,pullParams)
          });
        } else {
          resolve({
            data: {}
          });
        }
      } catch (e) {
        reject(e);
      } finally {

      }

    })
  }
}
module.exports= new KeyToArray();
