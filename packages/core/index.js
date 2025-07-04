'use strict';

const user = require('./lib').user;
const inscription = require('./lib').inscription;
const authentification = require('./lib').authentification;
const workspace = require('./lib').workspace;
const workspaceComponent = require('./lib').workspaceComponent;
const fragment = require('./lib').fragment;
const error = require('./lib').error;
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
  user: user,
  authentification: authentification,
  inscription: inscription,
  workspace: workspace,
  workspaceComponent: workspaceComponent,
  error: error,
  fragment: fragment
};
