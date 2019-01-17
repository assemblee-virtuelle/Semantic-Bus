// 'use strict';
// ////console.log(__filename);
// const MongoClient = require('../db/mongo_client');
// const transactionSchema = require('../model_schemas/transaction_schema');
//
// class TransactionModelSingleton {
//   constructor() {
//   }
//
//   static getInstance(){
//     if (this.instance == undefined) {
//       this.instance = new TransactionModel();
//     }
//     return this.instance;
//   }
// }
//
// class TransactionModel {
//   constructor() {
//     this._model = MongoClient.getInstance().connection.model('Transaction', transactionSchema);
//   }
//
//   get model(){
//     return this._model;
//   }
// }
//
// module.exports=TransactionModelSingleton;
//
// //module.exports = mongoClient.getInstance().connection.model('Transaction', transactionSchema);
