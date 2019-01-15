'use strict';
var mongoose = require('mongoose');
// var workspaceComponent = require('./workspace_component_schema')

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

var WorkspaceSchema = mongoose.Schema({
  name: String,
  description: String,
  components: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "workspaceComponent"
  }],
  dates: {
    created_at: Date
  },
  rowid:{
    type: Number,
    default: null
  },
  links: [{
    source: String,
    target: String
  }],
  users: [{
    email: String,
    role: String,
  }],
  limitHistoric:{
    type: Number,
    default: 1
  }
}, { minimize: false });


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = WorkspaceSchema;
