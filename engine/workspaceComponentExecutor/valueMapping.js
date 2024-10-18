'use strict'

class ValueMapping {
  constructor() {
    this.arrays = require('../utils/arrays')
    this.strings = require('../utils/strings')
  }

  async getPrimaryFlow(data, flowData) {
    let secondaryFlowByConnection = flowData.find(f=>f.targetInput=='second');
    if (secondaryFlowByConnection){
      let primaryFlow = flowData.find(f=>f.componentId!=secondaryFlowByConnection.componentId);
      return primaryFlow;
    }else{
      return flowData[0];
    }
  }

  /**
   * @param {*} valueIn
   * @param {SpecificData} specificData
   * @return {Array<MapValueResult>}
   */
  mapValue(valueIn, specificData,secondaryFlow) {
    try {
      let valueInString = valueIn.toString();
      if (specificData.ignoreCase == true) {
        valueInString = valueInString.toUpperCase();
      }
      if (specificData.ignoreAccent == true) {
        valueInString = this.normalize(valueInString);
      }
      let mappingTable;
      if(secondaryFlow){
        mappingTable = secondaryFlow.map(sf=>({
          flowValue : sf.in,
          replacementValue: sf.out
        }))
      }else{
        mappingTable=specificData.mappingTable;
      }
      // console.log(mappingTable)
      return this.arrays.flatMap(mappingTable, atomicMapping => {
        let flowValue = atomicMapping.flowValue;
        if (specificData.ignoreCase == true) {
          flowValue = flowValue.toUpperCase();
        }
        if (specificData.ignoreAccent == true) {
          flowValue = this.normalize(flowValue);
        }
        let compareOk = false;
        if(specificData.wholeWord==true){
          compareOk = valueInString.localeCompare(flowValue)==0;
        } else {
          compareOk = valueInString.includes(flowValue);
        }

        if (compareOk && this.strings.nonEmpty(atomicMapping.replacementValue)) {
          if (specificData.forgetOriginalValue) {
            return [atomicMapping.replacementValue]
          } else {
            return [{
              sourceValue: valueIn,
              translatedValue: atomicMapping.replacementValue
            }]
          }
        } else {
          return []
        }
      })
    } catch (e) {
      console.error(e);
      throw e;
    }

  }

  normalize(value) {
    // return value
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
  }

  /**
   * @param {*} source
   * @param {SpecificData} specificData
   * @return {MapValuesResult}
   */
  mapValues(source, specificData,secondaryFlow) {

    if (source === undefined || source === null) {
      return {
        data: {
          error: 'no incoming data'
        }
      }
    } else if (Array.isArray(source)) {
      return {
        data: this.arrays.flatMap(source, valueIn => this.mapValue(valueIn, specificData,secondaryFlow))
      }
    } else {

      let result = this.mapValue(source, specificData,secondaryFlow);
      if(result.length===1){
        result=result[0];
      }
      // console.log('result',result);
      return {
        data: result
      }
    }
  }

  pull(data, flowData) {
    const primaryFlow = flowData.find(f=>f.targetInput==undefined)?.data;
    const secondaryFlow = flowData.find(f=>f.targetInput=='second')?.data;
    return Promise.resolve(this.mapValues(primaryFlow, data.specificData,secondaryFlow))
  }
}

module.exports = new ValueMapping()
