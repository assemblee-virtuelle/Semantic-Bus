'use strict';

const MongoClient = require('../db/mongo_client');
const SecureMailShema = require('../model_schemas/security_mail');

class SecureMailModel {

  static get(){
    return MongoClient.getInstance().connection.model('secureMail', SecureMailShema);
  }
}

module.exports = SecureMailModel;
