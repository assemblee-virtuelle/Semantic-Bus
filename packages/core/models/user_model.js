'use strict';
// //console.log(__filename);
const MongoClient = require('../db/mongo_client');
const userSchema = require('../model_schemas/user_schema');
const WorkspaceModel = require('../models/workspace_model');
const BigdataflowModel = require('../models/bigdataflow_model');

/** @type module:mongoose.Model<UserDocument> */
class UserModelSingleton {
  constructor() {
  }

  static getInstance() {
    if (this.instance == undefined) {
      this.instance = new UserModel();
    }
    return this.instance;
  }
}

class UserModel {
  constructor() {
    // User dependency : User Model need Worksapce Model instanciation for populate
    // TODO : review model decalration architecture
    WorkspaceModel.getInstance();
    BigdataflowModel.getInstance();

    this._model = MongoClient.getInstance().connection.model('User', userSchema);
  }

  get model() {
    return this._model;
  }
}

module.exports = UserModelSingleton;
// module.exports = mongoClient.getInstance().connection.model('User', userSchema);
