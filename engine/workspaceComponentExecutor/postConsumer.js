'use strict';
class PostConsumer {
  constructor () {
    this.fetch = require('node-fetch');
    this.stringReplacer = require('../utils/stringReplacer.js');
    this.formUrlencoded = require('form-urlencoded').default;
  }

  pull (data, flowData, queryParams) {
    const componentConfig = data.specificData
    let body

    // switch (componentConfig.contentType) {
    // case 'application/json':
    //   body = flowData[0].data
    //   break
    // case 'application/ld+json':
    //   body = flowData[0].data
    //   break
    // 'application/x-www-form-urlencoded'
    // default:
    //   return Promise.reject(new Error(`${componentConfig.contentType} contentType not Supported by this component`))
    // }
    let headers={};
    if (data.specificData.headers != undefined) {

      for (let header of data.specificData.headers) {

        // console.log('value',header.value);
        // console.log('replacing',this.stringReplacer.execute(header.value, queryParams, body));
        try {
          headers[header.key] = this.stringReplacer.execute(header.value, queryParams, body)
        } catch (e) {
          console.log(e);
        }
      }
    }

    return new Promise(async (resolve,reject)=>{

      try {
        let body;
        switch (componentConfig.contentType) {
          case 'application/json':
          case 'application/ld+json':
            body = JSON.stringify(flowData[0].data);
            console.log('body',body);
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
        console.log('url',url);
        const response = await this.call_url(url, {
          method: componentConfig.method||'POST',
          body: body,
          headers: {
            'Content-Type': componentConfig.contentType,
            ...headers
          }
        });
        let data;
        switch (response.headers.get('content-type')) {
          case 'application/json':
          case 'application/ld+json':
            data= await response.json();
            break;
          default:
            data= await response.text();
        }
        console.log(data);
        // const data = await response.text();
        resolve({
          data:data
        })
      } catch (e) {
        console.log(e);
        reject(e);
      }


      //
      //
      // this.call_url(componentConfig.url, {
      //   method: 'POST',
      //   body: JSON.stringify(body),
      //   headers: {
      //     'Content-Type': componentConfig.contentType,
      //     ...headers
      //   }
      // }).then(response=>{
      //   response.text().then(data=>{
      //     resolve({
      //       data:data
      //     })
      //   }).catch(e=>{
      //     console.log(e);
      //   })
      // }).catch(e=>{
      //   console.log(e);
      // })
    });


  }

  call_url (url, options, numRetry) {
    if (numRetry === undefined) numRetry = 0
    // console.log('call',url);
    return this.fetch(url, options).catch(error => {
      if (numRetry >= 7) {
        // TODO log the failed posts somewhere ?
        console.error(error)
      } else {
        // Exponentially increment retry interval at every failure
        // This will retry after 5s, 25s, 2m, 10m, 50m, 4h, 21h
        const retryInterval = Math.pow(5, numRetry + 1)

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
