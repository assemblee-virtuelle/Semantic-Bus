let user_model = require("../lib/core/models").user;
let workspace_model = require("../lib/core/models").workspace;
let workspaceComponent_model = require("../lib/core/models").workspaceComponent;
let historiqueModel = require("../lib/core/models").historique;
let cache_model = require("../lib/core/models").cache;
let config = require("../configuration");
let graphTraitement = require("../utils/graph-traitment");
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

const decimalAdjust = function(type, value, exp) {
  // Si la valeur de exp n'est pas définie ou vaut zéro...
  if (typeof exp === "undefined" || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  // Si la valeur n'est pas un nombre ou si exp n'est pas un entier...
  if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
    return NaN;
  }
  // Si la valeur est négative
  if (value < 0) {
    return this.decimalAdjust(type, -value, exp);
  }

  // Décalage
  value = value.toString().split("e");
  value = Math[type](+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)));
  // Décalage inversé
  value = value.toString().split("e");
  return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp));
};

exports.userGraph = function(userId) {
  return new Promise((resolve, reject) => {
    historiqueModel.aggregate(
      [
        {
          $group: {
            _id: {
              workspaceId: "$workspaceId",
              userId: userId,
              roundDate: "$roundDate"
            },
            totalPrice: { $sum: "$totalPrice" },
            totalMo: { $sum: "$moCount" },
            workspaces: { $push: "$$ROOT" }
          }
        }
      ],
      function(err, result) {
        if (err) {
          console.log(err);
        } else {
          graphTraitement.formatDataUserGraph().then(graphData => {
            let final_graph = [];
            let globalPrice = 0;
            let tableId = []
            let workspaceNumber = 0;
            let globalMo = 0;
            let c = {};
            for (month in graphData) {
              for (day in graphData[month]) {
                let y0 = 0;
                let final_data_object = {};
                final_data_object.Day = day;
                final_data_object.total = 0;
                final_data_object.ages = [];
                let i = 0;
                result.forEach(res => {
                let key;
                  if (
                    new Date(parseInt(res._id.roundDate)).getUTCMonth() + 1 ==
                      month &&
                    new Date(parseInt(res._id.roundDate)).getUTCDate() ==
                      day.split("-")[1]
                  ) {
                    
                    tableId.push(res._id.workspaceId)
                    final_data_object.ages.push({
                      ID: res._id.workspaceId,
                      name: res.workspaces[0].workspaceName,
                      price: decimalAdjust("round", res.totalPrice, -4),
                      flow: decimalAdjust("round", res.totalMo, -4),
                      y0: +y0,
                      y1: (y0 += res.totalPrice)
                    });
                    final_data_object.total += res.totalPrice;
                    workspaceNumber += 1;
                    globalPrice += res.totalPrice;
                    globalMo += res.totalMo;
                  }
                });
                final_graph.push(final_data_object);
              }
            }
            resolve({
              tableId: tableId,
              globalPrice: globalPrice,
              data: final_graph,
              globalMo: globalMo,
              numberWorkspace: workspaceNumber
            });
          });
        }
      }
    );
  });
};



// 59ebe7fc538e7c0a1515ee59
// :
// datasize
// :
// 1.174374
// fullDate
// :
// "2018-02-09T23:12:00.228Z"
// id
// :
// "59ebe7fc538e7c0a1515ee59"
// label
// :
// "filter"
// name
// :
// "no name"
// price
// :
// 4.697496
// pricing

workspaceGraph = function(userId) {
  return new Promise((resolve, reject) => {
    historiqueModel.aggregate(
      [
        {
          $group: {
            _id: {
              workspaceId: "$workspaceId",
              userId: userId,
              workflowComponentId : "$workflowComponentId",
              roundDate: "$roundDate"
            },
            totalPrice: { $sum: "$totalPrice" },
            totalMo: { $sum: "$moCount" },
            workspaces: { $push: "$$ROOT" }
          }
        }
      ],
      function(err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log(result)
          graphTraitement.formatDataUserGraph().then(graphData => {
            let final_graph = [];
            let globalPrice = 0;
            let tableId = []
            let componentNumber = 0;
            let globalMo = 0;
            let c = {};
            for (var month in graphData) {
              for (var day in graphData[month]) {
                let y0 = 0;
                let final_data_object = {};
                final_data_object.Day = day;
                final_data_object.total = 0;
                final_data_object.ages = [];
                let i = 0;
                result.forEach(res => {
                let key;
                  if (
                    new Date(parseInt(res._id.roundDate)).getUTCMonth() + 1 ==
                      month &&
                    new Date(parseInt(res._id.roundDate)).getUTCDate() ==
                      day.split("-")[1]
                  ) {
                      tableId.push(res.workspaces[0].workflowComponentId)
                      final_data_object.ages.push({
                        name: res.workspaces[0].componentName,
                        ID: res.workspaces[0].workflowComponentId,
                        module: res.workspaces[0].componentModule,
                        componentPrice: res.workspaces[0].componentPrice,
                        price: decimalAdjust("round", res.totalPrice, -4),
                        flow: decimalAdjust("round", res.totalMo, -4),
                        y0: +y0,
                        y1: (y0 += res.totalPrice)
                      });
                      final_data_object.total += res.totalPrice;
                      componentNumber += 1;
                      globalPrice += res.totalPrice;
                      globalMo += res.totalMo;
                    }
                })
                final_graph.push(final_data_object);
              }
            }
            console.log(tableId, globalPrice, globalMo, componentNumber)
            resolve({
              tableId: tableId,
              globalPrice: globalPrice,
              data: final_graph,
              globalMo: globalMo,
              componentNumber: componentNumber
            });  
          })
        }
      })
    })
  }

// workspaceGraph('5944649a1041c10021f97722')