module.exports = {
    type: 'Json_to_Yaml ',
    description: 'Traduction du flux json en yaml',
    editor: 'json-to-yaml',
    graphIcon:'default.png',
    module: 'Json to Yaml',
    // yaml: require('js-yaml'),

    makeRequest: function (flowData, request) {
        return new Promise((resolve, reject) => {
          
        })
    },
    pull: function (data, flowData) {
        //console.log('REST Get JSON | pull : ',data);
        // console.log("flowDataAAAAAAAAA", flowData[0].data)
        return this.makeRequest(flowData[0].data, data.specificData.request);
    }
}