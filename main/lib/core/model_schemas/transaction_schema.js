'use strict';

var mongoose = require('mongoose');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

var TransactionSchema = mongoose.Schema({
  amount_details: {
    amount: Number,
    currency: {
      type: String,
      enumerable: ['EUR'],
      default: 'EUR'
    }
  },
  errors_history: [{
    code: String,
    message: String,
    payin: String,
    payout: String,
    preauthorization: String,
    refund: String,
    dates: {
      created_at: Date
    }
  }],
  fees_details: {
    fees: {
      amount: Number,
      currency: {
        type: String,
        enumerable: ['EUR'],
        default: 'EUR'
      }
    },
    vat: {
      amount: Number,
      currency: {
        type: String,
        enumerable: ['EUR'],
        default: 'EUR'
      }
    },
    vat_rate: {
      type: Number,
      required: true
    }
  },
  order: {
    type: mongoose.Schema.Types.ObjectId
  },
  payin: {
    type: String
  },
  payout: {
    type: String
  },
  preauthorization: {
    type: String
  },
  refund: {
    type: String
  },
  user_details: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      first: String,
      last: String
    }
  },
  status: {
    type: Number,
    required: true,
    default: 1
  },
  dates: {
    created_at: Date,
    updated_at: Date
  }
});

module.exports = TransactionSchema;