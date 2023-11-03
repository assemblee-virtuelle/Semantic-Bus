const fragment_lib = require('../../core/lib/fragment_lib');

'use strict';
class SimpleAgregator {
  constructor () {
  }
  async getPrimaryFlow(data, dataFlow) {

    // console.log('____________dataFlow',dataFlow[0].data);

    const newRooFrag = await fragment_lib.createRootArrayFragFromFrags(dataFlow.map(df=>df.fragment))
    return {
        fragment:newRooFrag._id
      }
  }
  async getSecondaryFlow(data, flowData) {
    return []
  }
  pull (data, flowData) {
    return new Promise((resolve, reject) => {
      console.log('___',flowData)
      var resultFlow = []
      for (let flow of flowData) {
        for(let oririnData of flow.data){
          if (!Array.isArray(oririnData)) {
            resultFlow.push(oririnData)
          } else {
            for (let record of oririnData) {
              resultFlow.push(record)
            }
          }
        }

      }
      resolve({
        data: resultFlow
      })
    })
  }
}
module.exports = new SimpleAgregator()
