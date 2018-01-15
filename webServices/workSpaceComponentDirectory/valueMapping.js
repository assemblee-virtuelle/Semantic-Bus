module.exports = {
  type: 'Value Mapping',
  description: 'remplacer les valeurs d une propriété par une autre',
  editor: 'value-mapping-editor',
  graphIcon:'valueMapping.png',
  tags:[
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleQueryingComponents'
  ],
  //url: require('url'),
  //http: require('http'),
  //waterfall: require('promise-waterfall'),
  getPriceState: function(){
    return new Promise((resolve,reject)=>{
      resolve({state:true})
    })
  },
  mapValue :function(valueIn, specificData){
    let valueInString= valueIn.toString()
    var valueOut=[];
    for (var atomicMapping of specificData.mappingTable||[]){
      if(valueInString.indexOf!=undefined && valueInString.indexOf(atomicMapping.flowValue)!=-1){
        //console.log('MAP',valueIn,atomicMapping.flowValue,atomicMapping.replacementValue);
        //valueOut = valueIn.replace(atomicMapping.flowValue,atomicMapping.replacementValue);
        valueOut.push({sourceValue:valueIn,translatedValue:atomicMapping.replacementValue});
      }
    }
    if(valueOut.length==0){
      valueOut.push(valueIn)
    }
    return valueOut;
  },
  mapValues: function(source, specificData) {

    return new Promise((resolve, reject) => {
      var out;
      if (Array.isArray(source)){
        out=[];
        for(valueIn of source){
          out=out.concat(this.mapValue(valueIn, specificData));
        }
        //out=source.map(valueIn=>this.mapValue(valueIn, specificData));
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
