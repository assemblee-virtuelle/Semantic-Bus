'use strict';
const mongoose = require('mongoose');
// var workspaceComponent = require('./workspace_component_schema')

// --------------------------------------------------------------------------------
const BigdataflowSchema = mongoose.Schema({
  name: String,
  description: String,
  componentIn: {
    module: String,
    type: String,
    description: String,
    editor: String,
    icon: String,
    specificData: {
      type: Object,
      default: {}
    }
  },
  componentOut: {
    module: String,
    type: String,
    description: String,
    editor: String,
    icon: String,
    specificData: {
      type: Object,
      default: {}
    }
  },
  workflowUr: String,
  dates: {
    created_at: Date
  },
  rowid: {
    type: Number,
    default: null
  },
  users: [{
    email: String,
    role: String
  }]
}, { timestamps: true }, { minimize: false });

// --------------------------------------------------------------------------------

module.exports = BigdataflowSchema;
