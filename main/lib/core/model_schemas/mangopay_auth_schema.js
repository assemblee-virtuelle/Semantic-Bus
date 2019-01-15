var mongoose = require('../db/mongo_client');

var Schema = mongoose.Schema;

var MangoPayAuthSchema = new Schema({
  expires_in: Number,
  token: String,
  token_type: String,
  dates: {
    created_at: {
      type: Date,
      default: Date.now
    },
    expires_at: {
      type: Date
    }
  }
});

MangoPayAuthSchema.pre('save', function (next) {
  now = new Date();
  this.dates.created_at = now;
  this.dates.expires_at = now.setSeconds(now.getSeconds() + this.expires_in);
  next();
});

module.exports = MangoPayAuthSchema;