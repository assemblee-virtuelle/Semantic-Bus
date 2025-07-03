'use strict';
// //console.log(__filename);
const MongoClient = require('../db/mongo_client');
const FileSchema = require('../model_schemas/file_schema');


/** @type module:mongoose.Model<AuthenticationDocument> */

class FileModelSingleton {
  constructor() {
  }

  static getInstance() {
    if (this.instance == undefined) {
      this.instance = new CertificateModel();
    }
    return this.instance;
  }
}

class CertificateModel {
  constructor() {
    this._model = MongoClient.getInstance().connection.model('file', FileSchema);
  }

  get model() {
    return this._model;
  }
}

module.exports = FileModelSingleton;
// module.exports = mongoClient.getInstance().connection.model('authentication', AuthenticationSchema);
