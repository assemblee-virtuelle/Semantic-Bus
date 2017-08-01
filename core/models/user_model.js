'use strict';

var mongoose = require('../db/mongo_client');
var userSchema = require('../model_schemas').user;

module.exports = mongoose.model('User', userSchema);