"use strict";
module.exports = {
  type: 'Deeper Focus Opening Bracket',
  description: 'début de traitement d\'un niveau de profondeur du flux ',
  editor:'deeper-focus-opening-bracket-editor',
  graphIcon:'deeperBrackets.png',
  tags:[
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleUtilitiesComponents'
  ],


  pull: function(data,flowData) {

    return new Promise((resolve, reject) => {
      //console.log('dfob | pull : ',data,' | ',flowData);
      var dfob = flowData[0].dfob==undefined?[]:flowData.dfob;
      let dfobPath=data.specificData.dfobPath==undefined?'':data.specificData.dfobPath
      dfob.push(dfobPath);
      //console.log('Deeper Focus Opening Bracket |  ',dfob);
      resolve({data:flowData[0].data,dfob:dfob});
    })
  }
}
