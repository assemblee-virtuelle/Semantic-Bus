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
    this.config = require('../getConfiguration.js')();
    // console.log(this.config)
    this.mongoose = require('mongoose');
    this.mongoose.Promise = Promise;
    const conStr = this.config.mlabDB;
    // console.log()
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
