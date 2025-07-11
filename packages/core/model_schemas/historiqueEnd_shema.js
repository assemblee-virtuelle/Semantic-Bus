'use strict';

const mongoose = require('mongoose');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

const HistoriqueEndSchema = mongoose.Schema({
  timeStamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  processId: {
    type: String
    // required: true
  },
  componentId: {
    type: String
    // required: true
  },
  componentName: {
    type: String
    // required: true
  },
  userId: {
    type: String
    // required: true
  },
  componentModule: {
    type: String
    // required: true
  },
  persistProcess: {
    type: Boolean
  },
  frag: {
    type: String
  },
  error: {
    type: Object
    // required: true
  },
  dfob: {
    type: Object
    // required: true
  },
  moPrice: {
    type: Number
  },
  componentPrice: {
    type: Number
  },
  moCount: {
    type: Number
  },
  startTime: {
    type: Date
  },
  recordCount: {
    type: Number,
    default: 0
    // required: true
  },
  totalPrice: {
    type: Number
    // required: true
  },
  recordPrice: {
    type: Number
    // required: true
  },
  roundDate: {
    type: String
    // required: true
  },
  workflowId: {
    type: String
    // required: true
  }
});

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = HistoriqueEndSchema;
