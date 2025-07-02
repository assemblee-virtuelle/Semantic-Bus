'use strict';

const fileModel = require('../models/file_model_scylla');

module.exports = {
  get: async function(fileId) {
    try {
      const file = await fileModel.getFileById(fileId);
      return file;
    } catch (error) {
      throw new Error(`Error fetching file: ${error.message}`);
    }
  },
  create: async function(file) {
    try {
      const newFile = await fileModel.insertFile(file);
      return newFile;
    } catch (error) {
      throw new Error(`Error creating file: ${error.message}`);
    }
  },
  remove: async function(fileId) {
    try {
      await fileModel.deleteFileById(fileId);
    } catch (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  },
  update: async function(file) {
    try {
      const updatedFile = await fileModel.updateFile(file);
      return updatedFile;
    } catch (error) {
      throw new Error(`Error updating file: ${error.message}`);
    }
  },
  duplicate: async function(file, newFileProperties) {
    try {
      const duplicatedFile = await fileModel.duplicateFile(file, newFileProperties);
      return duplicatedFile;
    } catch (error) {
      throw new Error(`Error duplicating file: ${error.message}`);
    }
  },
  search: async function(criteria, sortOptions = {}, selectedFields = {}) {
    try {
      const files = await fileModel.searchFileByField(criteria, sortOptions, selectedFields);
      return files;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de fichiers : ${error.message}`);
    }
  },
  deleteMany: async function(criteria) {
    try {
      await fileModel.deleteManyFile(criteria);
    } catch (error) {
      throw new Error(`Error deleting files: ${error.message}`);
    }
  }
};
