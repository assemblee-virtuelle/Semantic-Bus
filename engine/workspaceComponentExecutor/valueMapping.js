'use strict'

class ValueMapping {
  constructor() {
    this.arrays = require('../utils/arrays')
    this.strings = require('../utils/strings')
  }

  /**
   * @param {*} valueIn
   * @param {SpecificData} specificData
   * @return {Array<MapValueResult>}
   */
  mapValue(valueIn, specificData) {
    let valueInString = valueIn.toString();
    if (specificData.ignoreCase == true) {
      valueInString = valueInString.toUpperCase();
    }
    if (specificData.ignoreAccent == true) {
      valueInString = this.normalize(valueInString);
    }
    return this.arrays.flatMap(specificData.mappingTable, atomicMapping => {
      let flowValue = atomicMapping.flowValue;
      if (specificData.ignoreCase == true) {
        flowValue = flowValue.toUpperCase();
      }
      if (specificData.ignoreAccent == true) {
        flowValue = this.normalize(flowValue);
      }
      // console.log(valueInString,flowValue);
      if (valueInString.includes(flowValue) && this.strings.nonEmpty(atomicMapping.replacementValue)) {
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
  mapValues(source, specificData) {
    if (source === undefined || source === null) {
      return {
        data: {
          error: 'no incoming data'
        }
      }
    } else if (Array.isArray(source)) {
      return {
        data: this.arrays.flatMap(source, valueIn => this.mapValue(valueIn, specificData))
      }
    } else {
      return {
        data: this.mapValue(source, specificData)
      }
    }
  }

  pull(data, flowData) {
    return Promise.resolve(this.mapValues(flowData[0].data, data.specificData))
  }
}

module.exports = new ValueMapping()
