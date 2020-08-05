'use strict';
class PostConsumer {
  constructor () {
    this.fetch = require('node-fetch')
    this.stringReplacer = require('../utils/stringReplacer.js')
  }

  pull (data, flowData, queryParams) {
    const componentConfig = data.specificData
    let body

    switch (componentConfig.contentType) {
    case 'application/json':
      body = flowData[0].data
      break
    case 'application/ld+json':
      body = flowData[0].data
      break
    default:
      return Promise.reject(new Error('Only application/json contentType is currently supported for Post consumer component'))
    }
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

    return new Promise((resolve,reject)=>{
      this.call_url(componentConfig.url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': componentConfig.contentType,
          ...headers
        }
      }).then(response=>{
        response.text().then(data=>{
          resolve({
            data:data
          })
        }).catch(e=>{
          console.log(e);
        })
      }).catch(e=>{
        console.log(e);
      })
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
