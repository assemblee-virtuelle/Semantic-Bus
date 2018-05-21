"use strict";
module.exports = {
  type: 'Filter',
  description: 'filter le flux',
  editor: 'filter-editor',
  sift: require('sift'),
  graphIcon:'filter.png',
  tags:[
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleQueryingComponents'
  ],

  pull: function(data, flowData) {

    //console.log('Filter| pull : ', JSON.parse(data.specificData.filterString), ' | ', JSON.stringify(flowData[0].data));
    let usableData=JSON.parse(JSON.stringify(flowData[0].data));
    return new Promise((resolve, reject) => {

      //console.log('before filter',usableData);
      var resultData = this.sift(JSON.parse(data.specificData.filterString), usableData);
      //console.log('result |',resultData);


      resolve({
        data: resultData
      });
    })
  }
}
