"use strict";
class Timer {
  constructor() {
    this.type= 'Timer';
    this.description= 'Déclencher un traitement à intervalle régulier par minute.';
    this.editor= 'timer-editor';
    this.graphIcon='Timer.svg';
    this.stepNode= false;
    this.tags=[
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleUtilitiesComponents'
    ];
  }

  pull(data, flowData, undefined) {
    //console.log('--------- cash data START --------  : ');
    return new Promise((resolve, reject) => {
      if (flowData!=undefined && flowData[0].data != undefined) {
        //console.log("----- cache data stock ----")
        resolve(flowData[0]);
        // this.cache_lib.create(data,flowData[0]).then(cachedData=>{
        //   resolve(cachedData);
        // });
      } else {
        reject(new Error('timer need source'))
      }
    })
  }
}
module.exports = new Timer();
