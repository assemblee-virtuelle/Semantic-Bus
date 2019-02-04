var moment = require('moment')



let decimalAdjust = function (type, value, exp) {
    // Si la valeur de exp n'est pas définie ou vaut zéro...
    if (typeof exp === 'undefined' || + exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Si la valeur n'est pas un nombre ou si exp n'est pas un entier...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Si la valeur est négative
    if (value < 0) {
      return this.decimalAdjust(type, -value, exp);
    }
    // Décalage
    value = value.toString().split('e');
    value = Math[type](+ (value[0] + 'e' + (value[1]
      ? (+ value[1] - exp)
      : -exp)));
    // Décalage inversé
    value = value.toString().split('e');
    return + (value[0] + 'e' + (value[1]
      ? (+ value[1] + exp)
      : exp));
  }

exports.formatDataUserGraph = function (data) {
    var Allday = []
    var AllDayObject = {}
    var lasttab = {}
    var golbalConsumption = 0
    var dataT = []
    return new Promise(function (resolve) {
      for (var i = 30; i >= 0; i--) {
        if (AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1] == null) {
          AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1] = {}
          AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1][moment().subtract(i, 'days')._d.getUTCMonth() + 1 + "-" + moment().subtract(i, 'days')._d.getUTCDate() + "-" + moment().subtract(i, 'days')._d.getFullYear()] = []
        } else {
          AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1][moment().subtract(i, 'days')._d.getUTCMonth() + 1 + "-" + moment().subtract(i, 'days')._d.getUTCDate() + "-" + moment().subtract(i, 'days')._d.getFullYear()] = []
        }
      }
      resolve(AllDayObject)
    })

    //   data.workspaces.forEach(function (workspaceData) {
    //     let workspace = workspaceData.workspace
    //     workspace.flow = 0
    //     workspace.pricing = 0
    //     if (workspace.consumption_history && workspace.consumption_history.length > 0) {
    //         //console.log("historique")
    //         workspace.consumption_history.forEach(function (cons) {
    //             golbalConsumption += cons.flow_size
    //             golbalConsumption = decimalAdjust('round', (golbalConsumption), -2);
    //             var d = new Date(cons.dates.created_at);
    //             for (month in AllDayObject) {
    //             for (b in AllDayObject[month]) {
    //                 if ((d.getUTCMonth() + 1) == month && d.getUTCDate() == b.split("-")[1]) {
    //                 var c = {}
    //                 if (workspace.name) {
    //                     var name = workspace.name
    //                 } else {
    //                     var name = "no name"
    //                 }
    //                 AllDayObject[month][b].push({
    //                     flow: cons.flow_size,
    //                     pricing: cons.price,
    //                     id: workspace._id,
    //                     name: workspace.name,
    //                     date: new Date(cons.dates.created_at)
    //                 })
    //                 }
    //             }
    //             }
    //         }.bind(this))
    //         }
    //     }.bind(this))


    //   for (var month in AllDayObject) {
    //     lasttab[month] = {}
    //     for (var conso in AllDayObject[month]) {
    //       lasttab[month][conso] = {}
    //       if (AllDayObject[month][conso].length > 0) {
    //         AllDayObject[month][conso].forEach(function (compo) {
    //           if (lasttab[month][conso][compo.id] == null) {
    //             lasttab[month][conso][compo.id] = {}
    //             lasttab[month][conso][compo.id].flow = compo.flow
    //             lasttab[month][conso][compo.id].name = compo.name
    //             lasttab[month][conso][compo.id].price = compo.pricing
    //             lasttab[month][conso][compo.id].date = compo.date
    //           } else {
    //             lasttab[month][conso][compo.id].flow += compo.flow
    //             lasttab[month][conso][compo.id].name = compo.name
    //             lasttab[month][conso][compo.id].price += compo.pricing
    //             lasttab[month][conso][compo.id].date = compo.date
    //           }
    //         })
    //       }
    //     };
    //   }
    //   for (var month in lasttab) {
    //     for (var conso in lasttab[month]) {
    //       var c = {}
    //       c["Day"] = conso
    //       for (var consoFinal in lasttab[month][conso]) {
    //         c[consoFinal] = {
    //           name: lasttab[month][conso][consoFinal].name,
    //           flow: lasttab[month][conso][consoFinal].flow,
    //           price: lasttab[month][conso][consoFinal].price,
    //           date: lasttab[month][conso][consoFinal].date
    //         }

    //       }
    //       dataT.push(c)
    //     }
    //   }
    //   //console.log("golbalConsumption", golbalConsumption)
    //   resolve({global: golbalConsumption, data: dataT, numberWorkspace: data.workspaces.length})
    // })
  }


  exports.formatDataWorkspaceGraph = function (dataInner) {
    var compteurCompoflow = {}
    var day = []
    var lasttab = {},
    AllDayObject = {}

    var data = {};
    data.data = []
    data.componentNumber = 0;
    data.globalPrice = 0
    data.globalMo = 0
    data.total = 0
    return new Promise(function (resolve, reject) {
      for (var i = 30; i >= 0; i--) {
        if (AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1] == null) {
          AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1] = {}
          AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1][moment().subtract(i, 'days')._d.getUTCMonth() + 1 + "-" + moment().subtract(i, 'days')._d.getUTCDate() + "-" + moment().subtract(i, 'days')._d.getFullYear()] = []
        } else {
          AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1][moment().subtract(i, 'days')._d.getUTCMonth() + 1 + "-" + moment().subtract(i, 'days')._d.getUTCDate() + "-" + moment().subtract(i, 'days')._d.getFullYear()] = []
        }
      }
      dataInner.forEach((wrokflowByDay)=>{
        let total = 0;
        wrokflowByDay.components.forEach(function (component) {
          console.log("COMPONENT", component)
          total += component.totalPrice;
          data.componentNumber ++
          data.globalMo += component.moCount
          data.globalPrice += component.totalPrice
          compteurCompoflow[component.module] = 0
            var d = new Date(component.roundDate);
            for (month in AllDayObject) {
              for (b in AllDayObject[month]) {
                if ((d.getUTCMonth() + 1) == month && d.getUTCDate() == b.split("-")[1]) {
                  var c = {}
                  if (component.name) {
                    var name = component.name
                  } else {
                    var name = "no name"
                  }
                  AllDayObject[month][b].push({
                    day: d.getDate(),
                    fullDate: d,
                    pricing: component.componentPrice,
                    price: component.totalPrice,
                    data: component.moCount,
                    id: component.componentId,
                    label: component.componentModule,
                    name: name,
                    date: component.roundDate
                  })

                }
              }
            }
      })
      if(total> data.total) data.total = total
    })

      for (var month in AllDayObject) {
        lasttab[month] = {}
        for (var conso in AllDayObject[month]) {
          lasttab[month][conso] = {}
          if (AllDayObject[month][conso].length > 0) {
            AllDayObject[month][conso].forEach(function (compo) {
              if (lasttab[month][conso][compo.id] == null) {
                lasttab[month][conso][compo.id] = {}
                lasttab[month][conso][compo.id].data = compo.data
                lasttab[month][conso][compo.id].label = compo.label
                lasttab[month][conso][compo.id].name = compo.name
                lasttab[month][conso][compo.id].day = compo.day
                lasttab[month][conso][compo.id].fullDate = compo.fullDate
                lasttab[month][conso][compo.id].price = compo.price
                lasttab[month][conso][compo.id].pricing = compo.pricing
              } else {
                lasttab[month][conso][compo.id].data += compo.data
                lasttab[month][conso][compo.id].price += compo.price
                lasttab[month][conso][compo.id].id = compo.id
                lasttab[month][conso][compo.id].name = compo.name
                lasttab[month][conso][compo.id].day = compo.day
                lasttab[month][conso][compo.id].fullDate = compo.fullDate
                lasttab[month][conso][compo.id].pricing = compo.pricing
              }
            })
          }
        }
      };

      console.log("LAST TAB", lasttab)

      for (var month in lasttab) {
        for (var conso in lasttab[month]) {
          var c = {}
          let y0 = 0;
          c.components =[];
          c["Day"] = conso;
          for (var consoFinal in lasttab[month][conso]) {
            console.log("CONSO", consoFinal, lasttab[month][conso][consoFinal].pricing)
            c.components.push({
              pricing: lasttab[month][conso][consoFinal].pricing,
              label: lasttab[month][conso][consoFinal].label,
              price: lasttab[month][conso][consoFinal].price,
              datasize: lasttab[month][conso][consoFinal].data,
              name: lasttab[month][conso][consoFinal].name,
              id: consoFinal,
              fullDate: lasttab[month][conso][consoFinal].fullDate,
              y0: +y0,
              y1: (y0 += lasttab[month][conso][consoFinal].price)
            })
          }
          data.data.push(c)
        }
      }
      resolve(data)
    })
  }
