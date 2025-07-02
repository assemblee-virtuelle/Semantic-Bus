'use strict';
////console.log(__filename);
const MongoClient = require('../db/mongo_client');
const WorkspaceSchema = require('../model_schemas/workspace_schema');
// var WorkspaceSchema = require('../model_schemas/workspace').workspace;



class WorkSpaceModelSingleton {
  constructor() {
  }

  static getInstance(){
    //console.log("singleton this",this);
    if (this.instance == undefined) {
      this.instance = new WorkSpaceModel();
    }
    return this.instance;
  }
}

class WorkSpaceModel {
  constructor() {
    this._model = MongoClient.getInstance().connection.model('workspace', WorkspaceSchema);
  }

  get model(){
    return this._model;
  }
}

module.exports = WorkSpaceModelSingleton;
//module.exports = mongoClient.getInstance().connection.model('workspace', WorkspaceSchema);
