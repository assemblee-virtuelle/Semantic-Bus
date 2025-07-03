'use strict';

const fileModel = require('../models/file_model');

module.exports = {
  get: function(fileId) {
    return new Promise((resolve, reject) => {
      const file = fileModel.getInstance().model.findById(fileId).lean();
      resolve(file);
    });
  },
  create: async function(file) {
    const fileModelInstance = fileModel.getInstance().model;
    const fileObject = new fileModelInstance({ ...file });
    return await fileObject.save();
  },
  remove: async function(fileId) {
    await fileModel.getInstance().model.deleteOne({ _id: fileId });
  }
};
