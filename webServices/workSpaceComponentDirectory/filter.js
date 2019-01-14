"use strict";
module.exports = {
  type: 'Filter',
  description: 'Filtrer le flux.',
  editor: 'filter-editor',
  sift: require('sift'),
  siftDate : require('sift-date'),
  stringReplacer: require('../sharedLibrary/stringReplacer.js'),
  objectTransformation : require('../sharedLibrary/objectTransformation.js'),
  graphIcon:'Filter.png',
  tags:[
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleQueryingComponents'
  ],

  pull: function(data, flowData, pullParams) {
    this.sift.use(this.siftDate);
    let test =this.sift({"mandate-start":{$older: new Date('2014-01-01')}}, [{"mandate-start":new Date('2013-01-01')}, {"mandate-start":new Date('2015-01-01')}]);
    // console.log('XXXXXXXXXXXXXXXXXXxx',test);
    //console.log('Filter| pull : ', JSON.parse(data.specificData.filterString), ' | ', JSON.stringify(flowData[0].data));

    return new Promise((resolve, reject) => {
      //let usableData=JSON.parse(JSON.stringify(flowData[0].data));
      let usableData=flowData[0].data;
      let filterString=data.specificData.filterString;
      filterString = filterString.replace(/£./g,'$.')
      let filter=JSON.parse(filterString);
      // console.log('Filter pullParams',pullParams);
      // console.log('Filter filter',filter);
      let filterResult=this.objectTransformation.execute(pullParams,filter);
      // console.log('Filter',JSON.stringify(filterResult));
      //console.log('Filter',data.specificData.filterString,pullParams);
      // data.specificData.filterString=this.stringReplacer.execute(data.specificData.filterString,pullParams,usableData)
      // console.log('Filter',filter,usableData);
      var resultData = this.sift(filterResult, usableData);
      //console.log('result |',resultData);


      resolve({
        data: resultData
      });
    })
  }
}
