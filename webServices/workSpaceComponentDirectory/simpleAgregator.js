module.exports = {
  type: 'Flow Agregator',
  description: 'agréger plusieurs flux pour n en former qu un',
  editor:'simple-agregator-editor',


  test: function(data,flowData) {
    //console.log('Flow Agregator | test : ',data,' | ',flowData);
    return new Promise((resolve, reject) => {
      var resultFlow =[];
      for (flow of flowData){
        console.log('Flow Agregator | result flow |  ',flow);
        resultFlow=resultFlow.concat(flow)
      }
      //console.log('Flow Agregator | result total |  ',resultFlow);
      resolve(resultFlow);
    })
  }
}
