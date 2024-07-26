'use strict';
const MongoClient = require('../db/mongo_client');
const FragmentSchema = require('../model_schemas/fragment_schema');
// const config = require('../../config.json');
const mongoose = require('mongoose');
const config = require('../getConfiguration.js')();

class FragmentModelSingleton {
  constructor() {
  }

  static getInstance(){
    if (this.instance == undefined) {
      this.instance = new FragmentModel();
    }
    return this.instance;
  }
}

class FragmentModel {
  constructor() {
    console.log('config',config);

    this._connection = mongoose.createConnection(config.mongodbFlowDB, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      minPoolSize: 5, // Nombre minimum de connexions dans le pool
      maxPoolSize: 10, // Nombre maximum de connexions dans le pool
    });

    this._model = this._connection.model('fragment', FragmentSchema);

    this._connection.on('connected', function () {
      console.log('Mongoose default connection open to ' + config.mongodbFlowDB);
    });

    this._connection.on('error', function (err) {
      console.log('Mongoose default connection error: ' + err);
    });

    this._connection.on('disconnected', function () {
      console.log('Mongoose default connection disconnected');
    });

  }

  get model(){
    return this._model;
  }
}

module.exports = FragmentModelSingleton;
