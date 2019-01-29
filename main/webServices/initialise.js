var configuration = require('../configuration');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


module.exports = function (router) {

    router.get('/frontend-configuration', function (req, res) {
     console.log(process.env.AMQPHOST);
        res.send({privateScript: configuration.privateScript, https: configuration.https, host: configuration.amqpHost, url: configuration.socketClient})
    }) //<= configurationhttps
}

