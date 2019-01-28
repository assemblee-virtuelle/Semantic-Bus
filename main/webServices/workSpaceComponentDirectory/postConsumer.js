'use strict'
module.exports = {
  // Generic components data
  type: 'Post consumer',
  description: 'Envoyer les données en POST vers une URL externe.',
  editor: 'post-consumer-editor',
  graphIcon: 'Post_consumer.png',
  tags: [
    'http://semantic-bus.org/data/tags/outComponents',
    'http://semantic-bus.org/data/tags/APIComponents'
  ],
  // Component-specific data
  fetch: require('node-fetch'),

  // Function called when another component push to this component
  pull: function (data, flowData, queryParams) {
    const componentConfig = data.specificData
    let body

    switch (componentConfig.contentType) {
    case 'application/json':
      body = JSON.stringify(flowData[0].data)
      break

    default:
      return Promise.reject(new Error('Only application/json contentType is currently supported for Post consumer component'))
    }

    return this.call_url(componentConfig.url, {
      method: 'POST',
      body: body,
      headers: { 'Content-Type': componentConfig.contentType }
    })
  },

  call_url: function (url, options, numRetry) {
    if (numRetry === undefined) numRetry = 0

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
  },

  sleep: function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
