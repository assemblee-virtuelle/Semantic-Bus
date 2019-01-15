'use strict';

var mongoose = require('mongoose');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------



var HistoriqueStartSchema = mongoose.Schema({
  processId: {
    type: String,
  },
  moPrice: {
    type: Number
  },
  componentName: {
    type: String,
  },
  componentPrice: {
    type: Number,
    default: null
  },
  componentModule: {
    type: String,
    default: "module"
  },
  moCount: {
    type: Number
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  },
  componentId: {
    type: String,
    required: true
  },
  recordCount: {
    type: Number,
    default: 0,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  recordPrice: {
    type: Number,
    required: true
  },

});
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = HistoriqueStartSchema;
