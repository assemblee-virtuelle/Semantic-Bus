var moment = require('moment')

exports.formatDataUserGraph = function (workspaces) {
  const AllDayObject = {};
  const lasttab = {};
  const data = {};
  data.data = [];
  data.workspaceNumber = 0;
  data.golbalConsumption = 0;
  data.golbalConsumptionMo = 0;
  return new Promise(resolve => {    
    for (var i = 30; i >= 0; i--) {
      if (AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1] == null) {
        AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1] = {}
        AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1][moment().subtract(i, 'days')._d.getUTCMonth() + 1 + '-' + moment().subtract(i, 'days')._d.getUTCDate() + '-' + moment().subtract(i, 'days')._d.getFullYear()] = []
      } else {
        AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1][moment().subtract(i, 'days')._d.getUTCMonth() + 1 + '-' + moment().subtract(i, 'days')._d.getUTCDate() + '-' + moment().subtract(i, 'days')._d.getFullYear()] = []
      }
    }

    workspaces.forEach((workspaceDetails) => {
        data.workspaceNumber ++
        data.golbalConsumption  += workspaceDetails.totalPrice
        data.golbalConsumptionMo += workspaceDetails.totalMo
        
        const d = new Date(workspaceDetails.roundDate);
        for (month in AllDayObject) {
          for (b in AllDayObject[month]) {
              if ((d.getUTCMonth() + 1) == month && d.getUTCDate() == b.split("-")[1]) {
              AllDayObject[month][b].push({
                  flow: workspaceDetails.totalMo,
                  pricing: workspaceDetails.totalPrice,
                  id: workspaceDetails.id,
                  name: workspaceDetails.name ? workspaceDetails.name : 'no name',
                  date: new Date(workspaceDetails.roundDate),
              })
              }
            }
        }
    })
    
    for (var month in AllDayObject) {
      lasttab[month] = {}
      for (var conso in AllDayObject[month]) {
        lasttab[month][conso] = {}
        if (AllDayObject[month][conso].length > 0) {
          AllDayObject[month][conso].forEach(function (compo) {
            if (lasttab[month][conso][compo.id] == null) {
              lasttab[month][conso][compo.id] = {}
              lasttab[month][conso][compo.id].flow = compo.flow
              lasttab[month][conso][compo.id].id = compo.id
              lasttab[month][conso][compo.id].name = compo.name
              lasttab[month][conso][compo.id].price = compo.pricing
              lasttab[month][conso][compo.id].date = compo.date
            } else {
              lasttab[month][conso][compo.id].flow += compo.flow
              lasttab[month][conso][compo.id].id = compo.id
              lasttab[month][conso][compo.id].name = compo.name
              lasttab[month][conso][compo.id].price += compo.pricing
              lasttab[month][conso][compo.id].date = compo.date
            }
          })
        }
      };
    }

    for (var month in lasttab) {

      for (var conso in lasttab[month]) {
        let y0 = 0;
        let c = {};
        c.workspaces = [];
        c["Day"] = conso;
        for (let consoFinal in lasttab[month][conso]) {
          c.workspaces.push({
            name: lasttab[month][conso][consoFinal].name,
            id: lasttab[month][conso][consoFinal].id,
            flow: lasttab[month][conso][consoFinal].flow,
            price: lasttab[month][conso][consoFinal].price,
            date: lasttab[month][conso][consoFinal].date,
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

exports.formatDataWorkspaceGraph = function (dataInner) {
  let compteurCompoflow = {}
  let lasttab = {}
  let AllDayObject = {}

  let data = {}
  data.data = []
  data.componentNumber = 0
  data.globalPrice = 0
  data.globalMo = 0
  data.total = 0
  return new Promise(function (resolve, reject) {
    for (var i = 30; i >= 0; i--) {
      if (AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1] == null) {
        AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1] = {}
        AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1][moment().subtract(i, 'days')._d.getUTCMonth() + 1 + '-' + moment().subtract(i, 'days')._d.getUTCDate() + '-' + moment().subtract(i, 'days')._d.getFullYear()] = []
      } else {
        AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1][moment().subtract(i, 'days')._d.getUTCMonth() + 1 + '-' + moment().subtract(i, 'days')._d.getUTCDate() + '-' + moment().subtract(i, 'days')._d.getFullYear()] = []
      }
    }
    dataInner.forEach((workflowByDay) => {
      let total = 0
      workflowByDay.components.forEach(function (component) {
        total += component.totalPrice
        data.componentNumber++
        data.globalMo += component.moCount
        data.globalPrice += component.totalPrice
        compteurCompoflow[component.module] = 0
        var d = new Date(component.roundDate)
        for (month in AllDayObject) {
          for (b in AllDayObject[month]) {
            if ((d.getUTCMonth() + 1) == month && d.getUTCDate() == b.split('-')[1]) {
              var c = {}
              if (component.name) {
                var name = component.name
              } else {
                var name = 'no name'
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
      if (total > data.total) data.total = total
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

    for (var month in lasttab) {
      for (var conso in lasttab[month]) {
        var c = {}
        let y0 = 0
        c.components = []
        c['Day'] = conso
        for (var consoFinal in lasttab[month][conso]) {
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
