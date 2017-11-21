<graph-of-use class="containerV">
  <div class="containerH" style="flex-grow:1">
    <div class="card">
      <h4>Credits consumed yesterday</h4>
      <span class="second-title-card">{yesterdayCredit} €</span>
    </div>
    <div class="card">
      <h4>Credits consumed last 30 days</h4>
      <span class="second-title-card">{totalConsume} €</span>
    </div>
    <div class="card">
      <h4>Running Components </h4>
      <span class="second-title-card">{runningComponent}</span>
    </div>
  </div>
</div>
<div style="text-align: center; padding: 5%;">
  <div>
    Consomation sur vos 30 jours
  </div>
</div>
<div class="containerH scrollable">
    <svg id="stacked"></svg>
</div>
</div>
</div>
<style>

.card {
background: #fff;
border-radius: 5px;
font-family: "adelle-sans", sans-serif;
font-weight: 100;
margin: 48px auto;
width: 20rem;
padding: 20px;
text-align: center;
}

.second-title-card {}

form {
font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
position: absolute;
left: 10px;
top: 10px;
}

label {
display: block;
}

.text {
font-size: 10px;
fill: white;
font-family: sans-serif;
}

div.tooltip {
position: absolute;
text-align: left;
width: 200px;
height: 70px;
padding: 10px;
font: 12px sans-serif;
background: lightsteelblue;
border: 0;
border-radius: 8px;
pointer-events: none;
}

</style>
<script>
this.yesterdayCredit = 0
this.totalConsume = 0
this.runningComponent = 0
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

var barChartData = {}
barChartData.datasets = [];
barChartData.labels = [];
var consumption_by_day = {};
var c = {}
  var r = 10
    var g = 10
      var b = 50
        var compteurCompoflow = {}
          var day = []
            var lasttab = {},
              Allday = [],
              AllDayObject = {}

            function decimalAdjust(type, value, exp) {
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
                return decimalAdjust(type, -value, exp);
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

            this.formatData = function (dataInner) {
              console.log("IN FORM DATA", dataInner)
              return new Promise(function (resolve, reject) {
                for (var i = 30; i >= 0; i--) {
                  if (AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1] == null) {
                    AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1] = {}
                    AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1][moment().subtract(i, 'days')._d.getUTCMonth() + 1 + "-" + moment().subtract(i, 'days')._d.getUTCDate() + "-" + moment().subtract(i, 'days')._d.getFullYear()] = []
                  } else {
                    AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1][moment().subtract(i, 'days')._d.getUTCMonth() + 1 + "-" + moment().subtract(i, 'days')._d.getUTCDate() + "-" + moment().subtract(i, 'days')._d.getFullYear()] = []
                  }
                }
                dataInner.components.forEach(function (component) {
                  if (component.consumption_history.length > 0) {
                    compteurCompoflow[component.module] = 0
                    component.consumption_history.forEach(function (consumption_history) {
                      var d = new Date(consumption_history.dates.created_at);
                      for (month in AllDayObject) {
                        for (b in AllDayObject[month]) {
                          if ((d.getUTCMonth() + 1) == month && d.getUTCDate() == b.split("-")[1]) {
                            //  if(Allday.indexOf(d.getUTCDate() + d.getUTCMonth() + 1) != -1){
                            var c = {}
                            if (component.name) {
                              var name = component.name
                            } else {
                              var name = "no name"
                            }
                            AllDayObject[month][b].push({
                              day: d.getDate(),
                              fullDate: d,
                              pricing: component.pricing,
                              price: consumption_history.price,
                              data: consumption_history.flow_size,
                              id: component._id,
                              label: component.module,
                              name: name,
                              date: consumption_history.dates.created_at
                            })

                          }
                        }
                      }
                    })
                  }
                })

                for (var month in AllDayObject) {
                  lasttab[month] = {}
                  console.log("month")
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
                    } else {
                      console.log("no data")
                    }
                  }
                };

                var data = []
                for (var month in lasttab) {
                  for (var conso in lasttab[month]) {
                    var c = {}
                    c["Day"] = conso
                    for (var consoFinal in lasttab[month][conso]) {
                      c[consoFinal] = {
                        pricing: lasttab[month][conso][consoFinal].pricing,
                        label: lasttab[month][conso][consoFinal].label,
                        price: lasttab[month][conso][consoFinal].price,
                        datasize: lasttab[month][conso][consoFinal].data,
                        name: lasttab[month][conso][consoFinal].name,
                        id: lasttab[month][conso][consoFinal].id,
                        fullDate: lasttab[month][conso][consoFinal].fullDate
                      }
                    }
                    data.push(c)
                  }
                }
                resolve(data)
              }.bind(this))
            }

            /// D3 JS INITIALIZE

            this.initD3js = function (data) {

              var marginStackChart = {
                  top: 20,
                  right: 200,
                  bottom: 30,
                  left: 30
                },
                widthStackChart = 1000 - marginStackChart.left - marginStackChart.right,
                heightStackChart = 500 - marginStackChart.top - marginStackChart.bottom;

              var xStackChart = d3.scaleBand().range([0, widthStackChart]).padding(0.1);
              var yStackChart = d3.scaleLinear().range([heightStackChart, 0]);

              var colorStackChart = d3.scaleOrdinal(d3.schemeCategory20);

              var canvasStackChart = d3.select("#stacked").attr("width", widthStackChart + marginStackChart.left + marginStackChart.right).attr("height", heightStackChart + marginStackChart.top + marginStackChart.bottom).append("g").attr("transform", "translate(" + marginStackChart.left + "," + marginStackChart.top + ")");

              //// UPDATE CARD VALUE
              var table = []
              data.forEach(function (d) {
                var y0 = 0
                var y2 = 0
                for (var prop in d) {
                  if (Object.keys(d).length > 1) {
                    if (table.indexOf(d[prop].id) == -1 && d[prop].id != undefined) {
                      table.push(d[prop].id)
                      this.runningComponent += 1
                    }
                  }
                  if (prop != "Day" && prop != "ages") {
                    table.push({
                      price: y2 += + d[prop].price,
                      y1: y0 += + d[prop].datasize
                    });

                  }
                  if (d[prop].price != undefined) {
                    this.totalConsume += decimalAdjust('round', d[prop].price, -4)
                  }
                  if (d["Day"] == new Date().getUTCDate() && table.length > 0) {
                    if (d[prop].price) {
                      this.yesterdayCredit = decimalAdjust('round', table[table.length - 1].price, -4);
                    }
                  } else {
                    this.yesterdayCredit = 0
                  }
                  this.update()
                }
              }.bind(this));

              colorStackChart.domain(d3.keys(data[0]).filter(function (key) {;
                return key !== "Day";
              }));
              data.forEach(function (d) {
                if (Object.keys(d).length > 1) {
                  d.ages = []
                  var y0 = 0;
                  for (var prop in d) {
                    if (prop != "Day" && prop != "ages") {
                      d.ages.push({
                        pricing: d[prop].pricing,
                        name: d[prop].label,
                        module: d[prop].name,
                        datasize: d[prop].datasize,
                        y0: + y0,
                        y1: y0 += d[prop].price
                      });
                    }
                  }
                  d.total = d.ages[d.ages.length - 1].y1;
                } else {
                  d.ages = []
                  var y0 = 0;
                  d.ages.push({name: "name", y0: y0, y1: y0});
                  d.total = 0;
                }
              });

              xStackChart.domain(data.map(function (d) {;
                return d.Day.split("-")[0] + "-" + d.Day.split("-")[1];
              }));
              yStackChart.domain([
                0,
                d3.max(data, function (d) {
                  return d.total;
                })
              ]);

              var div = d3.select(".item-flex").append("div").attr("class", "tooltip").style("opacity", 0);

              canvasStackChart.append("g").attr("class", "x axis").attr("transform", "translate(0," + heightStackChart + ")").call(d3.axisBottom(xStackChart));

              canvasStackChart.append("text").attr("class", "x label").attr("text-anchor", "end").attr("x", widthStackChart + 5).attr("y", heightStackChart + 30).attr("font-size", "12px").text("jours");

              canvasStackChart.append("g").attr("class", "y axis").call(d3.axisLeft(yStackChart)).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end")

              canvasStackChart.append("text").attr("class", "y label").attr("text-anchor", "end").attr("y", 6).attr("dy", ".75em").attr("transform", "rotate(-90)").attr("font-size", "12px").text("Consomation( € )");

              var state = canvasStackChart.selectAll(".Day").data(data).enter().append("g").attr("class", "g").attr("transform", function (d) {
                return "translate(" + xStackChart(d.Day.split("-")[0] + "-" + d.Day.split("-")[1]) + ",0)";
              })

              state.selectAll("rect").data(function (d) {
                return d.ages;
              }).enter().append("rect").attr("width", xStackChart.bandwidth()).attr("y", function (d) {
                return yStackChart(d.y1);
              }).attr("height", function (d) {
                return yStackChart(d.y0) - yStackChart(d.y1);
              }).style("fill", function (d) {
                return colorStackChart(d.name);
              }).on("mouseover", function (d) {
                var conso = decimalAdjust('round', (d.datasize), -4);
                var price = decimalAdjust('round', d.y1 - d.y0, -4);
                d3.select(this).style("opacity", .6)
                div.transition().duration(200).style("opacity", .9);
                div.html("module:" + d.name + "<br/>name:" + d.module + "<br/>conso : " + d.datasize + "Mo<br/>pricing : " + d.pricing + "€ / 100 Mo<br/>price : " + price + "€").style("left", d3.event.pageX + "px").style("top", d3.event.pageY - 28 + "px");
              }).on("mouseout", function (d) {
                d3.select(this).style("opacity", .9)
                div.transition().duration(500).style("opacity", 0);
              })

              var legend = canvasStackChart.selectAll(".legend").data(colorStackChart.domain().slice().reverse()).enter().append("g").attr("class", "legend").attr("transform", function (d, i) {
                return "translate(0," + i * 20 + ")";
              });

              legend.append("rect").attr("x", widthStackChart + 170).attr("width", 16).attr("height", 16).style("fill", colorStackChart)

              legend.append("text").attr("x", widthStackChart + 160).attr("y", 9).attr("font-size", "12px").attr("dy", ".35em").style("text-anchor", "end").text(function (d) {
                if (d != "name") {
                  return d;
                }
              });
              console.log("-------- d3Js Done --------")
            };

            this.on('mount', function () {
              this.formatData(this.innerData).then(function (dataRes) {
                console.log("this.innerData", dataRes)
                this.initD3js(dataRes)
              }.bind(this))
            }.bind(this))
</script>

</graph-of-use>

<!--
function t
    data.forEach(function (d) {
        if(Object.keys(d).length > 1){
            d.compt = []
            var y0 = 0;
            for(var prop in d ){
                if(prop != "Day" && prop != "ages"){
                    console.log("if", prop)
                    d.compt.push(
                        {
                        name: prop,
                        price: d[prop].price,
                        y0: +y0,
                        y1: y0 += +d[prop].datasize
                        }
                    );
                }
            }

            d.totalcompt = d.compt[d.compt.length - 1].y1;
            if(d["Day"] == new Date().getUTCDate()){
                this.yesterdayCredit = d.compt[d.compt.length - 1].y1
            }
            this.totalConsume +=  d.compt[d.compt.length - 1].y1
            this.update()
        }else{
            if(d["Day"] == new Date().getUTCDate()){
                this.yesterdayCredit = 0
            }
            d.compt = []
            var y0 = 0;
            d.compt.push({
                name: "name",
                y0: y0,
                y1: y0
            });
            d.totalcompt = 0;
        }
    }.bind(this));  -->
