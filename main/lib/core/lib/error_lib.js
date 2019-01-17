'use strict';
module.exports = {
  errorModel: require('../models/error_model'),
  //mongoose: require('mongoose'),
  errorParser: require('error-stack-parser'),
  create: function(error,userId) {
    ////console.log('ERROR LIB CREATE | ', error);
    return new Promise((resolve, reject) => {
      this.errorModel.getInstance().model.create({
          stackArray: this.errorParser.parse(error),
          message:error.message,
          userId:userId
        },
        function(err, error) {
          if (err) {
            reject(err);
          }
        }
      );
    });
  },
  getAll: function(component) {
    return new Promise((resolve, reject) => {
      this.errorModel.getInstance().model.find({}).sort({date:-1}).limit(100).lean().exec(function(err, errors) {
          if (err) {
            reject(err);
          }else{
            resolve(errors);
          }
      });
    });
  }
};
