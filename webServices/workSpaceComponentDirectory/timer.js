"use strict";
module.exports = {
  type: 'Timer',
  description: 'déclencher un traitement à interval régulier (min 1 min)',
  editor: 'timer-editor',
  graphIcon:'default.png',
  // workspace_component_lib : require('../../lib/core/lib/workspace_component_lib'),
  // cache_lib : require('../../lib/core/lib/cache_lib'),
  stepNode: false,
  tags:[
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleUtilitiesComponents'
  ],

  pull: function(data, flowData, undefined) {
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
