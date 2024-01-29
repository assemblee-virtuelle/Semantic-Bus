'use strict';
class Flat {
  constructor () {}
  pull (data, flowData, pullParams) {
    return new Promise((resolve, reject) => {
      try {
        var result = []
        if (Array.isArray(flowData[0].data)){
          result = flowData[0].data.flat();
        }
        else{
          throw new Error("Data are not in an array structure.")
        }
        resolve({
          data: result
        })
      } catch (e) {
        reject (e)
      }
    })
  }
}
module.exports = new Flat()
