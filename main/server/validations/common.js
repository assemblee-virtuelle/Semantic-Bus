const t = require('io-ts')

/**
 * @callback ErrorMessage
 * @template {A}
 * @param {A} input
 * @param {Context} context
 * @return {string}
 */

/**
 * @param {RegExp} regexToUse
 * @param {ErrorMessage?} errorMessage
 * @return {Type<string, string, *>}
 */
function regex (regexToUse, errorMessage) {
  return new t.Type(
    'regex',
    (value) => value instanceof String,
    (input, context) =>
      t.string.validate(input, context).chain(value => {
        if (regexToUse.test(value)) {
          return t.success(value)
        } else {
          return t.failure(input, context, errorMessage ? errorMessage(input, context) : undefined)
        }
      }),
    value => value
  )
}

/**
 * @param {RegExp} regexToUse
 * @param {ErrorMessage?} errorMessage
 * @return {Type<string, string, *>}
 */
function optionalRegex (regexToUse, errorMessage) {
  return optionalString(regex(regexToUse, errorMessage))
}

/**
 * @template {A}
 * @param {Type<A, A, *>} innerType
 * @return {Type<A | undefined, A | undefined, *>}
 */
function optional (innerType) {
  return new t.Type(
    'optional',
    value => value === undefined || value === null || innerType.is(value),
    (input, context) => {
      if (input === undefined || input === null) {
        return t.success(undefined)
      } else {
        return innerType.validate(input, context)
      }
    },
    value => value
  )
}

/**
 * @param {Type<string, string, *>} innerType
 * @return {Type<string, string, *>}
 */
function optionalString (innerType) {
  return optional(new t.Type(
    'optionalString',
    value => value === undefined || value === null || typeof value === 'string',
    (input, context) => {
      if (input === undefined || input === null || input === '') {
        return t.success(undefined)
      } else {
        return innerType.validate(input, context)
      }
    },
    value => value
  ))
}

module.exports = {
  regex,
  optionalRegex,
  optional,
  optionalString
}
