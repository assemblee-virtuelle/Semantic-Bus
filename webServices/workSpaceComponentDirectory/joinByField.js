"use strict";
module.exports = {
  type: 'Join By Field',
  description: 'completer un flux par un second en se basant sur un champ du 1er et un identifiant du 2nd',
  editor: 'join-by-field-editor',
  graphIcon: 'joinByField.png',
  PromiseOrchestrator : require("../../lib/core/helpers/promiseOrchestrator.js"),
  tags: [
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleComponentsAgregation'
  ],

  sift: require('sift'),

  getPrimaryFlow: function(data, flowData) {
    //console.log('joinByField | getPrimaryFlow');

    // console.log(JSON.stringify(flowData));
    // console.log(flowData.map(f=>f.componentId));
    // console.log(data.specificData.primaryComponentId);
    var primaryFlow = this.sift({
      componentId: data.specificData.primaryComponentId
    }, flowData);
    //console.log("---------PRIMARY FLOW--------", primaryFlow)
    return primaryFlow;
  },
  join:function(primaryRecord,secondaryFlowData, data){
    //console.log('join1');
    //console.log(primaryRecord);
    //console.log(data.specificData.primaryFlowFKId);
    return new Promise((resolve,reject)=>{
      //console.log('join2');
      try{
        //console.log('join3',data);
        //console.log('join',data.specificData.secondaryFlowId,data.specificData.primaryFlowFKId);
        let filter = {};
        filter[data.specificData.secondaryFlowId] = primaryRecord[data.specificData.primaryFlowFKId];
        //console.log(filter, secondaryFlowData.length);

        primaryRecord[data.specificData.primaryFlowFKName] = this.sift(filter, secondaryFlowData)[0];

        resolve(primaryRecord);
      }catch(e){
        //console.log(e);
        reject(e);
      }
    })

  },
  pull: function(data, flowData) {
    //console.log('Join by Field');
    //console.log('Join by Field | pull : ', data, ' | ', flowData);
    return new Promise((resolve, reject) => {
      try {
        //console.log("flowData",data.specificData.secondaryComponentId,flowData);
        var secondaryFlowData = this.sift({
          componentId: data.specificData.secondaryComponentId
        }, flowData)[0].data;
        var primaryFlowData = this.sift({
          componentId: data.specificData.primaryComponentId
        }, flowData)[0].data;
        if (!Array.isArray(secondaryFlowData)) {
          reject(new Error('secondary Flow have to be an array'));
        } else {
          var secondaryFlowData = JSON.parse(JSON.stringify(secondaryFlowData)) //in case primary and secandary is the same source
          let paramArray=primaryFlowData.map(r=>{return [
            r,
            secondaryFlowData,
            data
          ]})
          let promiseOrchestrator = new this.PromiseOrchestrator();
          promiseOrchestrator.execute(this, this.join, paramArray, {
            beamNb: 10
          },this.config).then(primaryFlowCompleted=>{
            resolve({
              data: primaryFlowCompleted
            });
          });
        }

        // var resultData = primaryFlowData.map(function(primaryRecord) {
        //   //console.log(primaryRecord);
        //   //console.log(data.specificData.primaryFlowFKId);
        //   let filter = {};
        //   filter[data.specificData.secondaryFlowId] = primaryRecord[data.specificData.primaryFlowFKId];
        //   //console.log(filter, secondaryFlowData);
        //   if (Array.isArray(secondaryFlowData) == true) {
        //     primaryRecord[data.specificData.primaryFlowFKName] = this.sift(filter, secondaryFlowData)[0];
        //   } else {
        //     reject(new Error('secondary Flow have to be an array'));
        //   }
        //   return primaryRecord;
        // }.bind(this));
        //console.log(resultData);
      } catch (e) {
        reject(e);
      }

      // resolve({
      //   data: resultData
      // });
    })
  }
}
