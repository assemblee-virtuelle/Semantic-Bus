const jwt = require('jsonwebtoken');
const config = require('./models/configuration');
const moment = require('moment');
var configuration =  require('../configuration');
module.exports = function(router) { 
    router.get('/configurationhttps', function(req, res) {
        res.send(configuration.https)
    })
}