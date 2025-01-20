'use strict';
const fileLib = require('../../core/lib/file_lib_scylla.js');
const fileConvertor = require('../../core/dataTraitmentLibrary/file_convertor.js');
const dotProp = require('dot-prop');
const stringReplacer = require('../utils/stringReplacer.js');
const formUrlencoded = require('form-urlencoded').default;
const xml2js = require('xml2js');
const propertyNormalizer = require('../utils/propertyNormalizer.js');
const config = require('../config.json');
const himalaya = require('himalaya');
const superagent = require('superagent');
const forge = require('node-forge');
const File = require('../../core/model_schemas/file_schema_scylla.js');

class HttpConsumer {
  constructor() {
  }

  convertResponseToData(response, componentConfig) {
    return new Promise(async (resolve, reject) => {
      try {
        // console.log('___response',response);
        // console.log('___response body',response.body);
        // console.log('___response text',response.text);


        let contentType = componentConfig.overidedContentType || response.headers['content-type'];
        // console.log('___contentType',contentType);
        if (!contentType) {
          reject(new Error(`no content-type in response or overided by component`));
        }

        if (response.headers['content-encoding'] === 'gzip' && response._body && response.text == undefined) {
          response.text = response._body.toString('utf-8');
        }

        if (componentConfig.rawFile) {
          // Get filename from headers or URL
          let filename = response.headers['content-disposition']?.split('filename=')[1]?.replace(/['"]/g, '');
          if (!filename) {
            try {
              const url = response.request.url;
              const urlParts = url.split('/');
              filename = urlParts.pop();
            } catch (e) {
              filename = 'downloaded_file';
              console.warn('Failed to determine filename from URL:', e);
            }
          }
          // console.log('___response',response.body);
          // Create and save file
          const file = new File({
            binary: response.body,
            filename: filename,
            // TODO: processId is not provided by component
            processId: componentConfig.processId
          });
          await fileLib.create(file);
          resolve({
            file: {
              _file: file.id
            }
          });
          return;
        } 

        if (contentType.includes('html')) {
          try {
            const text = response.body.toString(); // superagent stores response text here
            const json = himalaya.parse(text);
            resolve(json);
          } catch (e) {
            resolve({ error: e });
          }
        } else if (contentType.includes('application/xml')) {
          let text = response.body.toString();
          if (!text) {
            reject(new Error('No XML content found in response'));
            return;
          }

          xml2js.parseString(text, { attrkey: 'attr', 'trim': true }, (err, result) => {
            if (err) {
              reject(new Error('Failed to parse XML: ' + err.message));
            } else {
              resolve(propertyNormalizer.execute(result));
            }
          });
        } else if (
          contentType.includes('application/json') ||
          contentType.includes('application/ld+json')
        ) {
          let responseObject = JSON.parse(response.body.toString());
          // let responseObject = []
          resolve(propertyNormalizer.execute(responseObject));
        } else if (
          contentType.includes('octet-stream') ||
          contentType.includes('zip') ||
          contentType.includes('ics') ||
          contentType.includes('gz') ||
          contentType.includes('csv') ||
          contentType.includes('xlsx') ||
          contentType.includes('vnd.openxmlformats-officedocument')
        ) {
          let filename = response.headers['content-disposition']?.split('filename=')[1]?.replace(/['"]/g, '');
          if (!filename) {
            try {
              const url = response.request.url;
              const urlParts = url.split('/');
              filename = urlParts.pop();
            } catch (e) {
              console.warn('Failed to determine filename from URL:', e);
            }
          }
          // console.log('___buffer',data,filename);
          fileConvertor.data_from_file(filename, response.body, contentType).then((result) => {
            resolve(propertyNormalizer.execute(result));
          }).catch((err) => {
            let fullError = new Error(err);
            fullError.displayMessage = 'HTTP GET : Erreur lors du traitement de votre fichier';
            reject(fullError);
          });
        } else {
          reject(new Error('unsuported content-type : ' + contentType));
        }
      } catch (e) {
        e.displayMessage = ('fail to parse data');
        reject(e);
      }
    });
  }

  pull(data, flowData, queryParams) {
    const componentConfig = data.specificData;
    // console.log('___componentConfig', componentConfig)
    let body;

    return new Promise(async (resolve, reject) => {
      try {
        let headers = {};
        if (componentConfig.headers != undefined) {
          for (let header of componentConfig.headers) {
            try {
              headers[header.key] = stringReplacer.execute(header.value, queryParams, flowData ? flowData[0].data : undefined);
            } catch (e) {
              if (this.config != undefined && this.config.quietLog != true) {
                console.log(e.message);
              }
            }
          }
        }

        let body;
        let bodyObject;

        if (componentConfig.noBody != true && flowData) {
          bodyObject = flowData[0].data;
          if (componentConfig.bodyPath && componentConfig.bodyPath.length > 0) {
            bodyObject = dotProp.get(bodyObject, componentConfig.bodyPath);
          }

          switch (componentConfig.contentType) {
            case 'text/plain':
              body = bodyObject.toString();
              break;
            case 'application/json':
            case 'application/ld+json':
              body = JSON.stringify(bodyObject);
              break;
            case 'application/x-www-form-urlencoded':
              body = formUrlencoded(bodyObject);
              break;
            default:
              reject(new Error(`${componentConfig.contentType} contentType not Supported by this component`));
          }
        }

        let url = componentConfig.url;

        if ((flowData && flowData[0].data) || queryParams) {
          url = stringReplacer.execute(componentConfig.url, queryParams, flowData ? flowData[0].data : undefined);
        }

        let response;
        let errorMessage;

        if (componentConfig.contentType && body) {
          headers['Content-Type'] = componentConfig.contentType;
        }

        let options = {
          method: componentConfig.method || 'GET',
          body: body,
          headers: headers,
          timeout: Number(componentConfig.timeout) || 20000,
        };
        if (flowData && flowData[0].data && componentConfig.certificateProperty && componentConfig.certificatePassphrase) {
          const fileObject = await fileLib.get(flowData[0].data[componentConfig.certificateProperty]?._file);
          options.agentOptions = {
            pfx: fileObject.binary,
            passphrase: componentConfig.certificatePassphrase,
            rejectUnauthorized: true
          };
        }

        this.call_url(url, options,
          componentConfig.retry ? componentConfig.retry - 1 : undefined
        ).then(async (response) => {
          // console.log('___response',response);
          let responseObject;

          if (response) {
            let hasResponseFailed = response.status >= 400;
            if (hasResponseFailed) {
              errorMessage = 'Request failed for url ' + url + ' with status ' + response.status;
            }
            try {
              if (response.headers && response.headers['content-length'] == 0) {
                responseObject = undefined;
              } else {
                responseObject = await this.convertResponseToData(response, componentConfig);
              }
            } catch (e) {
              errorMessage = e.message;
            }
          }

          if (errorMessage) {
            resolve({
              data: {
                request: {
                  url: url,
                  headers: headers,
                  body: bodyObject
                },
                response: {
                  body: responseObject,
                  status: response?.status,
                  headers: response?.headers
                },
                error: errorMessage
              }
            });
          } else {
            resolve({
              data: {
                body: responseObject,
                status: response?.status,
                headers: response?.headers
              }
            });
          }
        }).catch((e) => {
          console.log('error pull', e);
          errorMessage = e.message;
          // resolve({
          //   data: {
          //     request: {
          //       url: url,
          //       headers: headers,
          //       body: bodyObject
          //     },
          //     response: {
          //       body: responseObject,
          //       status: response?.status,
          //       headers: response?.headers
          //     },
          //     error: errorMessage
          //   }
          // });
          resolve({
            data: {
              request: {
                url: url,
                headers: headers,
                body: bodyObject
              },
              error: errorMessage
            }
          });
        });

      } catch (e) {
        reject(e);
      }
    });
  }

  convertP12ToPem(p12Buffer, password) {
    try {
      const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);

      // Extraire le certificat et la clé privée
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

      const cert = forge.pki.certificateToPem(certBags[forge.pki.oids.certBag][0].cert);
      const key = forge.pki.privateKeyToPem(keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key);

      return { cert, key };
    } catch (error) {
      console.error('Error converting P12 to PEM:', error);
      throw error;
    }
  }

  async call_url(url, options, numRetry, retry) {
    return new Promise(async (resolve, reject) => {
      // console.log('___options', options)
      if (numRetry === undefined) numRetry = 0;
      retry = retry || 0;

      // console.log('_url', url);
      try {
        // Encode the URL
        const encodedUrl = encodeURI(url);

        let request = superagent(options.method, encodedUrl)
          .set(options.headers)
          .timeout({
            response: options.timeout*1000,
            deadline: options.timeout*1000
          })
          .buffer(true)
          .responseType('blob');

        if (options.body) {
          request = request.send(options.body);
        }

        // Gestion du certificat P12
        if (url.includes('https') && options.agentOptions) {
          try {
            const { cert, key } = this.convertP12ToPem(
              options.agentOptions.pfx,
              options.agentOptions.passphrase
            );

            request = request
              .ca(cert)
              .key(key)
              .cert(cert);

            if (options.agentOptions.rejectUnauthorized !== undefined) {
              request = request.disableTLSCerts(!options.agentOptions.rejectUnauthorized);
            }
          } catch (certError) {
            console.error('Error setting up certificates:', certError);
            reject(new Error('Failed to setup SSL certificates: ' + certError.message));
            return;
          }
        }

        try {
          const response = await request;
          resolve(response);
        } catch (e) {
          // console.log('error call_url', e);
          if (e.response) {
            resolve(e.response)
          } else {
            if (config != undefined && config.quietLog != true) {
              console.warn(`Post consumer component ${options.method} to ${url} failed ${numRetry + 1} times : ${e.message}`);
            }
            // console.log('___numRetry3', numRetry, retry)
            if (numRetry >= retry) {
              if (config != undefined && config.quietLog != true) {
                console.error(JSON.stringify(e.message));
              }
              if (e.timeout) {
                reject(new Error(`request aborted due to timeout (${(options.timeout)}s) config ${numRetry + 1} times`));
              } else {
                reject(new Error(`${e.message} ${numRetry + 1} times`));
              }
            } else {
              const retryInterval = 5;
              if (config != undefined && config.quietLog != true) {
                console.warn(`trying again in ${retryInterval}s... `);
              }
              setTimeout(async () => {
                this.call_url(url, options, numRetry + 1, retry).then((postponeFetch) => {
                  resolve(postponeFetch);
                }).catch((e) => {
                  reject(e);
                });
              }, retryInterval * 1000);
            }
          }




        }
      } catch (error) {
        reject(error);
      }
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new HttpConsumer();
