module.exports = {
  isEmpty,
  nonEmpty
}

/**
 * @param {string | null | undefined} string
 * @return {boolean}
 */
function isEmpty (string) {
  return string === undefined || string === null || string === ''
}

/**
 * @param {string | null | undefined} string
 * @return {boolean}
 */
function nonEmpty (string) {
  return !isEmpty(string)
}
