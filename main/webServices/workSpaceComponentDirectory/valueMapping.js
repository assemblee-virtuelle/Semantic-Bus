'use strict'

const arrays = require('../../utils/arrays')
const strings = require('../../utils/strings')

module.exports = {
  type: 'Value mapping',
  description: 'Remplacer les valeurs d\'une propriété par une autre.',
  editor: 'value-mapping-editor',
  graphIcon: 'Value_mapping.png',
  tags: [
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleQueryingComponents'
  ],

  /**
   * @param {*} valueIn
   * @param {SpecificData} specificData
   * @return {Array<MapValueResult>}
   */
  mapValue: function (valueIn, specificData) {
    const valueInString = valueIn.toString()
    return arrays.flatMap(specificData.mappingTable, atomicMapping => {
      if (valueInString.includes(atomicMapping.flowValue) && strings.nonEmpty(atomicMapping.replacementValue)) {
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
  },

  /**
   * @param {*} source
   * @param {SpecificData} specificData
   * @return {MapValuesResult}
   */
  mapValues: function (source, specificData) {
    if (source === undefined || source === null) {
      return { data: { error: 'no incoming data' } }
    } else if (Array.isArray(source)) {
      return { data: arrays.flatMap(source, valueIn => this.mapValue(valueIn, specificData)) }
    } else {
      return { data: this.mapValue(source, specificData) }
    }
  },

  pull: function (data, flowData) {
    return Promise.resolve(this.mapValues(flowData[0].data, data.specificData))
  }
}
