'use strict';
////console.log(__filename);
const MongoClient = require('../db/mongo_client');
const userSchema = require('../model_schemas/user_schema');
const WorkspaceModel = require('../models/workspace_model');

/** @type module:mongoose.Model<UserDocument> */
class UserModelSingleton {
  constructor() {
  }

  static getInstance(){
    if (this.instance == undefined) {
      this.instance = new UserModel();
    }
    return this.instance;
  }
}

class UserModel {
  constructor() {
    //User dependency : User Model need Worksapce Model instanciation for populate
    WorkspaceModel.getInstance();
    this._model = MongoClient.getInstance().connection.model('User', userSchema);
  }

  get model(){
    return this._model;
  }
}

module.exports = UserModelSingleton;
//module.exports = mongoClient.getInstance().connection.model('User', userSchema);
