module.exports = {
  type: 'Flow Agregator',
  description: 'agréger plusieurs flux pour n en former qu un',
  editor: 'simple-agregator-editor',
  graphIcon:'default.png',
  sift: require('sift'),


  pull: function(data, flowData) {
    //console.log('Flow Agregator | pull : ',data,' | ',flowData);
    return new Promise((resolve, reject) => {
      var resultFlow = [];
      //console.log(data);
      for (flow of flowData) {
        for (record of flow.data) {
          var filter = {};
          var everExistingData = [];
          if (data.specificData.unicityFields != undefined && data.specificData.unicityFields.length>0) {
            for (unicityField of data.specificData.unicityFields) {
              //console.log(unicityField.field,record);
              if (record[unicityField.field] != undefined) {
                filter[unicityField.field] = record[unicityField.field];
              }
            }
            //console.log(filter);
            everExistingData = this.sift(filter, resultFlow);
          }

          //console.log(filter);
          //console.log(everExistingData);
          if (everExistingData.length > 0) {
            //console.log('unicite |', everExistingData);
            var oldRecord = everExistingData[0];
            //console.log(resultFlow.indexOf(everExistingData[0]));
            for (key in record) {
              if (oldRecord[key] == undefined) {
                oldRecord[key] = record[key];
              }
            }
            resultFlow[resultFlow.indexOf(everExistingData[0])] = oldRecord;
          } else {
            resultFlow.push(record);
          }
        }


        //console.log('Flow Agregator | result flow |  ',flow);
        //resultFlow = resultFlow.concat(flow.data)
      }
      //console.log('Flow Agregator | result total |  ',resultFlow);
      resolve({
        data: resultFlow
      });
    })
  }
}
