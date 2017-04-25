module.exports = {
  type: 'xml property to Object',
  description: 'convertir une propriété qui contient du xml en object',
  editor: 'xml-property-to-object-editor',
  xml2js: require('xml2js'),
  xmlTransform: function(source, specificData) {
    //console.log(this.xml2js);
    return new Promise((resolve, reject) => {


      var property = specificData.propertyToConvert;
      var parseResolutionpromises = [];
      for (record of source) {
        parseResolutionpromises.push(new Promise((resolve, reject) => {
          this.xml2js.parseString(record[property], function(err, result) {
            resolve(result);
          });
        }));
      }

      Promise.all(parseResolutionpromises).then(function(data) {
        for (recordKey in data) {
          source[recordKey][property] = data[recordKey];
        }

        resolve({data:source});
      });
    })
  },
  test: function(data, flowData) {
    //console.log('Object Transformer | test : ',data,' | ',flowData[0].length);
    return this.xmlTransform(flowData[0].data, data.specificData);

  }
}
