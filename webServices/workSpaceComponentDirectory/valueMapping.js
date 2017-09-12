module.exports = {
  type: 'Value Mapping',
  description: 'remplacer les valeurs d une propriété par une autre',
  editor: 'value-mapping-editor',
  graphIcon:'default.svg',
  //url: require('url'),
  //http: require('http'),
  //waterfall: require('promise-waterfall'),

  mapValue :function(valueIn, specificData){
    var valueOut=valueIn;
    for (var atomicMapping of specificData.mappingTable){
      if(valueIn.indexOf!=undefined && valueIn.indexOf(atomicMapping.flowValue)!=-1){
        //console.log('MAP',valueIn,atomicMapping.flowValue,atomicMapping.replacementValue);
        valueOut = valueIn.replace(atomicMapping.flowValue,atomicMapping.replacementValue);
      }
    }
    return valueOut;
  },
  mapValues: function(source, specificData) {

    return new Promise((resolve, reject) => {
      var out;
      if (Array.isArray(source)){
        out=source.map(valueIn=>this.mapValue(valueIn, specificData));
      }else{
        out=this.mapValue(source, specificData);
      }
      resolve({
        data: out
      });
    })

  },
  pull: function(data, flowData) {
    //console.log('Object Transformer | pull : ',data,' | ',flowData[0].length);
    return this.mapValues(flowData[0].data, data.specificData);
  }
}
