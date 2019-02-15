'use strict';

var authentication = require('./auth_schema');
var user = require('./user_schema');
var workspace = require('./workspace_schema');
var workspaceComponent = require('./workspace_component_schema');
var transaction  = require('./transaction_schema');
var cacheSchema = require('./cache_schema');
var errorSchema = require('./error_schema');
var historiqueEndSchema = require('./historiqueEnd_schema');
var passwordUpdate = require('./password_update');
var processSchema = require('./process_schema');
var fragmentSchema = require('./fragment_schema');



// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
    authentication: authentication,
    user: user,
    passwordUpdate,
    processSchema,
    workspace: workspace,
    workspaceComponent: workspaceComponent,
    transaction: transaction,
    cache: cacheSchema,
    error: errorSchema,
    historiqueEnd: historiqueEndSchema,
    process: pocessSchema,
    fragment: fragmentSchema
}
