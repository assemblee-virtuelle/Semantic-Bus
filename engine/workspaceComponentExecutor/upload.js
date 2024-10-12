'use strict'

const file_lib = require('../../core/lib/file_lib_scylla');
const file_convertor = require('../../core/dataTraitmentLibrary/file_convertor.js')
const fs = require('fs');

class Upload {
  constructor() {
    this.workspace_component_lib = require('../../core/lib/workspace_component_lib')
    this.busboy = require('busboy')

    this.propertyNormalizer = require('../utils/propertyNormalizer.js')
    this.readable = require('stream').Readable
    this.stepNode = false
  }

  pull(data, flowData, pullParams, processId) {
    // console.log('flowData', flowData);
    console.log('processId', processId);
    // console.log('upload',pullParams.upload);
    return new Promise(async (resolve, reject) => {
      // console.log('processId', processId);
      if (pullParams._file) {

        const file = await file_lib.get(pullParams._file);

        // console.log('file',file);

        try {
          const data =  await file_convertor.data_from_file(file.filename, file.binary);
          resolve({
            data: data.data
          })
        } catch (error) {
          console.error(error);

          file.processId=processId.toString();
          await file_lib.update(file);


          resolve({
            data: {
              file:{
                _file:pullParams._file
              }
            }
          })
        }


        resolve({
          data: {
            _file: pullParams._file
          }
        })

        // Lecture du fichier et conversion en buffer
        // fs.readFile(file.filePath, async (err, buffer) => {
        //   if (err) {
        //     console.error('Erreur lors de la lecture du fichier:', err);
        //     resolve({
        //       error: err
        //     })

        //   } else {
        //     try {
        //       const data =  await file_convertor.data_from_file(file.fileName, buffer);
        //       resolve({
        //         data: data.data
        //       })
        //     } catch (error) {
        //       resolve({
        //         data: {
        //           _file:pullParams._file
        //         }
        //       })
        //     }

        //     // console.log('DATA',data)
        //   }

        // });
      } else {
        resolve({
          data: pullParams
        })
      }
    })
  }
}

module.exports = new Upload()
