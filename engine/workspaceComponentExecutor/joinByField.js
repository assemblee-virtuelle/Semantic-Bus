'use strict';
class JoinByField {
  constructor() {
    this.sift = require('sift').default;
    this.PromiseOrchestrator = require('../../core/helpers/promiseOrchestrator')
  }
  async getPrimaryFlow(data, flowData) {
    let secondaryFlowByConnection = flowData.find(f=>f.targetInput=='second');
    if (secondaryFlowByConnection){
      let primaryFlow = flowData.find(f=>f.componentId!=secondaryFlowByConnection.componentId);
      return primaryFlow;
    }else if (data.specificData.primaryComponentId){
      let primaryFlow = flowData.find(f=>f.componentId==data.specificData.primaryComponentId); 
      return primaryFlow;
    }else{
      throw new Error('Primary Flow could not be identified');
    }
  }
  join(primaryRecord, secondaryFlowData, data) {
    return new Promise(async (resolve, reject) => {
      try {
        let filter = {};
        let result = [];
        const valueToJoin = primaryRecord[data.specificData.primaryFlowFKId];
        if (!valueToJoin) {
          result = [];
        } else {
          if(Array.isArray(valueToJoin)){
            // Utilisation de PromiseOrchestrator au lieu de map
            let paramArray = valueToJoin.map(v => [secondaryFlowData, filter, v, data]);
            let promiseOrchestrator = new this.PromiseOrchestrator();
            result = await promiseOrchestrator.execute(this, this.createFilterAndGetResult, paramArray,{
              beamNb: 10
            }, this.config);
          } else {
            result = this.createFilterAndGetResult(secondaryFlowData, filter, valueToJoin, data);
          }
        }

        primaryRecord[data.specificData.primaryFlowFKName] = result;

        resolve(primaryRecord);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  // Nouvelle fonction pour créer le filtre et obtenir le résultat
  createFilterAndGetResult(secondaryFlowData, filter, valueToJoin, data) {
    filter[data.specificData.secondaryFlowId] = valueToJoin;
    // console.log('filter', filter);
    let result = secondaryFlowData.filter(this.sift(filter));
    
    if (!data.specificData.multipleJoin == true) {
      result = result[0];
    }
    
    return result;
  }
  pull(data, flowData) {

    return new Promise((resolve, reject) => {
      // console.log(data,flowData)
      try {
        // console.log("flowData", flowData);
        const secondaryFlowByConnection = flowData.find(f=>f.targetInput=='second');
        let secondaryFlowData;
        let primaryFlowData;

        if (secondaryFlowByConnection) {
          secondaryFlowData = secondaryFlowByConnection.data;
          primaryFlowData = flowData.find(f=>f.targetInput==undefined)?.data;
        }else{
          secondaryFlowData = flowData.filter(this.sift({
            componentId: data.specificData.secondaryComponentId
          }))[0].data;
          primaryFlowData = flowData.filter(this.sift({
            componentId: data.specificData.primaryComponentId
          }))[0].data;
        }

        // console.log("flows", secondaryFlowData, primaryFlowData);

        if (!Array.isArray(secondaryFlowData)) {
          // console.log('ALLO ERROR');
          resolve({
            data: {
              error: 'Secondary Flow have to be an array'
            }
          })
          // reject(new Error('Secondary Flow have to be an array'))
        } else if (primaryFlowData == undefined ) {
          resolve({
            data: {
              error: 'Primary Flow is undefined'
            }
          })
        } else if (primaryFlowData.length == 0) {
          resolve({
            data: []
          })
        } else {
          let forcedArray=false;
          if (!Array.isArray(primaryFlowData)) {
            forcedArray=true;
            primaryFlowData = [primaryFlowData];
          }
          secondaryFlowData = JSON.parse(JSON.stringify(secondaryFlowData)) // in case primary and secandary is the same source
          let paramArray = primaryFlowData.map(r => {
            return [
              r,
              secondaryFlowData,
              data
            ]
          })

          // console.log('PromiseOrchestrator',this.PromiseOrchestrator);
          let promiseOrchestrator = new this.PromiseOrchestrator()
          promiseOrchestrator.execute(this, this.join, paramArray, {
            beamNb: 10
          }, this.config).then(primaryFlowCompleted => {
            if(forcedArray==true){
              resolve({
                data: primaryFlowCompleted[0]
              })
            }else {
              resolve({
                data: primaryFlowCompleted
              })
            }

          })
        }
      } catch (e) {
        console.error(e);
        reject(e)
      }
    })
  }
}

module.exports = new JoinByField()
