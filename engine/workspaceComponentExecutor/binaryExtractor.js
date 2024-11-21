'use strict';

const file_lib = require('../../core/lib/file_lib_scylla');
const file_convertor = require('../../core/dataTraitmentLibrary/file_convertor.js');

class BinaryExtractor {
  constructor() {
    this.file_lib = file_lib;
    this.file_convertor = file_convertor;
  }

  async pull(data, flowData) {
    // console.log('data',data);
    // console.log('flowData',flowData);
    if (!flowData || !flowData[0] || !flowData[0].data || !flowData[0].data._file) {
      throw new Error('No file data found in input');
    }

    const fileId = flowData[0].data._file;
    const file = await this.file_lib.get(fileId);

    if (!file || !file.binary) {
      throw new Error('File not found or no binary content');
    }

    try {
      const result = await this.file_convertor.data_from_file(file.filename, file.binary,undefined, data.specificData.extractionParams);
      
      return {
        data: result.data
      };
    } catch (error) {
      console.error('Error extracting data from binary file:', error);
      throw new Error(`Failed to extract data: ${error.message}`);
    }
  }
}

module.exports = new BinaryExtractor(); 