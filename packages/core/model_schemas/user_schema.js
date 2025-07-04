'use strict';

const mongoose = require('mongoose');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


const UserSchema = mongoose.Schema({
  credentials: {
    email: {
      type: String,
      required: true,
      unique: true
      // validate: {
      //     validator: function (v) {
      //         return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
      //     },
      //     message: '{VALUE} is not a valid email'
      // }
    },
    hashed_password: {
      type: String
    }
  },
  active: {
    type: Boolean,
    default: false
  },
  admin: {
    type: Boolean,
    default: false
  },
  job: {
    type: String
  },
  society: {
    type: String
  },
  name: {
    type: String
  },
  stripeID: {
    type: String
  },
  // workspaces: [{
  //     _id: {
  //       ref: 'workspace',
  //       type: mongoose.Schema.Types.ObjectId,
  //       alias: 'workspace'
  //     },
  //     role: String,
  // }],
  workspaces: {
    type: [{
      _id: {
        ref: 'workspace',
        type: mongoose.Schema.Types.ObjectId
      },
      role: String
    }],
    default: []
  },
  bigdataflow: {
    type: [{
      _id: {
        ref: 'bigdataflow',
        type: mongoose.Schema.Types.ObjectId
      },
      role: String
    }],
    default: []
  },
  dates: {
    created_at: Date,
    updated_at: Date
  },
  googleToken: {
    type: String,
    default: null
  },
  googleId: {
    type: String,
    default: null
  },
  credit: {
    type: Number,
    default: 100
  },
  discount: {
    type: Number,
    default: 0.20
  },
  secret_stripe: {
    type: String,
    default: null
  }
});

// UserSchema.virtual('pictureUrl').get(function () {
//     return settings.files.users.url + '/' + this.picture;
// });
// UserSchema.plugin(uniqueValidator);
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = UserSchema;
