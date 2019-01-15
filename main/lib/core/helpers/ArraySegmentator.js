"use strict";
class ArraySegmentator {
  constructor() {}

  segment(arrayIn,segmentLength) {
    let out=[];
    //console.log('semgment min',Math.ceil(arrayIn.length/segmentLength));
    for(let i=0;i<Math.ceil(arrayIn.length/segmentLength); i++){
      //console.log(i*segmentLength,segmentLength);
      out.push(arrayIn.slice(i*segmentLength,(i+1)*segmentLength));
    }
    //console.log('segmentOUT',out)
    return out;

  }

}

module.exports = ArraySegmentator;
