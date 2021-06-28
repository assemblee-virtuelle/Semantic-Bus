'use strict';
class PostConsumer {
  constructor () {
    this.fetch = require('node-fetch');
    this.stringReplacer = require('../utils/stringReplacer.js');
    this.formUrlencoded = require('form-urlencoded').default;
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
            // console.log('replacing',this.stringReplacer.execute(header.value, queryParams, body));
            try {
              headers[header.key] = this.stringReplacer.execute(header.value, queryParams, flowData[0].data)
            } catch (e) {
              console.log(e);
            }
          }
        }


        let body;
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
        const url = this.stringReplacer.execute(componentConfig.url, queryParams, flowData[0].data);


        const response = await this.call_url(url, {
          method: componentConfig.method||'POST',
          body: body,
          headers: {
            'Content-Type': componentConfig.contentType,
            ...headers
          }
        });


        let data;
        let hasResponseFailed = response.status >= 400;
        let errorMessage;
        if (hasResponseFailed) {
          // console.log(await response.text());
          errorMessage='Request failed for url ' + url + ' with status ' + response.status
          // reject(new Error('Request failed for url ' + url + ' with status ' + response.status))
        }
        switch (response.headers.get('content-type')) {
          case 'application/json':
          case 'application/ld+json':
            data= await response.json();
            break;
          default:
            data= await response.text();
        }
        // console.log(data);
        // const data = await response.text();
        if (errorMessage){
          resolve({
            data:{
              body:data,
              error:errorMessage
            }
          })
        } else {
          resolve({
            data:data
          })
        }



      } catch (e) {
        console.log(e);
        reject(e);
      }

    });


  }

  call_url (url, options, numRetry) {
    if (numRetry === undefined) numRetry = 0
    // console.log('call',url);
    return this.fetch(url, options).catch(error => {
      if (numRetry >= 3) {
        // TODO log the failed posts somewhere ?
        console.error(error)
      } else {
        // Exponentially increment retry interval at every failure
        // This will retry after 5s, 25s, 2m, 10m, 50m, 4h, 21h
        // const retryInterval = Math.pow(5, numRetry + 1)

        const retryInterval =5;
        console.log(`Post consumer component post to ${url} failed, trying again in ${retryInterval}s...`)

        return this.sleep(retryInterval * 1000)
          .then(() => this.call_url(url, options, numRetry + 1))
      }
    })
  }

  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

module.exports = new PostConsumer()
