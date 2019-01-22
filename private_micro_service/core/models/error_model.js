'use strict';
////console.log(__filename);
const MongoClient = require('../db/mongo_client');
const errorSchema = require('../model_schemas/error_schema');

class ErrorModelSingleton {
  constructor() {
  }

  static getInstance(){
    if (this.instance == undefined) {
      this.instance = new ErrorModel();
    }
    return this.instance;
  }
}

class ErrorModel {
  constructor() {
    this._model = MongoClient.getInstance().connection.model('error', errorSchema);
  }

  get model(){
    return this._model;
  }
}

module.exports = ErrorModelSingleton;
//module.exports = mongoClient.getInstance().connection.model('error', errorSchema);
