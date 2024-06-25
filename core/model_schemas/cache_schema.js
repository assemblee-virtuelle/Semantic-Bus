'use strict';

var mongoose = require('mongoose');

// --------------------------------------------------------------------------------

var CacheSchema = mongoose.Schema({
  frag: {
    type: String,
    ref: "fragment"
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
      ref: "fragment"
    }
  }],
});

// --------------------------------------------------------------------------------

module.exports = CacheSchema;
