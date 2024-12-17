'use strict';
class SftpConsumer {
  constructor() {
    this.sftpClient = require('ssh2-sftp-client');
    this.dataTraitment = require('../../core/dataTraitmentLibrary/index.js');
    this.propertyNormalizer = require('../utils/propertyNormalizer.js')
    this.stringReplacer = require('../utils/stringReplacer.js');
    this.fileLib = require('../../core/lib/file_lib_scylla.js');
    this.File = require('../../core/model_schemas/file_schema_scylla.js');
  }

  dataProcessing(dataPath, readableStream, processId, specificData) {
    return new Promise(async (resolve, reject) => {
      const fakeName = dataPath.replace('/','_');

      let rawFile= true;
      if (specificData.rawFile!=true){
        try{
          const result = await this.dataTraitment.type.data_from_file(fakeName, readableStream, rawFile)
          let data = this.propertyNormalizer.execute(result.data);
          rawFile= false;
          resolve({
            data: data,
            path: dataPath
          });
        }catch(e){
          console.warning(e);
        }
      }

      if (rawFile){
        const file = new this.File({
          binary: readableStream,
          filename: fakeName,
          processId: processId
        });
        await this.fileLib.create(file);
        resolve(
          {
            file :{
              _file : file.id
            }
          }
        );
      }     
    })
  }

  getFile(specificData, data, pullParams, processId) {
    return new Promise((resolve, reject) => {
      let sftp = new this.sftpClient();

      const specificDataParsed = {};

      Object.keys(specificData).forEach(key => {
        if (typeof specificData[key] === 'string' || specificData[key] instanceof String) {
          try {
            specificDataParsed[key] = this.stringReplacer.execute(specificData[key], pullParams, data);
        } catch (e) {
            specificDataParsed[key] = { error: e.message };
          }
        }
      });

      // configuration to connect to the ftp server
      const config = {
        host: specificDataParsed.host,
        port: specificDataParsed.port,
        username: specificDataParsed.login,
        password: specificDataParsed.password
      }

      sftp.connect(config)
        .then(() => {
          // console.log('exists',specificDataParsed.path);
          // we check if the path entered is for a file or folder
          return sftp.exists(specificDataParsed.path);
        })
        .then(typeOfPath => {
          // console.log('typeOfPath',typeOfPath);
          // if the path leads to a file we return it
          if (typeOfPath === "-") {
            // we get the file and we return its data
            // console.log('FILE');
            sftp.get(specificDataParsed.path)
              .then(readableStream => {
               return this.dataProcessing(specificDataParsed.path, readableStream, processId, specificDataParsed);
              })
              .then(result => {
                resolve({
                  data:result
                });
              }).catch(e => {
                reject(e);
              });
          } else if (typeOfPath === "d") {
            // if the path leads to a folder
            // list every element in the folder
            sftp.list(specificDataParsed.path)
              .then(elements => {
                const promisesArray2 = elements.map(element => {
                  // if the elements are files
                  let elementPath = specificDataParsed.path + element.name;
                  if (element.type === "-") {
                    if (specificDataParsed.resolvefilePath){
                      return sftp.get(elementPath)
                        .then(readableStream => {
                          return this.dataProcessing(elementPath, readableStream, processId, specificDataParsed);
                        });
                    } else {
                      return Promise.resolve(
                        {
                          path: elementPath,
                          type: "file"
                        }
                      )
                    }

                  } else if (element.type === "d"){
                    return Promise.resolve(
                      {
                        path: elementPath,
                        type: "folder"
                      }
                    );
                  } else {
                    return Promise.resolve();
                  }
                });

                return Promise.all(promisesArray2);
              }).then(dataArray => {
                resolve({
                  data: dataArray
                });
              });
          } else if  (typeOfPath === false) {
            reject(new Error(`path ${specificDataParsed.path} not found`))
          }
        }).catch(e=>{
          reject(e);
        });
    });
  }


  pull(data, flowData, pullParams) {
    return this.getFile(data.specificData, flowData ? flowData[0].data : undefined, pullParams);
  }
}
module.exports = new SftpConsumer()
