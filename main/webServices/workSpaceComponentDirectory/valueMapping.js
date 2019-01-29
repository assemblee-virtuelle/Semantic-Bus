"use strict"



class ValueMapping {
  constructor() {
    this.type= 'Value mapping';
    this.description= 'Remplacer les valeurs d\'une propriété par une autre.';
    this.editor= 'value-mapping-editor';
    this.graphIcon= 'Value_mapping.png';
    this.tags= [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleQueryingComponents'
    ];
    this.arrays = require('../../utils/arrays');
    this.strings = require('../../utils/strings');
  }

  /**
   * @param {*} valueIn
   * @param {SpecificData} specificData
   * @return {Array<MapValueResult>}
   */
  mapValue(valueIn, specificData) {
    const valueInString = valueIn.toString()
    return this.arrays.flatMap(specificData.mappingTable, atomicMapping => {
      if (valueInString.includes(atomicMapping.flowValue) && this.strings.nonEmpty(atomicMapping.replacementValue)) {
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

  /**
   * @param {*} source
   * @param {SpecificData} specificData
   * @return {MapValuesResult}
   */
  mapValues(source, specificData) {
    if (source === undefined || source === null) {
      return { data: { error: 'no incoming data' } }
    } else if (Array.isArray(source)) {
      return { data: this.arrays.flatMap(source, valueIn => this.mapValue(valueIn, specificData)) }
    } else {
      return { data: this.mapValue(source, specificData) }
    }
  }

  pull(data, flowData) {
    return Promise.resolve(this.mapValues(flowData[0].data, data.specificData))
  }
}

module.exports= new ValueMapping();
