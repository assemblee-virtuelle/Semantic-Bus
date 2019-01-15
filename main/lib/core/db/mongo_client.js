'use strict';
class MongoClientSingleton {
  constructor() {
  }

  static getInstance() {
    if (this.instance == undefined) {
      this.instance = new MongoClient();
    }
    return this.instance;
  }
}

class MongoClient {
  constructor() {
    this.config2 = require('../../../configuration.js');;
    this.mongoose = require('mongoose');
    this.mongoose.Promise = Promise;
    const conStr = this.config2.mlabDB;
    const db = this.mongoose.createConnection(conStr);
    // CONNECTION EVENTS
    // When successfully connected
    db.on('connected', function() {
      console.log('Mongoose default connection open to ' + conStr);
    });

    // If the connection throws an error
    db.on('error', function(err) {
      console.log('Mongoose default connection error: ' + err);
    });

    // When the connection is disconnected
    db.on('disconnected', function() {
      //console.log('Mongoose default connection disconnected');
    });
    this._connection = db;
  }

  get connection() {
    return this._connection;
  }
}
//export default MongoClient;
module.exports = MongoClientSingleton;

//
// var config2 = require('../../../configuration.js');
// // --------------------------------------------------------------------------------
// // --------------------------------------------------------------------------------
// // --------------------------------------------------------------------------------
//
// var mongoose = require('mongoose');
// mongoose.Promise = Promise;
//
// var conStr = config2.mlabDB;
//
// //var db = mongoose.connection;
// //var db = mongoose.createConnection(conStr,{ useMongoClient: true})
// var db = mongoose.createConnection(conStr)
//
//
// // CONNECTION EVENTS
// // When successfully connected
// db.on('connected', function () {
//   console.log('Mongoose default connection open to ' + conStr);
// });
//
// // If the connection throws an error
// db.on('error',function (err) {
//   console.log('Mongoose default connection error: ' + err);
// });
//
// // When the connection is disconnected
// db.on('disconnected', function () {
//   //console.log('Mongoose default connection disconnected');
// });
//
// module.exports = db;
