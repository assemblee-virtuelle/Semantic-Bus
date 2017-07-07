module.exports = {
  type: '',
  description: '',
  editor: '',
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