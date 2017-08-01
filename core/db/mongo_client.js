'use strict';

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

var mongoose = require('mongoose');

var conStr = "mongodb://alex:alexfoot31@ds054118.mlab.com:54118/semantic_bus";


mongoose.connect(conStr);

var db = mongoose.connection;

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () { 
  console.log('Mongoose default connection open to ' + conStr);
}); 

// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});

module.exports = mongoose;