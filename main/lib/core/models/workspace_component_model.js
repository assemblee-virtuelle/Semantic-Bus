'use strict';
////console.log(__filename);
const MongoClient = require('../db/mongo_client');
const WorkspaceComponentSchema = require('../model_schemas/workspace_component_schema');

class WorkspaceComponentModelSingleton {
  constructor() {
  }

  static getInstance(){
    if (this.instance == undefined) {
      this.instance = new WorkspaceComponentModel();
    }
    return this.instance;
  }
}

class WorkspaceComponentModel {
  constructor() {
    this._model = MongoClient.getInstance().connection.model('workspaceComponent', WorkspaceComponentSchema);
  }

  get model(){
    return this._model;
  }
}

module.exports=WorkspaceComponentModelSingleton;
//module.exports = mongoClient.getInstance().connection.model('workspaceComponent', WorkspaceComponentSchema);
