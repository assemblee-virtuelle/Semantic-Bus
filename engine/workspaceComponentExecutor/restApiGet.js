'use strict';
class RestGetJson {
  constructor () {
    this.stepNode = false
  }
  pull (data, flowData) {
    return new Promise((resolve, reject) => {
      // console.log('flowData',flowData);
      resolve({data:flowData[0].data})
    })
  }
}

module.exports = new RestGetJson()
