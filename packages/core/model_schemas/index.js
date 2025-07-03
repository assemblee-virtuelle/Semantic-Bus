'use strict';

const authentication = require('./auth_schema');
const user = require('./user_schema');
const workspace = require('./workspace_schema');
const workspaceComponent = require('./workspace_component_schema');
const transaction = require('./transaction_schema');
const cacheSchema = require('./cache_schema');
const errorSchema = require('./error_schema');
const historiqueEndSchema = require('./historiqueEnd_schema');
const passwordUpdate = require('./password_update');
const processSchema = require('./process_schema');
const fragmentSchema = require('./fragment_schema');
const fileSchema = require('./file_schema');


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
  process: processSchema,
  fragment: fragmentSchema,
  file: fileSchema
};
