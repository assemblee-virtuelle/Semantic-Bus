'use strict'

const file_lib = require('../../core/lib/file_lib_scylla');
const file_convertor = require('../../core/dataTraitmentLibrary/file_convertor.js');


class Upload {
  constructor() {
    this.stepNode = false;
  }

  pull(data, flowData, pullParams, processId) {
    return new Promise(async (resolve, reject) => {
      if (pullParams?._file) {
        const file = await file_lib.get(pullParams._file);
        try {
          const data = await file_convertor.data_from_file(file.filename, file.binary);
          resolve({
            data: data.data
          });
        } catch (error) {
          console.error(error);
          file.processId = processId.toString();
          await file_lib.update(file);
          resolve({
            data: {
              file: {
                _file: pullParams._file
              }
            }
          });
        }
        resolve({
          data: {
            _file: pullParams._file
          }
        });
      } else {
        resolve({
          data: pullParams
        });
      }
    });
  }
}

module.exports = new Upload();
