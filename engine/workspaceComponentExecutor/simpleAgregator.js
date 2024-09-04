const fragment_lib = require('../../core/lib/fragment_lib_scylla');

'use strict';
class SimpleAgregator {
  constructor () {
  }
  async getPrimaryFlow(data, dataFlow) {
    // Tri des dataFlow par la propriété _id
    dataFlow.sort((a, b) => a.fragment.componentId - b.fragment.componentId);

    const newRooFrag = await fragment_lib.createRootArrayFragFromFrags(dataFlow.map(df => df.fragment))
    
    // console.log('____________newRooFrag',newRooFrag)
    
    return {
        fragment:newRooFrag.id
      }
  }
  async getSecondaryFlow(data, flowData) {
    return []
  }
  pull (data, flowData) {
    return new Promise((resolve, reject) => {
      // console.log('___',flowData)
      var resultFlow = []
      for (let flow of flowData) {
        if(Array.isArray(flow.data)){
          for(let originData of flow.data){
            // if (Array.isArray(originData)) {
            //   for (let record of originData) {
            //     resultFlow.push(record)
            //   }
            // } else {
              resultFlow.push(originData)
            // }
          }
        } else{
          resultFlow.push(flow.data)
        }
      }
      resultFlow=resultFlow.flat();
      resolve({
        data: resultFlow
      })
    })
  }
}
module.exports = new SimpleAgregator()
