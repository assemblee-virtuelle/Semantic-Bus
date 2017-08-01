'use strict';

var user = require('./user_lib');
var authentification = require('./auth_lib');
var inscription = require('./inscription_lib');


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
  user: user,
  authentification: authentification,
  inscription: inscription
}