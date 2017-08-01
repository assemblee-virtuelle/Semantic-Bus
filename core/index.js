'use strict';

var user = require('./lib').user;
var inscription = require('./lib').inscription;
var authentification = require('./lib').authentification
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
    user: user,
    authentification: authentification,
    inscription: inscription
};
