'use strict';

var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


var UserSchema = mongoose.Schema({
    credentials: {
        email: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: function (v) {
                    return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
                },
                message: '{VALUE} is not a valid email'
            }
        },
        hashed_password: {
            type: String,
            required: true
        }
    },
    payment_details: {
        mangopay_details: {
            banks: [{
                bank_id: String
            }],
            cards: [{
                card_id: String,
                card_uid: String,
                crypted_number: String,
                expiration_date: String
            }],
            user_id: String,
            wallet_id: String
        }
    },
    job:{
         type: String,
    },
    society:{
         type: String,
    },
    name: {
        type: String,
        required: true
    },
    workspace: [{
        type: mongoose.Schema.Types.ObjectId,
    }],
    admin: {
        type: Boolean,
        default: false
    },
    dates: {
        created_at: Date,
        updated_at: Date
    },
    googleToken: {
        type: String,
        default: null
    },
    googleid: {
        type: String,
        default: null
    }
});


// UserSchema.virtual('pictureUrl').get(function () {
//     return settings.files.users.url + '/' + this.picture;
// });
UserSchema.plugin(uniqueValidator);
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = UserSchema;