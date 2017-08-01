'use strict';

var mongoose = require('../db/mongo_client');
var AuthenticationSchema = require('../model_schemas').authentication;

module.exports = mongoose.model('Authentication', AuthenticationSchema);