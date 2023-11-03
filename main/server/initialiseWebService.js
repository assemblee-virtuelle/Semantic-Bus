var configuration = require('../config.json')

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = function (router) {
  router.get('/frontend-configuration', function (req, res) {
    console.log('frontend-configuration',configuration);
    res.send({ pk_stripe: configuration.pk_stripe, privateScript: configuration.privateScript, https: configuration.https, host: configuration.amqpHost, url: configuration.socketClient })
  }) // <= configurationhttps
}
