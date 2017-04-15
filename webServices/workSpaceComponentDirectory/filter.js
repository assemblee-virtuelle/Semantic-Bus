module.exports = {
  type: 'Filter',
  description: 'filter le flux',
  editor: 'filter-editor',
  sift: require('sift'),


  test: function(data, flowData) {

    //console.log('Filter| test : ', data, ' | ', flowData);
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
console.log(data.specificData.filterString);


      var resultData = this.sift(JSON.parse(data.specificData.filterString), flowData[0].data);
      //console.log(resultData);


      resolve({
        data: resultData
      });
    })
  }
}
