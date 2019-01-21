'use strict';
////console.log(__filename);
const MongoClient = require('../db/mongo_client');
const historiqueEndShema = require('../model_schemas/historiqueEnd_shema');

class HistoricEndModelSingleton {
  constructor() {
  }

  static getInstance(){
    if (this.instance == undefined) {
      this.instance = new HistoricEndModel();
    }
    return this.instance;
  }
}

class HistoricEndModel {
  constructor() {
    this._model = MongoClient.getInstance().connection.model('historiqueEnd', historiqueEndShema);
  }

  get model(){
    return this._model;
  }
}

module.exports = HistoricEndModelSingleton;

//module.exports = mongoClient.getInstance().connection.model('historiqueEnd', historiqueEndShema);
