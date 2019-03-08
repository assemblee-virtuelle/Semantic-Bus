'use strict';
////console.log(__filename);
const MongoClient = require('../db/mongo_client');
const BigdataflowSchema = require('../model_schemas/bigdataflow_schema');
// var WorkspaceSchema = require('../model_schemas/workspace').workspace;



class BigdataflowModelSingleton {
  constructor() {
  }

  static getInstance(){
    //console.log("singleton this",this);
    if (this.instance == undefined) {
      this.instance = new BigdataflowModel();
    }
    return this.instance;
  }
}

class BigdataflowModel {
  constructor() {
    this._model = MongoClient.getInstance().connection.model('bigdataflow', BigdataflowSchema);
  }

  get model(){
    return this._model;
  }
}

module.exports = BigdataflowModelSingleton;
//module.exports = mongoClient.getInstance().connection.model('workspace', WorkspaceSchema);
