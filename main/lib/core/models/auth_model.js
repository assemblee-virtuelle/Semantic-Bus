'use strict';
////console.log(__filename);
const MongoClient = require('../db/mongo_client');
const AuthenticationSchema = require('../model_schemas/auth_schema');


/** @type module:mongoose.Model<AuthenticationDocument> */

class AuthenticationModelSingleton {
  constructor() {
  }

  static getInstance(){
    if (this.instance == undefined) {
      this.instance = new AuthenticationModel();
    }
    return this.instance;
  }
}

class AuthenticationModel {
  constructor() {
    this._model = MongoClient.getInstance().connection.model('authentication', AuthenticationSchema);
  }

  get model(){
    return this._model;
  }
}

module.exports = AuthenticationModelSingleton;
//module.exports = mongoClient.getInstance().connection.model('authentication', AuthenticationSchema);
