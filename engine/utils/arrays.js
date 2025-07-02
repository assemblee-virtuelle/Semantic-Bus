module.exports = {
  isEmpty,
  nonEmpty,
  flatMap
};

/**
 * @template A
 * @param {Array<A> | null | undefined} array
 * @return {boolean}
 */
function isEmpty(array) {
  return array === undefined || array === null || array.length === 0;
}

/**
 * @template A
 * @param {Array<A> | null | undefined} array
 * @return {boolean}
 */
function nonEmpty(array) {
  return !isEmpty(array);
}

/**
 * @template A, B
 * @param {Array<A>} array
 * @param {function(A): Array<B>} op
 * @return {Array<B>}
 */
function flatMap(array, op) {
  if (nonEmpty(array)) {
    return array.map(op).reduce((acc, current) => [...acc, ...current], []);
  } else {
    return [];
  }
}
