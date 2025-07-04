'use strict';
const { v4: uuidv4 } = require('uuid');

class File {
  constructor(data) {
    const lowerCamelData = {
      id: data?.id,
      binary: data?.binary,
      filename: data?.filename,
      processId: data?.processId || data?.processid,
      cacheId: data?.cacheId || data?.cacheid
    };

    this.id = lowerCamelData.id || uuidv4();
    this.binary = lowerCamelData.binary;
    this.filename = lowerCamelData.filename;
    this.processId = lowerCamelData.processId?.toString(); // This field is exclusive to the cacheId field
    this.cacheId = lowerCamelData.cacheId?.toString(); //   This field is exclusive to the processId field
  }
}


module.exports = File;
