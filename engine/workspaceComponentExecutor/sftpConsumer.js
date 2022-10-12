'use strict';
class SftpConsumer {
  constructor() {
    this.sftpClient = require('ssh2-sftp-client');
    this.dataTraitment = require('../../core/dataTraitmentLibrary/index.js');
    this.propertyNormalizer = require('../utils/propertyNormalizer.js')
    this.stringReplacer = require('../utils/stringReplacer.js');
  }

  dataProcessing(dataPath, readableStream) {
    return new Promise((resolve, reject) => {
      const fakeName = dataPath.replace('/','_');

      this.dataTraitment.type.type_file(fakeName, readableStream.toString(), readableStream)
        .then((result) => {
          let data = this.propertyNormalizer.execute(result.data);
          // console.log(data);
          resolve({
            data: data,
            path: dataPath
          });
        }, (err) => {
          let fullError = new Error(err);
          fullError.displayMessage = 'SFTP : Erreur lors du traitement du fichier';
          reject(fullError);
        });
    })
  }

  getFile(specificData, data, pullParams) {
    return new Promise((resolve, reject) => {
      let sftp = new this.sftpClient();

      const specificDataParsed = {};

      Object.keys(specificData).forEach(key => {
        try {
          specificDataParsed[key] = this.stringReplacer.execute(specificData[key], pullParams, data);
        } catch (e) {
          specificDataParsed[key] = { error: e.message };
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
                return this.dataProcessing(specificDataParsed.path, readableStream);
              })
              .then(result => {
                resolve({
                  data:result
                });
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
                          return this.dataProcessing(elementPath, readableStream);
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
