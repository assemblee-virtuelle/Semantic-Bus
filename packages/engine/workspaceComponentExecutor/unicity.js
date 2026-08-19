'use strict';

// Deep equality helper preserving the semantics of the sift library's default
// comparator (used before to match unicity keys by value).
function deepEquals(a, b) {
  if (a == null && a == b) {
    return true;
  }
  if (a === b) {
    return true;
  }
  if (Object.prototype.toString.call(a) !== Object.prototype.toString.call(b)) {
    return false;
  }
  if (Array.isArray(a)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEquals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  if (typeof a === 'object') {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    for (const key of aKeys) {
      if (!deepEquals(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  return false;
}

class UnicityExecutor {
  constructor (flowData, specificData) {
    this.flowData = flowData;
    this.specificData = specificData;
    this.increment = 0;
    this.incrementResolved = 0;
    this.globalOut = [];
  }

  execute () {
    return new Promise((resolve, reject) => {
      this.initialPromiseResolve = resolve;
      this.initialPromiseReject = reject;
      this.incrementExecute();
    });
  }
  incrementExecute () {
    // console.log('incrementExecuteUnicity',this.increment);
    if (this.increment >= this.flowData.length) {
      this.initialPromiseResolve(this.globalOut);
    } else {
      this.processRecord().then(() => {
        this.increment++;
        this.incrementExecute();
      });
    }
  }
  processRecord () {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const record = this.flowData[this.increment];
        const filter = {
          key: {}
        };

        if ((typeof record === 'string' || record instanceof String)&&(this.specificData.unicityFields==undefined || this.specificData.unicityFields.length==0)){
          const everExistingData= this.globalOut.find(o => o===record);
          if(!everExistingData){
            this.globalOut.push(record);
          }
        }else{
          const sourcedData = {};
          for (const key in record) {
            // console.log(key, this.specificData.source);
            // if (key == this.specificData.source) {
            //   source = record[key]
            // }
            let keysInUnicity = [];
            if (this.specificData.unicityFields != undefined) {
              keysInUnicity = this.specificData.unicityFields.filter(f => f.field === key);
            }
            // console.log('keysInUnicity',key,keysInUnicity);
            if (keysInUnicity.length > 0) {
              filter.key[key] = record[key];
            } else {
              sourcedData[key] = [{
                // source: source,
                // TODO remove value key and add direct record[key] in array
                value: record[key]
              }];
            }
            // }
          }
          // console.log('filter',source,filter);
  
          if (Object.keys(filter.key).length !== 0) {
            // Match existing entries whose key contains all the unicity fields (sift-like nested query)
            const everExistingData = this.globalOut.filter(o => {
              if (o.key == null) {
                return false;
              }
              return Object.entries(filter.key).every(([fieldName, fieldValue]) => deepEquals(o.key[fieldName], fieldValue));
            });
            if (everExistingData.length > 0) {
              // console.log('everExistingData', this.globalOut.indexOf(everExistingData[0]), filter);
              for (const key in sourcedData) {
  
                if (everExistingData[0].data[key] == undefined) {
                  // console.log('new key in data', recordKey, key);
                  everExistingData[0].data[key] = [];
                }
                everExistingData[0].data[key].push(sourcedData[key][0]);
                //console.log('ALLO2');
              }
            } else {
              this.globalOut.push({
                key: filter.key,
                data: sourcedData
              });
            }
          } else {
            this.globalOut.push({
              key: undefined,
              data: sourcedData
            });
          }
        }
       
        resolve();
      }, 1);
    });
  }
}

class Unicity {
  constructor () {
    // this.type = 'Unicity'
    // this.description = 'Structurer les données en vérifiant l\'unicité par champ et répartir les valeurs par source.'
    // this.editor = 'unicity-editor'
    // this.graphIcon = 'Unicity.svg'
    // this.transform = require('jsonpath-object-transform')
    // this.dotProp = require('dot-prop')
    // this.tags = [
    //   'http://semantic-bus.org/data/tags/middleComponents',
    //   'http://semantic-bus.org/data/tags/middleComponentsAgregation'
    // ]
  }

  pull (data, flowData) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(flowData[0].data)) {
        reject(new Error('input flow have to be an array'));
      } else {
        const unicityExecutor = new UnicityExecutor(flowData[0].data, data.specificData);
        unicityExecutor.execute().then((result) => {
          resolve({ data: result });
        });
      }
    });
  }
}
module.exports = new Unicity();
