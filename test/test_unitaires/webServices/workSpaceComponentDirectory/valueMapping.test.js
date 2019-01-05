const jsc = require('jsverify')
const R = require('ramda')
const valueMapping = require('../../../../webServices/workSpaceComponentDirectory/valueMapping')

/** @type {MappingValueOpts} */
const defaultMappingValueOpts = {
  ref: 'mappingTable',
  style: 'flex-grow:1;',
  drag: true,
  title: 'vos changement de valeurs',
  allowdirectedit: true,
  disallowselect: true,
  disallownavigation: true
}
const errorNoSource = { error: 'no incoming data' }

/**
 * @param {number} rowId
 * @param {string} flowValue
 * @param {string} replacementValue
 * @return {MappingValue}
 */
function buildMappingValue(rowId, flowValue, replacementValue) {
  return {
    rowId, flowValue, replacementValue,
    opts: defaultMappingValueOpts
  }
}

/**
 * @param {MappingValue} mappingValues
 * @return {SpecificData}
 */
function buildSpecificData(...mappingValues) {
  return {
    mappingTable: mappingValues
  }
}

/**
 * @param {MappingValue} mappingValues
 * @return {SpecificData}
 */
function buildSpecificDataForgetOriginalValue(...mappingValues) {
  return {
    mappingTable: mappingValues,
    forgetOriginalValue: true
  }
}

describe('valueMapping.mapValue', () => {
  jsc.property(
    'should always transform an empty string to the empty value mapping',
    jsc.nestring,
    (replacementValue) => {
      const valueIn = ''
      const specificData = buildSpecificData(buildMappingValue(0, '', replacementValue))
      const result = valueMapping.mapValue(valueIn, specificData)

      return R.equals(result, [{ sourceValue: valueIn, translatedValue: replacementValue }])
    }
  )

  jsc.property(
    'should return an empty array when the source is empty but has no empty value mapping',
    jsc.nestring, jsc.string,
    (flowValue, replacementValue) => {
      const valueIn = ''
      const specificData = buildSpecificData(buildMappingValue(0, flowValue, replacementValue))
      const result = valueMapping.mapValue(valueIn, specificData)

      return R.equals(result, [])
    }
  )

  jsc.property(
    'should return an empty array when the mappingTable is empty',
    jsc.string,
    (valueIn) => {
      const specificData = buildSpecificData()
      const result = valueMapping.mapValue(valueIn, specificData)

      return R.equals(result, [])
    }
  )

  jsc.property(
    'should return an array of one entry when the mappingTable transform the whole input',
    jsc.string, jsc.nestring,
    (valueIn, replacement) => {
      const specificData = buildSpecificData(buildMappingValue(0, valueIn, replacement))
      const result = valueMapping.mapValue(valueIn, specificData)

      return R.equals(result, [{ sourceValue: valueIn, translatedValue: replacement }])
    }
  )

  jsc.property(
    'should ignore the valueMapping when replacementValue is empty',
    jsc.string,
    (valueIn) => {
      const specificData = buildSpecificData(buildMappingValue(0, valueIn, ''))
      const result = valueMapping.mapValue(valueIn, specificData)

      return R.equals(result, [])
    }
  )

  jsc.property(
    'should use the replacementValue only as soon as the valueIn contains the flowValue',
    jsc.nestring, jsc.nestring, jsc.nestring, jsc.nestring,
    (beforeValueIn, flowValue, afterValueIn, replacementValue) => {
      const valueIn = beforeValueIn + flowValue + afterValueIn
      const specificData = buildSpecificData(buildMappingValue(0, flowValue, replacementValue))
      const result = valueMapping.mapValue(valueIn, specificData)

      return R.equals(result, [{ sourceValue: valueIn, translatedValue: replacementValue }])
    }
  )

  jsc.property(
    'should push all replacementValues that match the flowValue in all given mapping',
    jsc.nestring, jsc.nestring, jsc.nestring, jsc.nestring,
    (flowValue1, replacementValue1, flowValue2, replacementValue2) => {
      const valueIn = flowValue1 + flowValue2
      const specificData = buildSpecificData(
        buildMappingValue(0, flowValue1, replacementValue1),
        buildMappingValue(1, flowValue2, replacementValue2)
      )
      const result = valueMapping.mapValue(valueIn, specificData)

      return R.equals(result, [
        { sourceValue: valueIn, translatedValue: replacementValue1 },
        { sourceValue: valueIn, translatedValue: replacementValue2 }
      ])
    }
  )

  jsc.property(
    'should consider a number as a string',
    jsc.number, jsc.nestring,
    (valueIn, replacementValue) => {
      const specificData = buildSpecificData(buildMappingValue(0, valueIn.toString(), replacementValue))
      const result = valueMapping.mapValue(valueIn, specificData)

      return R.equals(result, [
        { sourceValue: valueIn, translatedValue: replacementValue }
      ])
    }
  )

  jsc.property(
    'should consider an object as "[object Object]"', jsc.nestring,
    (replacementValue) => {
      const valueIn = {}.toString()
      const specificData = buildSpecificData(buildMappingValue(0, '[object Object]', replacementValue))
      const result = valueMapping.mapValue(valueIn, specificData)

      return R.equals(result, [
        { sourceValue: valueIn, translatedValue: replacementValue }
      ])
    }
  )

  jsc.property(
    'should consider an object as its string representation', jsc.nearray(jsc.string), jsc.nestring,
    (valueIn, replacementValue) => {
      const specificData = buildSpecificData(buildMappingValue(0, valueIn[0], replacementValue))
      const result = valueMapping.mapValue(valueIn, specificData)

      return R.equals(result, [
        { sourceValue: valueIn, translatedValue: replacementValue }
      ])
    }
  )

  jsc.property(
    'should consider a function as its string version', jsc.nestring,
    (replacementValue) => {
      const valueIn = (function () {
      }).toString()
      const specificData = buildSpecificData(buildMappingValue(0, 'function', replacementValue))
      const result = valueMapping.mapValue(valueIn, specificData)

      // We do not test equality because of code prettify
      return R.equals(result.length, 1)
    }
  )

  jsc.property(
    'should return an array with one element having only the replacement without the source value when setting `forgetOriginalValue` to `true`',
    jsc.string, jsc.nestring,
    (valueIn, replacement) => {
      const specificData = buildSpecificDataForgetOriginalValue(buildMappingValue(0, valueIn, replacement))
      const result = valueMapping.mapValue(valueIn, specificData)

      return R.equals(result, [replacement])
    }
  )

  jsc.property(
    'should return an array with only replacements without the source value when setting `forgetOriginalValue` to `true`',
    jsc.nestring, jsc.nestring, jsc.nestring, jsc.nestring,
    (flowValue1, replacementValue1, flowValue2, replacementValue2) => {
      const valueIn = flowValue1 + flowValue2
      const specificData = buildSpecificDataForgetOriginalValue(
        buildMappingValue(0, flowValue1, replacementValue1),
        buildMappingValue(1, flowValue2, replacementValue2)
      )
      const result = valueMapping.mapValue(valueIn, specificData)

      return R.equals(result, [replacementValue1, replacementValue2])
    }
  )
});

describe('valueMapping.mapValues', () => {
  jsc.property(
    'should return an error when the source is undefined',
    jsc.nestring, jsc.nestring,
    (flowValue, replacementValue) => {
      const source = undefined
      const specificData = buildSpecificData(buildMappingValue(0, flowValue, replacementValue))
      const result = valueMapping.mapValues(source, specificData)

      return R.equals(result, { data: errorNoSource })
    }
  )

  jsc.property(
    'should return an error when the source is null',
    jsc.nestring, jsc.nestring,
    (flowValue, replacementValue) => {
      const source = null
      const specificData = buildSpecificData(buildMappingValue(0, flowValue, replacementValue))
      const result = valueMapping.mapValues(source, specificData)

      return R.equals(result, { data: errorNoSource })
    }
  )

  jsc.property(
    'should process the string source as one element',
    jsc.nestring, jsc.nestring,
    (flowValue, replacementValue) => {
      const source = flowValue
      const specificData = buildSpecificData(buildMappingValue(0, flowValue, replacementValue))
      const result = valueMapping.mapValues(source, specificData)

      return R.equals(result, { data: [{ sourceValue: flowValue, translatedValue: replacementValue }] })
    }
  )

  jsc.property(
    'should process the number source as one element',
    jsc.number, jsc.nestring,
    (flowValue, replacementValue) => {
      const source = flowValue
      const specificData = buildSpecificData(buildMappingValue(0, flowValue.toString(), replacementValue))
      const result = valueMapping.mapValues(source, specificData)

      return R.equals(result, { data: [{ sourceValue: flowValue, translatedValue: replacementValue }] })
    }
  )

  jsc.property(
    'should process the array as several elements',
    jsc.nestring, jsc.nestring, jsc.nestring, jsc.nestring,
    (flowValue1, replacementValue1, flowValue2, replacementValue2) => {
      if (flowValue1.includes(flowValue2) || flowValue2.includes(flowValue1)) return true // ignore this case

      const source = [flowValue1, flowValue2]
      const specificData = buildSpecificData(
        buildMappingValue(0, flowValue1, replacementValue1),
        buildMappingValue(0, flowValue2, replacementValue2)
      )
      const result = valueMapping.mapValues(source, specificData)

      return R.equals(result, {
        data: [
          { sourceValue: flowValue1, translatedValue: replacementValue1 },
          { sourceValue: flowValue2, translatedValue: replacementValue2 }
        ]
      })
    }
  )

  jsc.property(
    'should process the object source as one element',
    jsc.nestring,
    (replacementValue) => {
      const source = {}
      const specificData = buildSpecificData(buildMappingValue(0, '[object Object]', replacementValue))
      const result = valueMapping.mapValues(source, specificData)

      return R.equals(result, { data: [{ sourceValue: source, translatedValue: replacementValue }] })
    }
  )

  jsc.property(
    'should return an array with only replacements without the source value when setting `forgetOriginalValue` to `true`',
    jsc.nestring, jsc.nestring,
    (flowValue, replacementValue) => {
      const source = flowValue
      const specificData = buildSpecificDataForgetOriginalValue(buildMappingValue(0, flowValue, replacementValue))
      const result = valueMapping.mapValues(source, specificData)

      return R.equals(result, { data: [replacementValue] })
    }
  )
});