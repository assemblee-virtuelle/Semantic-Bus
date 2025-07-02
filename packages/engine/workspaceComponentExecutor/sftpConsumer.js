'use strict';
const fragment_lib = require('@semantic-bus/core/lib/fragment_lib_scylla.js');
const DfobProcessor = require('@semantic-bus/core/helpers/dfobProcessor.js');


class SftpConsumer {
  constructor() {
    this.sftpClient = require('ssh2-sftp-client');
    this.dataTraitment = require('@semantic-bus/core/dataTraitmentLibrary/index.js');
    this.propertyNormalizer = require('../utils/propertyNormalizer.js')
    this.stringReplacer = require('../utils/stringReplacer.js');
    this.fileLib = require('@semantic-bus/core/lib/file_lib_scylla.js');
    this.File = require('@semantic-bus/core/model_schemas/file_schema_scylla.js');
  }

  dataProcessing(dataPath, readableStream, processId, specificData) {
    return new Promise(async (resolve, reject) => {
      const fakeName = dataPath.replace('/', '_');
      let rawFile = true;
      if (specificData.rawFile != true) {
        try {
          const result = await this.dataTraitment.type.data_from_file(fakeName, readableStream, rawFile)
          let data = this.propertyNormalizer.execute(result.data);
          rawFile = false;
          resolve({
            data: data,
            path: dataPath
          });
        } catch (e) {
          console.warning(e);
        }
      }

      if (rawFile) {
        const file = new this.File({
          binary: readableStream,
          filename: fakeName,
          processId: processId
        });
        await this.fileLib.create(file);
        resolve(
          {
            file: {
              _file: file.id
            }
          }
        );
      }
    })
  }

  getFile(specificData, data, pullParams, processId) {
    return new Promise(async (resolve, reject) => {
      let sftp = new this.sftpClient();

      const specificDataParsed = {};

      Object.keys(specificData).forEach(key => {
        if (typeof specificData[key] === 'string' || specificData[key] instanceof String) {
          try {
            specificDataParsed[key] = this.stringReplacer.execute(specificData[key], pullParams, data);
          } catch (e) {
            specificDataParsed[key] = { error: e.message };
          }
        } else {
          specificDataParsed[key] = specificData[key];
        }
      });

      // configuration to connect to the ftp server
      const config = {
        host: specificDataParsed.host,
        port: specificDataParsed.port,
        username: specificDataParsed.login,
        password: specificDataParsed.password
      }

      try {
        const connection = await sftp.connect(config);
        const typeOfPath = await sftp.exists(specificDataParsed.path);
        if (typeOfPath.includes('-')) {
          const readableStream = await sftp.get(specificDataParsed.path)
          const data = await this.dataProcessing(specificDataParsed.path, readableStream, processId, specificDataParsed);
          resolve(data);
        } else if (typeOfPath.includes('d')) {
          const elements = await sftp.list(specificDataParsed.path)
          // console.log('elements', elements);
          const data = elements.map(async element => {
            const elementPath = specificDataParsed.path + element.name;
            if (element.type.includes('-')) {
              return {
                path: elementPath,
                type: 'file'
              }
            } else if (element.type.includes('d')) {
              return {
                path: elementPath,
                type: 'folder'
              }
            }
          })
          resolve(data);
        } else {
          reject(new Error(`path ${specificDataParsed.path} not found`))
        }
      } catch (e) {
        reject(e);
      } finally {
        await sftp.end();
      }

    });
  }

  async workWithFragments(data, flowData, pullParams, processId) {
    return new Promise(async (resolve, reject) => {
      try {
        // Get the input fragment and dfob
        const inputFragment = flowData[0]?.fragment;
        const inputDfob = flowData[0]?.dfob;
        // console.log('inputFragment', inputFragment)

        if (!inputFragment) {
          resolve();
          return;
        }

        // Get data from fragment
        let rebuildDataRaw = await fragment_lib.getWithResolutionByBranch(inputFragment.id, {
          pathTable: inputDfob?.dfobTable || []
        });

        const rebuildData = await DfobProcessor.processDfobFlow(
          rebuildDataRaw,
          { ...inputDfob, delayMs: inputDfob?.delayMs || 0 },
          this,
          this.getFile,
          (item) => {
            return [
              data.specificData,
              item,
              pullParams,
              processId
            ];
          },
          async () => {
            return true;
          }
        );

        // Persist the transformed data
        await fragment_lib.persist(rebuildData, undefined, inputFragment);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  pull(data, flowData, pullParams) {
    return new Promise(async (resolve, reject) =>   {
      try {
        const result = await this.getFile(data.specificData, flowData ? flowData[0].data : undefined, pullParams)
        resolve({
          data: result
        })
      } catch (e) {
        reject(e);
      }
    })
  }
}
module.exports = new SftpConsumer()
