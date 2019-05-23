'use strict'
class Timer {
  constructor() {
    this.stepNode = false
    this.workspaceComponentLib = require('../../core/lib/workspace_component_lib.js')
  }

  workAsk(component) {
    return new Promise((resolve, reject) => {
        let now = new Date()
        let last= component.specificData.last==undefined?now:new Date(component.specificData.last);
        let next= component.specificData.next==undefined?now:new Date(component.specificData.next);
        if(now>next){
          component.specificData.last = next;
          component.specificData.next = new Date(next.getTime()+(component.specificData.interval*60*1000));
          this.workspaceComponentLib.update(component).then(data => {
            resolve(data);
          }).catch(e => {
            console.error(e);
            reject(e);
          });
        }else{
          resolve(component);
        }
    })
  }

  pull(data, flowData, undefined) {
    // console.log('--------- cash data START --------  : ');
    return new Promise((resolve, reject) => {
      if (flowData != undefined && flowData[0].data != undefined) {
        // console.log("----- cache data stock ----")
        resolve(flowData[0])
        // this.cache_lib.create(data,flowData[0]).then(cachedData=>{
        //   resolve(cachedData);
        // });
      } else {
        reject(new Error('timer need source'))
      }
    })
  }
}
module.exports = new Timer()
