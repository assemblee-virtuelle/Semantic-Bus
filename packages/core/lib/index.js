'use strict';

const user = require('./user_lib');
const authentification = require('./auth_lib');
const inscription = require('./inscription_lib');
const workspace = require('./workspace_lib');
const workspaceComponent = require('./workspace_component_lib');
const error = require('./error_lib');
// var fragment = require('./fragment_lib')
const fragment = require('./fragment_lib_scylla');


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
  user: user,
  authentification: authentification,
  inscription: inscription,
  workspace: workspace,
  workspaceComponent: workspaceComponent,
  fragment: fragment,
  error: error
};
