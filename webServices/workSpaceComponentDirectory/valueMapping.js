module.exports = {
  type: 'Value Mapping',
  description: 'remplacer les valeurs d une propriété par une autre',
  editor: 'value-mapping-editor',
  //url: require('url'),
  //http: require('http'),
  //waterfall: require('promise-waterfall'),

  mapValuues: function(source, specificData) {

    return new Promise((resolve, reject) => {


    })
  },
  test: function(data, flowData) {
    //console.log('Object Transformer | test : ',data,' | ',flowData[0].length);
    return this.mapValuues(flowData[0].data, data.specificData);
  }
}
