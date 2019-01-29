"use strict";
class Filter {
  constructor() {
    this.type= 'Filter';
    this.description= 'Filtrer le flux.';
    this.editor= 'filter-editor';
    this.sift= require('sift');
    this.siftDate = require('sift-date');
    this.stringReplacer= require('../sharedLibrary/stringReplacer.js');
    this.objectTransformation = require('../sharedLibrary/objectTransformation.js');
    this.graphIcon='Filter.png';
    this.tags=[
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleQueryingComponents'
    ];
  }

  pull(data, flowData, pullParams) {
    this.sift.use(this.siftDate);
    let test =this.sift({"mandate-start":{$older: new Date('2014-01-01')}}, [{"mandate-start":new Date('2013-01-01')}, {"mandate-start":new Date('2015-01-01')}]);

    return new Promise((resolve, reject) => {
      //let usableData=JSON.parse(JSON.stringify(flowData[0].data));
      let usableData=flowData[0].data;
      let filterString=data.specificData.filterString;
      filterString = filterString.replace(/£./g,'$.')
      let filter=JSON.parse(filterString);
      let filterResult=this.objectTransformation.execute(pullParams,filter);
      var resultData = this.sift(filterResult, usableData);
      resolve({
        data: resultData
      });
    })
  }
}

module.exports = new Filter();
