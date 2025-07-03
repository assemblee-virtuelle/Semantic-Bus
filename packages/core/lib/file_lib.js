'use strict';

const fileModel = require('../models/file_model');

module.exports = {
  get: function(fileId) {
    return new Promise((resolve, reject) => {
      const file = fileModel.getInstance().model.findById(fileId).lean();
      resolve(file);
    });
  },
  create: function(file) {
    return new Promise(async(resolve, reject) => {
      const fileModelInstance = fileModel.getInstance().model;
      const fileObject = new fileModelInstance({ ...file });
      resolve(await fileObject.save());
    });
  },
  remove: function(fileId) {
    return new Promise(async(resolve, reject) => {
      await certificateModel.getInstance().model.deleteOne({ _id: fileId });
      resolve();
    });
  }
};
