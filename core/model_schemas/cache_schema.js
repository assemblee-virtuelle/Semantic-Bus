'use strict';

var mongoose = require('mongoose');

// --------------------------------------------------------------------------------

var CacheSchema = mongoose.Schema({
  frag: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now
  },
  history: [{
    date: {
      type: Date,
      default: Date.now
    },
    frag: {
      type: String,
    }
  }],
});

// --------------------------------------------------------------------------------

module.exports = CacheSchema;
