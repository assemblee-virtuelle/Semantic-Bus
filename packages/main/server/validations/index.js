const { failure } = require('io-ts/lib/PathReporter');

/**
 * Validate and normalize the input (body) of the request.
 * It ensures the body has the right model and does not include unnecessary attributes (they will be stripped)
 *
 * @template {A}
 * @param {Decoder<A>} type
 * @return {Function}
 */
function validateRequestInput(type) {
  return (req, res, next) => {
    type.decode(req.body)
      .map(normalizedValue => {
        req.body = normalizedValue;
        next();
      })
      .getOrElseL(error => {
        res
          .status(400)
          .send({ message: failure(error).join('\n') });
      });
  };
}

module.exports = {
  validateRequestInput
};
