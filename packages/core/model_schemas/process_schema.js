'use strict';

const mongoose = require('mongoose');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


const ProcessSchema = mongoose.Schema({

  timeStamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  workflowId: {
    type: String,
    required: true
  },
  ownerId: {
    type: String,
    required: true
  },
  callerId: {
    type: String
    // required: true
  },
  state: {
    type: String,
    default: 'run'
  },
  originComponentId: {
    type: String,
    required: true
  },
  steps: [{
    componentId: String
  }]
});
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = ProcessSchema;
