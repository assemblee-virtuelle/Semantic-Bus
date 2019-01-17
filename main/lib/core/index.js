'use strict';

var user = require('./lib').user;
var inscription = require('./lib').inscription;
var authentification = require('./lib').authentification;
var workspace = require('./lib').workspace;
var workspaceComponent = require('./lib').workspaceComponent;
var error = require('./lib').error;
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
    user: user,
    authentification: authentification,
    inscription: inscription,
    workspace: workspace,
    workspaceComponent: workspaceComponent,
    error : error
};
