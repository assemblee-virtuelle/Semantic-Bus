'use strict';
class PostConsumer {
  constructor () {
    this.fetch = require('node-fetch');
    this.stringReplacer = require('../utils/stringReplacer.js');
    this.formUrlencoded = require('form-urlencoded').default;
    const { AbortController, abortableFetch }  = require('abortcontroller-polyfill/dist/cjs-ponyfill');
    this.AbortController=AbortController;
    this.xml2js = require('xml2js');
    this.propertyNormalizer = require('../utils/propertyNormalizer.js');
    this.config = require('../configuration.js');
  }

  convertResponseToData (response,componentConfig) {
    return new Promise(async(resolve, reject)=>{
      try {

        let contentType = response.headers.get('content-type') || componentConfig.overidedContentType
                // console.log('convertResponseToData',contentType,response.url,'allo',response.status)
        // if (specificData.overidedContentType != undefined && specificData.overidedContentType.length > 0) {
        //   contentType = specificData.overidedContentType
        // }
        if (contentType==null || contentType==undefined || contentType==''){
            reject(new Error(`no content-type in response or in overided by component`))
        }else if (contentType.search('xml') != -1 || contentType.search('html') != -1) {

          this.xml2js.parseString(await response.text(), {
            attrkey: 'attr',
            'trim': true
          }, (err, result) => {
            resolve(this.propertyNormalizer.execute(result))
          })
        } else if (contentType.search('json') != -1) {
          let responseObject = await response.json();
          // console.log('responseObject',responseObject);
          resolve(this.propertyNormalizer.execute(responseObject))
        } else {
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

            // console.log('value',header.value);
            // console.log('replacing',this.stringReplacer.execute(header.value, queryParams));
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
          switch (componentConfig.contentType) {
            case 'application/json':
            case 'application/ld+json':
              body = JSON.stringify(flowData[0].data);
              break;
            case 'application/x-www-form-urlencoded':
              body = this.formUrlencoded(flowData[0].data)
              break;
            default:
              // return Promise.reject(new Error(`${componentConfig.contentType} contentType not Supported by this component`))
              reject(new Error(`${componentConfig.contentType} contentType not Supported by this component`));

          }
          // console.log('body',body);
        }

        let url=componentConfig.url;
        if(flowData){
          url = this.stringReplacer.execute(componentConfig.url, queryParams, flowData[0].data);
        }

        // console.log('URL',url);


        // const response = await this.call_url(url, {
        //   method: componentConfig.method||'POST',
        //   body: body,
        //   headers: {
        //     'Content-Type': componentConfig.contentType,
        //     ...headers
        //   }
        // });

        let response;
        let errorMessage;
        headers= {
          'Content-Type': componentConfig.contentType,
          ...headers
        }

              console.log('headers',headers);
        try{
          response = await this.call_url(url, {
            method: componentConfig.method||'POST',
            body: body,
            headers: headers
          });
        } catch (e) {
          errorMessage= e.message;
        }


        // console.log('STATUS',response.status);

        let data;

        if (response){
          let hasResponseFailed = response.status >= 400;
          if (hasResponseFailed) {
            // console.log(await response.text());
            errorMessage='Request failed for url ' + url + ' with status ' + response.status
            // reject(new Error('Request failed for url ' + url + ' with status ' + response.status))
          }
          try{
            data = await this.convertResponseToData(response,componentConfig);
          } catch (e) {
            errorMessage= e.message;
          }
        }


        // console.log('data',data);
        // const data = await response.text();
        if (errorMessage){
          resolve({
            data:{
              request:{
                url:url,
                headers:headers,
                body:flowData&&flowData[0].data
              },
              response:{
                body:data,
                status:response&&response.status,
                headers:response&&Object.fromEntries(response.headers.entries()),
              },
              error:errorMessage
            }
          })
        } else {
          resolve({
            data:data
          })
        }

      } catch (e) {
        // console.log(e.message);
        reject(e);
      }

    });


  }

  call_url (url, options, numRetry) {
    return new Promise (async (resolve,reject)=>{
      if (numRetry === undefined) numRetry = 0
      // console.log('call',url);
      const fetchTimeout=20
      const controller = new this.AbortController();
      const id = setTimeout(() => {
        // console.warn(`Fetch timeout ${fetchTimeout}s`);
        controller.abort();
      }, fetchTimeout*1000);

      try {
        const fetchResult = await this.fetch(url, {...options,signal: controller.signal });
        clearTimeout(id);
        // if(fetchResult.status >= 400){
        //   console.log('STATUS',fetchResult.status);
        //   throw new Error(`HTTP status ${fetchResult.status}`)
        // }
        // console.warn(`Post consumer component ${options.method} to ${url} done`)
        resolve(fetchResult);
      } catch (e) {
        clearTimeout(id);
        if (this.config != undefined && this.config.quietLog != true) {
            console.warn(`Post consumer component ${options.method} to ${url} failed ${numRetry+1} times : ${e.message}`)
        }

        if (numRetry > 2) {
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
          const sleepAwait = await this.sleep(retryInterval * 1000);
          try {
            const postponeFectch = await this.call_url(url, options, numRetry + 1);
            resolve(postponeFectch)
          } catch (e) {
            // console.log('REJECT');
            if (this.config != undefined && this.config.quietLog != true) {
              console.error(JSON.stringify(e.message));
            }
            reject(e)
          }
        }
      } finally {

      }


      // return this.fetch(url, {...options,signal: controller.signal }).catch(error => {
      //   if (numRetry >= 6) {
      //     // TODO log the failed posts somewhere ?
      //     console.error(error)
      //   } else {
      //     // Exponentially increment retry interval at every failure
      //     // This will retry after 5s, 25s, 2m, 10m, 50m, 4h, 21h
      //     // const retryInterval = Math.pow(5, numRetry + 1)
      //
      //     const retryInterval =5;
      //     console.log(`Post consumer component post to ${url} failed, trying again in ${retryInterval}s...`)
      //
      //     return this.sleep(retryInterval * 1000)
      //       .then(() => this.call_url(url, options, numRetry + 1))
      //   }
      // })
    })

  }

  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

module.exports = new PostConsumer()
