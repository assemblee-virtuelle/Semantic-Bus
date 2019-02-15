'use strict';

const MongoClient = require('../db/mongo_client');
const PasswordUpdateShema = require('../model_schemas/password_update');

class PasswordUpdateModel {

  static get(){
    return MongoClient.getInstance().connection.model('authentication', PasswordUpdateShema);
  }
}

module.exports = PasswordUpdateModel;
