'use strict';
////console.log(__filename);
const MongoClient = require('../db/mongo_client');
const CacheSchema = require('../model_schemas/cache_schema');

class CacheModelSingleton {
  constructor() {
  }

  static getInstance(){
    if (this.instance == undefined) {
      this.instance = new CacheModel();
    }
    return this.instance;
  }
}

class CacheModel {
  constructor() {
    this._model = MongoClient.getInstance().connection.model('cache', CacheSchema);
  }

  get model(){
    return this._model;
  }
}

module.exports = CacheModelSingleton;

//module.exports = mongoClient.getInstance().connection.model('cache', CacheSchema);
