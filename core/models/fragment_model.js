'use strict';
////console.log(__filename);
const MongoClient = require('../db/mongo_client');
const FragmentSchema = require('../model_schemas/fragment_schema');

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
    this._model = MongoClient.getInstance().connection.model('fragment', FragmentSchema);
  }

  get model(){
    return this._model;
  }
}

module.exports = FragmentModelSingleton;
// module.exports = mongoClient.getInstance().connection.model('fragment', FragmentSchema);
