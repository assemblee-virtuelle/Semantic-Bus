module.exports = {
  type: 'Filter',
  description: 'filter le flux',
  editor: 'filter-editor',
  sift: require('sift'),


  pull: function(data, flowData) {

    //console.log('Filter| pull : ', data, ' | ', flowData);
    return new Promise((resolve, reject) => {
      /*var secondaryFlowData = this.sift({
        componentId: data.specificData.secondaryComponentId
      }, flowData)[0].data;
      var primaryFlowData = this.sift({
        componentId: data.specificData.primaryComponentId
      }, flowData)[0].data;

      console.log('joinByField | primaryFlowData :', primaryFlowData);
      console.log('joinByField | secondaryFlowData :',secondaryFlowData);*/
      //console.log(primaryFlowData.componentId);
      //console.log(secondaryFlowData);
      //console.log(this.sift({ agregName: 'Max - ORSET'}, secondaryFlowData));
      //console.log('Filter | filterString | ',JSON.parse(data.specificData.filterString));
      //console.log('Filter | flowData[0].data | ',JSON.stringify(flowData[0].data));
     //console.log('Filter | flowData[0].data | ',flowData[0].data);




      var resultData = this.sift(JSON.parse(data.specificData.filterString), flowData[0].data);
      //console.log('result |',resultData);


      resolve({
        data: resultData
      });
    })
  }
}
