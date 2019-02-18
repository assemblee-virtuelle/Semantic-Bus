var configuration = require('../configuration')

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = function (router) {
  router.get('/frontend-configuration', function (req, res) {
    res.send({ pk_stripe: configuration.pk_stripe, privateScript: configuration.privateScript, https: configuration.https, host: configuration.amqpHost, url: configuration.socketClient })
  }) // <= configurationhttps
}
