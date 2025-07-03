'use strict';
const mongoose = require('mongoose');
// var workspaceComponent = require('./workspace_component_schema')

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
const WorkspaceSchema = mongoose.Schema({
  name: String,
  description: String,
  components: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'workspaceComponent'
  }],
  dates: {
    created_at: Date
  },
  rowid: {
    type: Number,
    default: null
  },
  links: [{
    source: String,
    target: String,
    targetInput: String
  }],
  users: [{
    email: String,
    role: String
  }],
  limitHistoric: {
    type: Number,
    default: 1
  },
  engineVersion: String,
  status: String
}, { timestamps: true }, { minimize: false });


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = WorkspaceSchema;
