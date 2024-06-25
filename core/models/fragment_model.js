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
    this._connection = mongoose.createConnection(config.mongodbFlowDB, { useNewUrlParser: true, useUnifiedTopology: true });
    this._model = this._connection.model('fragment', FragmentSchema);
  }

  get model(){
    return this._model;
  }
}

module.exports = FragmentModelSingleton;
