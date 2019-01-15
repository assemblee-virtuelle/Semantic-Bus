'use strict';

var user = require('./user_lib');
var authentification = require('./auth_lib');
var inscription = require('./inscription_lib');
var workspace = require('./workspace_lib')
var workspaceComponent = require('./workspace_component_lib')
var error = require('./error_lib')


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
  user: user,
  authentification: authentification,
  inscription: inscription,
  workspace: workspace,
  workspaceComponent: workspaceComponent,
  error:error
}
