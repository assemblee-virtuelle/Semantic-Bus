'use strict';

const mongoose = require('mongoose');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

const FragmentSchema = mongoose.Schema({
  data: Object,
  originFrag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fragment'
  },
  rootFrag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fragment'
  },
  branchOriginFrag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fragment'
  },
  branchFrag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fragment'
  },
  frags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fragment'
  }], garbageTag: {
    type: Boolean
  },
  garbageProcess: {
    type: Number
  }
}, { minimize: false } );
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = FragmentSchema;
