'use strict';
// //console.log(__filename);
const authentication = require('./auth_model');
const file = require('./file_model');
const user = require('./user_model');
const workspace = require('./workspace_model');
const workspaceComponent = require('./workspace_component_model');
const cache = require('./cache_model');
const error = require('./error_model');
const historiqueEnd = require('./historiqueEnd_model');
const processModel = require('./process_model');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
  file,
  authentication: authentication,
  user: user,
  workspace: workspace,
  workspaceComponent: workspaceComponent,
  cache: cache,
  error: error,
  historiqueEnd: historiqueEnd,
  process: processModel
};
