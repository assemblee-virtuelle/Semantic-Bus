var configuration = require('../configuration');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


module.exports = function (router) {

    // --------------------------------------------------------------------------------

    router.get('/configurationhttps', function (req, res) {
        res.send(configuration.https)
    }) //<= configurationhttps


    router.get('/stripePublicKey', function (req, res) {
        res.send(configuration.secret_stripe_public)
    }) //<= configurationhttps

    router.get('/configurationMessageQueue', function (req, res) {
    //  console.log(process.env.AMQPHOST);
        res.send({host: configuration.amqpHost,url:configuration.socketClient})
    }) //<= configurationhttps
}
