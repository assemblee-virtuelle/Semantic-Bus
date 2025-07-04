'use strict';

const mongoose = require('mongoose');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

const WorkspaceComponentSchema = mongoose.Schema({
  module: String,
  type: String,
  name: String,
  description: String,
  editor: String,
  graphIcon: String,
  graphPositionX: Number,
  graphPositionY: Number,
  workspaceId: String,
  persistProcess: {
    type: Boolean,
    default: false
  },
  specificData: {
    type: Object,
    default: {}
  },
  deeperFocusData: {
    type: Object,
    default: {}
  }
}, { minimize: false });


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = WorkspaceComponentSchema;
