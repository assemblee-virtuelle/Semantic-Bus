<
graph - of -use >
  <
  div class = "containerV"
style = "flex-grow:1" >
  <
  div style = "text-align: center; padding: 5%;" >
  <
  div >
  Consomation sur vos 30 jours <
  /div> <
  /div> <
  /div> <
  div style = "display: flex;flex-direction: column; align-items: center;" >
  <
  div class = "item-flex" >
  <
  canvas id = "myChart"
width = "700" > < /canvas> <
  /div> <
  div class = "item-flex;" >
  <
  zenTable style = "flex:1"
ref = "componentZenTable"
disallownavigation = "true" >
  <
  yield to = "header" >
  <
  div > consomation < /div> <
  div > pricing < /div> <
  /yield> <
  yield to = "row" >
  <
  div style = "width:30%" > {
    name
  } < /div> <
  div style = "width:70%" > {
    description
  } < /div> <
  /yield> <
  /zenTable> <
  /div> <
  /div>

  <
  script >

  Object.defineProperty(this, 'data', {
    set: function (data) {

      //this.innerData=new Proxy(data, arrayChangeHandler);
      this.innerData = data;
      this.update();

      //this.reportCss(); this.reportFlex(); console.log(this.items,data);
    }.bind(this),
    get: function () {
      return this.innerData;
    },
    configurable: true
  });

this.on('mount', function () {
    console.log("in chartjs table ==============================+>")
    var barChartData = {}
    barChartData.datasets = [];
    barChartData.labels = [];
    var consumption_by_day = {};
    var c = {}
    var r = 10
    var g = 10
    var b = 50
    var compteurCompoflow = {}

    ///traitement en fonction du jour 
    this.innerData.components.forEach(function (component) {
      if (component.consumption_history.length > 0) {
        compteurCompoflow[component.module] = 0
        component.consumption_history.forEach(function (consumption_history) {
          var d = new Date(consumption_history.dates.created_at);

          if (component.name) {
            var name = component.name
          } else {
            var name = "no name"
          }
          if (barChartData.labels.indexOf(d.getDate()) == -1) {
            barChartData.labels.push(d.getDate())
            consumption_by_day[d.getDate()] = []
            consumption_by_day[d.getDate()].push({
              day: d.getDate(),
              data: consumption_history.flow_size,
              id: component._id,
              label: component.module,
              name: name,
              date: consumption_history.dates.created_at
            })

          } else {
            consumption_by_day[d.getDate()].push({
              day: d.getDate(),
              data: consumption_history.flow_size,
              id: component._id,
              label: component.module,
              name: name,
              date: consumption_history.dates.created_at
            })
          }
        })
      }
    })


    // aggregation des flux 
    var lasttab = {}
    for (var conso in consumption_by_day) {
      lasttab[conso] = {}
      consumption_by_day[conso].forEach(function (compo) {
        if (lasttab[conso][compo.label] == null) {
          lasttab[conso][compo.label] = {}
          lasttab[conso][compo.label].data = compo.data
          lasttab[conso][compo.label].id = compo.id
          lasttab[conso][compo.label].name = compo.name
          lasttab[conso][compo.label].day = compo.day
        }
        lasttab[conso][compo.label].data += compo.data
        lasttab[conso][compo.label].id = compo.id
        lasttab[conso][compo.label].name = compo.name
        lasttab[conso][compo.label].day = compo.day
      })
    }


    /// mis des data dans un meme tableau
    var test = []
    for (var conso in lasttab) {
      for (var consoFinal in lasttab[conso]) {
        test.push({
          day: lasttab[conso][consoFinal].day,
          datasize: lasttab[conso][consoFinal].data,
          module: consoFinal,
          name: lasttab[conso][consoFinal].name,
          id: lasttab[conso][consoFinal].id
        }) //console.log(Object.keys(lasttab[conso],lasttab[conso][consoFinal]))
      }
    }

    /// groupe by des component ( reduce traite de en ligne de gauche a droite les data du table et applique un callback
    // qui prend en params l'element 1 et 2)
    var groupBy = function (xs, key) {
      return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push({
          size: x.datasize,
          name: x.name,
          module: x.module,
          id: x.id
        });
        return rv;
      }, {});
    };

    console.log(test)
    var lastObject = groupBy(test, 'id')
    /// reconstruction de l'object attendu 
    barChartData.labels.push(23, 24)
    for (var lastObj in lastObject) {
      console.log("in for")
      //console.log(lastObject[lastObj][0])
      barChartData.datasets.push({
        label: lastObject[lastObj][0].id + " : " + lastObject[lastObj][0].module + "(" + lastObject[lastObj][0].name + ")",
        data: [lastObject[lastObj][0].size],
        backgroundColor: "rgba(" + r + "," + g + "," + b + "," + "0.7)"
      });
      r += 95;
      g += 30
      b += 20
    }


    console.log(barChartData)
    var canvas = document.getElementById("myChart");
    var ctx = canvas.getContext("2d");
    var chart = new Chart(ctx, {
      type: 'bar',
      data: barChartData,
      options: {
        animation: {
          duration: 10,
        },
        tooltips: {
          mode: 'label',
          callbacks: {
            label: function (tooltipItem, data) {
              return data.datasets[tooltipItem.datasetIndex].label + ": " + tooltipItem.yLabel;
            }
          }
        },
        responsive: false,
        scales: {
          xAxes: [{
            stacked: true,
            gridLines: {
              display: false
            },
          }],
          yAxes: [{
            stacked: true,
            ticks: {
              callback: function (value) {
                return value;
              },
            },
          }],
        }, // scales
        legend: {
          display: true
        }
      } // options
    });

    canvas.onclick = function (evt) {
      var activePoint = chart.getElementAtEvent(evt)[0];
      var data = activePoint._chart.controller.chart.config.data;
      var datasetIndex = activePoint._datasetIndex;
      var labelsIndex = activePoint._index;
      var lab = data.labels[labelsIndex]
      var label = data.datasets[datasetIndex].label;
      var value = data.datasets[datasetIndex].data[activePoint._index];
      var compoObject = {}
      for (var conso in consumption_by_day) {
        if (conso == lab) {
          compoObject[lab] = {}
          consumption_by_day[lab].forEach(function (compo) {
            var id = label.split(":")[0]
            console.log(id)
            if (compo.label == label.split("(")[0]) {

            }
            if (compoObject[lab][label] == null) {
              compoObject[lab][label] = []
              if (compo.label == label) {
                compoObject[lab][label].push(compo)
              }
            } else {
              if (compo.label == label) {
                compoObject[lab][label].push(compo)
              }
            }
          })
        }
      }
    }
  })


  <
  /script>

  <
  /graph-of-use>




var n = 4, // The number of series.
  m = 58; // The number of values per series.

function changed() {
  timeout.stop();
  if (this.value === "grouped") transitionGrouped();
  else transitionStacked();
}

function transitionGrouped() {
  y.domain([0, yMax]);

  rect.transition()
    .duration(500)
    .delay(function (d, i) {
      return i * 10;
    })
    .attr("x", function (d, i) {
      return x(i) + x.bandwidth() / n * this.parentNode.__data__.key;
    })
    .attr("width", x.bandwidth() / n)
    .transition()
    .attr("y", function (d) {
      return y(d[1] - d[0]);
    })
    .attr("height", function (d) {
      return y(0) - y(d[1] - d[0]);
    });
}

function transitionStacked() {
  y.domain([0, y1Max]);

  rect.transition()
    .duration(500)
    .delay(function (d, i) {
      return i * 10;
    })
    .attr("y", function (d) {
      return y(d[1]);
    })
    .attr("height", function (d) {
      return y(d[0]) - y(d[1]);
    })
    .transition()
    .attr("x", function (d, i) {
      return x(i);
    })
    .attr("width", x.bandwidth());
}

// Returns an array of m psuedorandom, smoothly-varying non-negative numbers.
// Inspired by Lee Byron’s test data generator.
// http://leebyron.com/streamgraph/
function bumps(m) {
  var values = [],
    i, j, w, x, y, z;

  // Initialize with uniform random values in [0.1, 0.2).
  for (i = 0; i < m; ++i) {
    values[i] = 0.1 + 0.1 * Math.random();
  }

  // Add five random bumps.
  for (j = 0; j < 5; ++j) {
    x = 1 / (0.1 + Math.random());
    y = 2 * Math.random() - 0.5;
    z = 10 / (0.1 + Math.random());
    for (i = 0; i < m; i++) {
      w = (i / m - y) * z;
      values[i] += x * Math.exp(-w * w);
    }
  }

  // Ensure all values are positive.
  for (i = 0; i < m; ++i) {
    values[i] = Math.max(0, values[i]);
  }

  return values;
}
// The xz array has m elements, representing the x-values shared by all series.
// The yz array has n elements, representing the y-values of each of the n series.
// Each yz[i] is an array of m non-negative numbers representing a y-value for xz[i].
// The y01z array has the same structure as yz, but with stacked [y₀, y₁] instead of y.
this.on('mount', function () {

  d3.selectAll("input")
    .on("change", changed);

  var xz = d3.range(m),
    yz = d3.range(n).map(function () {
      return bumps(m);
    }),
    y01z = d3.stack().keys(d3.range(n))(d3.transpose(yz)),
    yMax = d3.max(yz, function (y) {
      return d3.max(y);
    }),
    y1Max = d3.max(y01z, function (y) {
      return d3.max(y, function (d) {
        return d[1];
      });
    });
  console.log("xz", xz)

  var svg = d3.select("svg"),
    margin = {
      top: 40,
      right: 10,
      bottom: 20,
      left: 10
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  console.log(g)


  var x = d3.scaleBand()
    .domain(xz)
    .rangeRound([0, width])
    .padding(0.08);
  console.log(x)

  var y = d3.scaleLinear()
    .domain([0, y1Max])
    .range([height, 0]);
  console.log(y)

  var color = d3.scaleOrdinal()
    .domain(d3.range(n))
    .range(d3.schemeCategory20c);
  console.log(color)

  var series = g.selectAll(".series")
    .data(y01z)
    .enter().append("g")
    .attr("fill", function (d, i) {
      return color(i);
    });
  console.log(series)

  var rect = series.selectAll("rect")
    .data(function (d) {
      return d;
    })
    .enter().append("rect")
    .attr("x", function (d, i) {
      return x(i);
    })
    .attr("y", height)
    .attr("width", x.bandwidth())
    .attr("height", 0);
  console.log(rect)

  rect.transition()
    .delay(function (d, i) {
      return i * 10;
    })
    .attr("y", function (d) {
      return y(d[1]);
    })
    .attr("height", function (d) {
      return y(d[0]) - y(d[1]);
    });

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
      .tickSize(0)
      .tickPadding(6));

  if (this.simulation == undefined) {
    /*
    this.simulation = d3.forceSimulation(this.graph.nodes).force("charge", d3.forceManyBody().strength(-1000)).force("link", d3.forceLink([]).id(function (d) {
        return d.id // cela semble désigner l'id des noeud (comment les liens retrouvent la propriété id des noeud) ne pas toujours chercher a comprendre comment d3 marche, mais c est necessaire )
    }).distance(200)).force("x", d3.forceX()).force("y", d3.forceY()).alphaTarget(1).on("tick", this.ticked);
    */

    this.simulation = d3.forceSimulation().velocityDecay(0.9).force('link', d3.forceLink(this.graph.links).id(function (d) {
      return d.id // ( ne pas toujours chercher a comprendre comment d3 marche, mais c est necessaire )
    })).force("collide", d3.forceCollide().radius(30).iterations(2)).on("tick", this.ticked);

  }
})
var timeout = d3.timeout(function () {
  d3.select("input[value=\"grouped\"]")
    .property("checked", true)
    .dispatch("change");
}, 2000);




///traitement en fonction du jour 
this.innerData.components.forEach(function (component) {
  if (component.consumption_history.length > 0) {
    console.log()
    compteurCompoflow[component.module] = 0
    component.consumption_history.forEach(function (consumption_history) {
      var d = new Date(consumption_history.dates.created_at);
      var c = {}
      if (component.name) {
        var name = component.name
      } else {
        var name = "no name"
      }
      if (barChartData.labels.indexOf(d.getDate()) == -1) {
        barChartData.labels.push(d.getDate())
        consumption_by_day[d.getDate()] = {}
        consumption_by_day[d.getDate()][component.module] = {
          day: d.getDate(),
          data: consumption_history.flow_size,
          id: component._id,
          label: component.module,
          name: name,
          date: consumption_history.dates.created_at
        }

      } else {

        consumption_by_day[d.getDate()][component.module] = {
          day: d.getDate(),
          data: consumption_history.flow_size,
          id: component._id,
          label: component.module,
          name: name,
          date: consumption_history.dates.created_at
        }
      }
    })
  }
})

console.log(consumption_by_day)

//console.log(consumption_by_day)
// aggregation des flux 
var finalData = []
for (var conso in consumption_by_day) {
  consumption_by_day[conso].Day = conso
  finalData.push(consumption_by_day[conso])
}

console.log(finalData)



