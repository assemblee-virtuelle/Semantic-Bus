module.exports = {
  type: 'REST Get HTPP',
  description: 'intéroger une API REST avec une requete Get qui fourni un flux',
  editor: 'rest-get-editor',
  url: require('url'),
  http: require('http'),
  https: require('follow-redirects').https,
  dataTraitment: require("../dataTraitment/index.js"),
  makeRequest: function (flowData, request) {
    var _self = this
    //Probleme de contexte avec les arrow function
    return new Promise((resolve, reject) => {
      const parsedUrl = this.url.parse(urlString);
      
    });
  },
  test: function (data, flowData) {
    //console.log('REST Get JSON | test : ',data);
    return this.makeRequest(flowData, data.specificData.request);
  }
};