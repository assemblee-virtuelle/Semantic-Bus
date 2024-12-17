'use strict';

const fs = require('fs');
const https = require('https');
const fileLib = require('../../core/lib/file_lib_scylla.js');
const fileConvertor = require('../../core/dataTraitmentLibrary/file_convertor.js');
const dotProp = require('dot-prop');
const fetch = require('node-fetch');
const stringReplacer = require('../utils/stringReplacer.js');
const formUrlencoded = require('form-urlencoded').default;
const { AbortController, abortableFetch } = require('abortcontroller-polyfill/dist/cjs-ponyfill');
const xml2js = require('xml2js');
const propertyNormalizer = require('../utils/propertyNormalizer.js');
const config = require('../config.json');
const himalaya = require('himalaya');
const superagent = require('superagent');
const forge = require('node-forge');

class HttpConsumer {
  constructor() {
  }

  convertResponseToData(response, componentConfig) {
    return new Promise(async (resolve, reject) => {
      try {
        let contentType = componentConfig.overidedContentType || response.headers['content-type'];
        if (!contentType) {
          reject(new Error(`no content-type in response or overided by component`));
        }

        if (response.headers['content-encoding'] === 'gzip' && response._body) {
          response.text = response._body.toString('utf-8');
        }

        if (contentType.includes('html')) {
          try {
            const text = response.text; // superagent stores response text here
            const json = himalaya.parse(text);
            resolve(json);
          } catch (e) {
            resolve({ error: e });
          }
        } else if (contentType.includes('xml')) {
          let text = response.text;
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
        } else if (contentType.includes('json')) {
          let responseObject = response.body; // superagent automatically parses JSON
          resolve(propertyNormalizer.execute(responseObject));
        } else if (
          contentType.includes('octet-stream') ||
          contentType.includes('zip') ||
          contentType.includes('ics') ||
          contentType.includes('csv') ||
          contentType.includes('xlsx')
        ) {
          let buffer = response.body; // superagent stores binary data here
          fileConvertor.data_from_file(response.headers['content-disposition'], buffer).then((result) => {
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

          // console.log("bodyObject",bodyObject);
          switch (componentConfig.contentType) {
            case 'text/plain':
              body = bodyObject.toString();
              // "airSensors,sensor_id=TLM0201";
              break;
            //console.log("new here ! ",flowData[0].data);
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
          // console.log('body1',body);
        }

        let url = componentConfig.url;
        // console.log('_url', url);
        // console.log('flowData',flowData);
        if ((flowData && flowData[0].data) || queryParams) {
          url = stringReplacer.execute(componentConfig.url, queryParams, flowData ? flowData[0].data : undefined);
        }

        let response;
        let errorMessage;
        // console.log('body2',body);
        if (componentConfig.contentType && body) {
          headers['Content-Type'] = componentConfig.contentType;
        }

        // console.log('headers',headers);
        // console.log('BEFORE CALL');
        let agentOptions = undefined;
        let options = {
          method: componentConfig.method || 'GET',
          body: body,
          headers: headers
        };
        if (flowData && flowData[0].data && componentConfig.certificateProperty && componentConfig.certificatePassphrase) {
          console.log('_certification');
          // console.log ('fileId',flowData[0],flowData[0].data[componentConfig.certificateProperty])
          const fileObject = await fileLib.get(flowData[0].data[componentConfig.certificateProperty]?._file);
          console.log('_  fileObject',fileObject),
          console.log('_  componentConfig.certificatePassphrase',componentConfig.certificatePassphrase)
          // let file =fs.readFileSync(fileObjectc.filePath);
          // console.log('fileObject', fileObject)
          console.log('_  options.agentOptions',componentConfig.agentOptions)
          options.agentOptions = {
            pfx: fileObject.binary,
            passphrase: componentConfig.certificatePassphrase,
            rejectUnauthorized: true
          };
        }
        // console.log('options', url, options);
        this.call_url(url, options,
          undefined,
          componentConfig.timeout,
          componentConfig.retry ? componentConfig.retry - 1 : undefined
        ).then(async (response) => {
          // console.log('AFTER CALL',response.status);
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
                // console.log('responseObject',responseObject);
              }
            } catch (e) {
              errorMessage = e.message;
            }
          }
          console.log('response.headers', response.headers);

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
          console.log('error', e);
          errorMessage = e.message;
          // console.log('flowData[0].data',flowData[0]);
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

        // console.log('AFTER CALL');
      } catch (e) {
        // console.log('error', e);
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
      if (numRetry === undefined) numRetry = 0;
      retry = retry || 0;

      try {
        let request = superagent(options.method, url)
          .set(options.headers)
          .timeout({
            response: 20000,
            deadline: 20000
          });

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
          if (config != undefined && config.quietLog != true) {
            console.warn(`Post consumer component ${options.method} to ${url} failed ${numRetry + 1} times : ${e.message}`);
          }

          if (numRetry >= retry) {
            if (config != undefined && config.quietLog != true) {
              console.error(JSON.stringify(e.message));
            }
            if (e.timeout) {
              reject(new Error(`request aborted due to timeout (20s) config ${numRetry + 1} times`));
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
