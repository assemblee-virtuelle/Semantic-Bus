'use strict';

const fs = require('fs');
const https = require('https');
const fileLib = require('../../core/lib/file_lib.js')

class HttpConsumer {
  constructor () {
    this.fetch = require('node-fetch');
    this.stringReplacer = require('../utils/stringReplacer.js');
    this.formUrlencoded = require('form-urlencoded').default;
    const { AbortController, abortableFetch }  = require('abortcontroller-polyfill/dist/cjs-ponyfill');
    this.AbortController=AbortController;
    this.xml2js = require('xml2js');
    this.propertyNormalizer = require('../utils/propertyNormalizer.js');
    this.config = require('../configuration.js');
    this.himalaya = require('himalaya')
  }

  convertResponseToData (response,componentConfig) {
    return new Promise(async(resolve, reject)=>{
      try {

        let contentType = componentConfig.overidedContentType || response.headers.get('content-type')
        if (contentType==null || contentType==undefined || contentType==''){
            reject(new Error(`no content-type in response or overided by component`))
        } else if (contentType.search('html') != -1) {
          try {
            const text = await response.text()
            const json = this.himalaya.parse(text);
            resolve(json);
          } catch (e) {
            resolve({
              error : e
            })
          }
        } else if (contentType.search('xml') != -1 ) {
          const text = await response.text()
          this.xml2js.parseString(text, {
            attrkey: 'attr',
            'trim': true
          }, (err, result) => {
            // console.log('result',result);
            resolve(this.propertyNormalizer.execute(result))
          })
        } else if (contentType.search('json') != -1) {
          let responseObject = await response.json();
          // console.log('responseObject',responseObject);
          resolve(this.propertyNormalizer.execute(responseObject))
        }
        else {
          reject(new Error('unsuported content-type :' + contentType))
        }
      } catch (e) {
        e.displayMessage = ('fail to parse data')
        reject(e)
      }
    });
  }

  pull (data, flowData, queryParams) {
    const componentConfig = data.specificData;
    let body;


    return new Promise(async (resolve,reject)=>{
      try {
        let headers={};
        if (componentConfig.headers != undefined) {

          for (let header of componentConfig.headers) {

            try {
              headers[header.key] = this.stringReplacer.execute(header.value, queryParams, flowData?flowData[0].data:undefined)
            } catch (e) {
              if (this.config != undefined && this.config.quietLog != true) {
                console.log(e.message);
              }
            }
          }
        }


        let body;

        if(componentConfig.noBody!=true && flowData){
          // console.log("here ",flowData[0].data);
          switch (componentConfig.contentType) {
            case 'text/plain':
              body = flowData[0].data
              // "airSensors,sensor_id=TLM0201";
              break;
              //console.log("new here ! ",flowData[0].data);
            case 'application/json':
            case 'application/ld+json':
              body = JSON.stringify(flowData[0].data);
              break;
            case 'application/x-www-form-urlencoded':
              body = this.formUrlencoded(flowData[0].data)
              break;
            default:
              reject(new Error(`${componentConfig.contentType} contentType not Supported by this component`));

          }
          // console.log('body',body);
        }

        let url=componentConfig.url;
        // console.log('flowData',flowData);
        if((flowData&&flowData[0].data) || queryParams){
          url = this.stringReplacer.execute(componentConfig.url, queryParams, flowData?flowData[0].data:undefined);
        }

        let response;
        let errorMessage;
        headers= {
          'Content-Type': componentConfig.contentType,
          ...headers
        }

        // console.log('headers',headers);
        // console.log('BEFORE CALL');
        let certif = undefined;
        if (flowData && flowData[0].data && componentConfig.certificateProperty && componentConfig.certificatePassphrase ){
          // console.log ('fileId',flowData[0],flowData[0].data[componentConfig.certificateProperty])
          const fileObjectc = await fileLib.get(flowData[0].data[componentConfig.certificateProperty]);
          // console.log('fileObjectc',fileObjectc)
          let file =fs.readFileSync(fileObjectc.filePath);
          console.log('file',file)
          certif={
            pfx:{
              file : file,
              passphrase : componentConfig.certificatePassphrase
            }
          }
        }

        this.call_url(url, {
          method: componentConfig.method||'GET',
          body: body,
          headers: headers,
          certif
        },
        undefined,
        componentConfig.timeout,
        componentConfig.retry?componentConfig.retry-1:undefined
      ).then(async (response)=>{
          // console.log('AFTER CALL',response.status);
          let responseObject;

          if (response){
            let hasResponseFailed = response.status >= 400;
            if (hasResponseFailed) {
              errorMessage='Request failed for url ' + url + ' with status ' + response.status
            }
            try{

              if(response.headers&&response.headers.get('content-length')==0){
                responseObject = undefined;
              }else{
                responseObject = await this.convertResponseToData(response,componentConfig);
                // console.log('responseObject',responseObject);
              }
            } catch (e) {
              errorMessage= e.message;
            }
          }

          if (errorMessage){
            resolve({
              data:{
                request:{
                  url:url,
                  headers:headers,
                  body:flowData&&flowData[0].data
                },
                response:{
                  body:responseObject,
                  status:response&&response.status,
                  headers:response&&Object.fromEntries(response.headers.entries()),
                },
                error:errorMessage
              }
            })
          } else {
            resolve({
              data: {
                body:responseObject,
                status:response&&response.status,
                headers:response&&response.headers&&Object.fromEntries(response.headers.entries()),
              }
            })
          }

        }).catch((e)=>{
          errorMessage= e.message;
          // console.log('flowData[0].data',flowData[0]);
          resolve({
            data:{
              request:{
                url:url,
                headers:headers,
                body:flowData&&flowData[0].data?JSON.parse(JSON.stringify(flowData[0].data)):undefined
              },
              error:errorMessage
            }
          })
        })

        // console.log('AFTER CALL');

      } catch (e) {
        // console.log(e.message);
        reject(e);
      }

    });


  }

  call_url (url, options, numRetry, timeout, retry) {
    return new Promise (async (resolve,reject)=>{
      if (numRetry === undefined) numRetry = 0
      // console.log('call',url);
      const fetchTimeout= timeout || 20;
      retry=retry||0;
      const controller = new this.AbortController();
      const id = setTimeout(() => {
        // console.warn(`Fetch timeout ${fetchTimeout}s`);
        controller.abort();
      }, fetchTimeout*1000);

      // Configuration de l'agent HTTPS personnalisé
      let optionsMix;
      if (url.includes('https') && options.certif && options.certif.pfx){
        const agent = new https.Agent({
          pfx: options.certif.pfx.file,
          passphrase: options.certif.pfx.passphrase
        });
        optionsMix={...options, agent, signal: controller.signal };
      }else{
        optionsMix={...options, signal: controller.signal }
      }

      this.fetch(url, optionsMix).then(
        (fetchResult)=>{
          clearTimeout(id);
          resolve(fetchResult);
        }
      ).catch(
        (e)=>{
          clearTimeout(id);
          if (this.config != undefined && this.config.quietLog != true) {
              console.warn(`Post consumer component ${options.method} to ${url} failed ${numRetry+1} times : ${e.message}`)
          }

          if (numRetry >= retry) {
            if (this.config != undefined && this.config.quietLog != true) {
              console.error(JSON.stringify(e.message));
            }
            if (e.message.includes('abort')){
              reject(new Error(`request aborted cause by timout (${fetchTimeout}s) config ${numRetry+1} times`));
            }else{
              reject(new Error(`${e.message} ${numRetry+1} times`));
            }

          } else {
            // Exponentially increment retry interval at every failure
            // This will retry after 5s, 25s, 2m, 10m, 50m, 4h, 21h
            // const retryInterval = Math.pow(5, numRetry + 1)

            const retryInterval =5;
            if (this.config != undefined && this.config.quietLog != true) {
              console.warn(`trying again in ${retryInterval}s... `)
            }
            setTimeout(async ()=>{

                this.call_url(url, options, numRetry + 1).then((postponeFectch)=>{
                  resolve(postponeFectch)
                }).catch((e)=>{
                  reject(e)
                })

            }, retryInterval * 1000)


          }
        }
      );
      // console.log('AFTER FETCH');
    })

  }

  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

module.exports = new HttpConsumer()
