"use strict";
module.exports = {
  // Generic components data
  type: 'Webhook',
  description: 'Envoyer les données en POST sur une URL externe.',
  editor: 'webhook-editor',
  graphIcon: 'Webhook.png',
  tags: [
    'http://semantic-bus.org/data/tags/outComponents',
    'http://semantic-bus.org/data/tags/APIComponents'
  ],
  // Component-specific data
  fetch: require('node-fetch'),

  // Function called when another component push to this component
  pull: function(data, flowData, queryParams) {
    return new Promise((resolve, reject) => {

      const componentData = data.specificData;
      let body;

      switch (componentData.contentType) {
        case 'application/json':
          body = JSON.stringify(flowData[0].data);
          break;

        default:
          return reject(new Error('Only application/json contentType is currently supported for Webhook component'));
      }

      return this.fetch(componentData.url, {
        method: 'POST',
        body: body,
        headers: { 'Content-Type': componentData.contentType }
      }).then(() => {
        resolve({ data: flowData[0].data });
      }).catch(e => {
        reject(e);
      });
    });
  }
};
