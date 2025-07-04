'use strict';

const { validate: uuidValidate } = require('uuid');
const isObject = require('isobject');

/**
 * Checks if a value is a literal (primitive value or special object type)
 * @param {*} data - The value to check
 * @returns {boolean} True if the value is a literal, false otherwise
 */
function isLiteral(data) {
  return (data === null ||
    data === undefined ||
    (typeof data) === 'function' ||
    uuidValidate(data) ||
    (data?.constructor?.name == 'Buffer') ||
    (data instanceof Date && !isNaN(data)) ||
    !isObject(data)) &&
    !Array.isArray(data);
}

/**
 * Process literal values to string if needed
 * @param {*} data - The value to process
 * @returns {*} The processed value
 */
function processLiteral(data) {
  if ((typeof data) === 'function' ||
      uuidValidate(data) ||
      (data?.constructor?.name == 'Buffer')) {
    return data.toString();
  } else {
    return data;
  }
}

/**
 * Test if all elements in an array are literals
 * @param {Array} arrayToTest - The array to test
 * @returns {boolean} True if all elements are literals
 */
function testAllLiteralArray(arrayToTest) {
  const oneNotLiteral = arrayToTest.some(i => {
    const isNotLiteral = !isLiteral(i);
    return isNotLiteral;
  });
  return !oneNotLiteral;
}

module.exports = {
  isLiteral,
  processLiteral,
  testAllLiteralArray
};
