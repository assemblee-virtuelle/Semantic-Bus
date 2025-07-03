'use strict';

class MongoClientSingleton {
  constructor() {}

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
    this.mongoose = require('mongoose');
    this.mongoose.Promise = Promise;

    const conStr = this.config.mlabDB;
    console.log('🔗 MongoDB:', conStr);

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      minPoolSize: 5, // Nombre minimum de connexions dans le pool
      maxPoolSize: 10 // Nombre maximum de connexions dans le pool
    };
    if (conStr.includes('tls') || conStr.includes('ssl')) {
      options.ssl = true;
    }

    // console.log('------------------ CREATE CONNECTION --------------');
    const db = this.mongoose.createConnection(conStr, options);

    db.on('connected', () => {
      console.log('✅ Mongoose connected');
    });

    db.on('error', (err) => {
      console.log('❌ Mongoose default connection error: ' + err);
    });

    db.on('disconnected', () => {
      console.log('⚠️  Mongoose default connection disconnected');
    });

    this._connection = db;
  }

  get connection() {
    return this._connection;
  }
}

module.exports = MongoClientSingleton;
