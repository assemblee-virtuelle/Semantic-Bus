'use strict';
////console.log(__filename);
const MongoClient = require('../db/mongo_client');
const processShema = require('../model_schemas/process_schema');

class ProcessModelSingleton {
  constructor() {
  }

  static getInstance(){
    if (this.instance == undefined) {
      this.instance = new ProcessModel();
    }
    return this.instance;
  }
}

class ProcessModel {
  constructor() {
    this._model = MongoClient.getInstance().connection.model('process', processShema);
  }

  get model(){
    return this._model;
  }
}

module.exports = ProcessModelSingleton;
// module.exports = mongoClient.getInstance().connection.model('process', processShema);
