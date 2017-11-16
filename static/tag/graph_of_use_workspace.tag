<graph-of-use-workspace class="containerV" style="flex-shrink:1;">

  <div class="containerH">
    <div class="card">
      <h4>workspaces total</h4>
      <span class="second-title-card">{this.numberWorkspace}</span>
    </div>
    <div class="card">
      <h4>Consomé sur 30 jours</h4>
      <span class="second-title-card">{this.golbalConsumption} Mo</span>
    </div>
  </div>

  <div class="containerH" style="flex-grow:1;">
    <!--  <div class="item-flex">  -->
    <svg viewBox="0 0 1000 600" id="stacked" style="flex-grow:1;"></svg>
  </div>
  <!--  </div>  -->
</div>

<style scoped>

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

  .title-number {
    font-size: 30px;
    text-align: center;
  }

  .container-top {
    display: flex;
    background-color: rgb(33,150,243);
    color: white;
    padding: 15pt;
  }
  #bad-result {
    color: red;
    font-size: 18px;
    font-family: 'Raleway', sans-serif;
    padding-top: 4%;
  }

  .center-left-top {
    text-align: left;
    width: 30%;
  }
  .center-right-top {
    display: flex;
    justify-content: space-around;
    width: 60%;
  }
  #good-result {
    color: green;
    font-size: 18px;
    font-family: 'Raleway', sans-serif;
    padding-top: 4%;
  }

  .sub-title {
    text-align: center;
    margin-top: 30%;
  }
  .change-mail {
    background-color: inherit !important;
    border-bottom: 1px solid #3498db !important;
    border: none;
    color: #3498db;
    text-align: center;
    min-width: 40%;
  }
  .mail-btn {
    color: #ffffff;
    background-color: green;
    border: none;
    padding: 10px;
    border-radius: 5px 5px 5px 5px;
    text-align: center;
    max-width: 25%;
    margin-top: 10%;
  }
  .dec-btn {
    color: #ffffff;
    background-color: red;
    border: none;
    padding: 10px;
    border-radius: 5px 5px 5px 5px;
    text-align: center;
    max-width: 25%;
    margin-top: 10%;
  }

  h3 {
    text-align: center;
    font-family: 'Raleway', sans-serif;
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

  .x.axis path {
    display: none;
  }
  .axis {
    font: 10px sans-serif;
  }

  .axis line,
  .axis path {
    fill: none;
    stroke: #000;
    shape-rendering: crispEdges;
  }

</style>
<script>
  this.on('mount', function () {
    console.log("mount")
    RiotControl.trigger('load_profil');
    RiotControl.on('profil_loaded', function (data) {
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

      var Allday = []
      var AllDayObject = {}
      new Date()
      //if()
      for (var i = 30; i >= 0; i--) {
        if (AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1] == null) {
          AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1] = {}
          AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1][moment().subtract(i, 'days')._d.getUTCMonth() + 1 + "-" + moment().subtract(i, 'days')._d.getUTCDate() + "-" + moment().subtract(i, 'days')._d.getFullYear()] = []
        } else {
          AllDayObject[moment().subtract(i, 'days')._d.getUTCMonth() + 1][moment().subtract(i, 'days')._d.getUTCMonth() + 1 + "-" + moment().subtract(i, 'days')._d.getUTCDate() + "-" + moment().subtract(i, 'days')._d.getFullYear()] = []
        }
      }

      /// INIT DATA PROFIL
      this.golbalConsumption = 0
      this.resultEmail = "";
      this.result = true;
      this.profil = data;
      this.email = data.user.credentials.email;
      this.job = data.user.job;
      this.societe = data.user.society;
      this.name = data.user.name;
      this.numberWorkspace = data.workspaces.length
      data.workspaces.forEach(function (workspace) {
        workspace.flow = 0
        workspace.pricing = 0
        if (workspace.consumption_history.length > 0) {
          workspace.consumption_history.forEach(function (cons) {
            this.golbalConsumption += cons.flow_size
            this.golbalConsumption = decimalAdjust('round', (this.golbalConsumption), -2);
            var d = new Date(cons.dates.created_at);
            for (month in AllDayObject) {
              for (b in AllDayObject[month]) {
                if ((d.getUTCMonth() + 1) == month && d.getUTCDate() == b.split("-")[1]) {
                  var c = {}
                  if (workspace.name) {
                    var name = workspace.name
                  } else {
                    var name = "no name"
                  }
                  AllDayObject[month][b].push({
                    flow: cons.flow_size,
                    pricing: cons.price,
                    id: workspace._id,
                    name: workspace.name,
                    date: new Date(cons.dates.created_at)
                  })
                }
              }
            }
          }.bind(this))
          this.update()
        }
      }.bind(this))

      console.log(AllDayObject)

      // aggregation des flux
      var lasttab = {}
      for (var month in AllDayObject) {
        lasttab[month] = {}
        for (var conso in AllDayObject[month]) {
          lasttab[month][conso] = {}
          if (AllDayObject[month][conso].length > 0) {
            AllDayObject[month][conso].forEach(function (compo) {
              if (lasttab[month][conso][compo.id] == null) {
                lasttab[month][conso][compo.id] = {}
                lasttab[month][conso][compo.id].flow = compo.flow
                lasttab[month][conso][compo.id].name = compo.name
                lasttab[month][conso][compo.id].price = compo.pricing
                lasttab[month][conso][compo.id].date = compo.date
              } else {
                lasttab[month][conso][compo.id].flow += compo.flow
                lasttab[month][conso][compo.id].name = compo.name
                lasttab[month][conso][compo.id].price += compo.pricing
                lasttab[month][conso][compo.id].date = compo.date
              }
            })
          } else {
            console.log("no data")
          }
        };
      }

      console.log(lasttab)

      /// mis des data dans un meme tableau
      var dataT = []
      for (var month in lasttab) {
        for (var conso in lasttab[month]) {
          var c = {}
          c["Day"] = conso
          for (var consoFinal in lasttab[month][conso]) {
            c[consoFinal] = {
              name: lasttab[month][conso][consoFinal].name,
              flow: lasttab[month][conso][consoFinal].flow,
              price: lasttab[month][conso][consoFinal].price,
              date: lasttab[month][conso][consoFinal].date
            }

          }
          dataT.push(c)

        }
      }

      this.update();

      /// D3 JS INITIALIZE

      var marginStackChart = {
          top: 20,
          right: 200,
          bottom: 30,
          left: 30
        },
        widthStackChart = 1000,
        heightStackChart = 600 - marginStackChart.top - marginStackChart.bottom;

      var xStackChart = d3.scaleBand().range([0, widthStackChart]).padding(.4);

      var yStackChart = d3.scaleLinear().range([heightStackChart, 0]);

      var xAxis = d3.axisBottom().scale(xStackChart)

      var parser = d3.timeFormat("%d-%b-%y").parse;

      var colorStackChart = d3.scaleOrdinal(["#581845", "#900C3F", "#C70039", "#FF5733", "#FFC30F"])

      var canvasStackChart = d3.select("#stacked")
      // .attr("width", widthStackChart + marginStackChart.left + marginStackChart.right)
      // .attr("height", heightStackChart + marginStackChart.top + marginStackChart.bottom)
      .append("g").attr("transform", "translate(" + marginStackChart.left + "," + marginStackChart.top + ")");

      var div = d3.select(".item-flex").append("div").attr("class", "tooltip").style("opacity", 0);

      //// d3JS DRAW FUNCTION

      function drawStackChart() {
        colorStackChart.domain(d3.keys(data[0]).filter(function (key) {;
          return key !== "Day";
        }));
        dataT.forEach(function (d) {
          if (Object.keys(d).length > 1) {
            d.ages = []
            var y0 = 0;
            for (var prop in d) {
              if (prop != "Day" && prop != "ages") {
                d.ages.push({
                  pricing: d[prop].price,
                  name: d[prop].name,
                  datasize: d[prop].flow,
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

        console.log("last data ----------->", dataT)

        xStackChart.domain(dataT.map(function (d) {;
          return d.Day.split("-")[0] + "-" + d.Day.split("-")[1];
        }));
        yStackChart.domain([
          0,
          d3.max(dataT, function (d) {
            return d.total;
          })
        ]);

        canvasStackChart.append("g").attr("class", "x axis").attr("transform", "translate(0," + heightStackChart + ")").call(xAxis);

        canvasStackChart.append("text").attr("class", "x label").attr("text-anchor", "end").attr("x", widthStackChart + 5).attr("y", heightStackChart + 30).attr("font-size", "12px").text("jours");

        canvasStackChart.append("g").attr("class", "y axis").call(d3.axisLeft(yStackChart)).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end")

        canvasStackChart.append("text").attr("class", "y label").attr("text-anchor", "end").attr("y", 6).attr("dy", ".75em").attr("transform", "rotate(-90)").attr("font-size", "12px").text("Consomation( € )");

        var state = canvasStackChart.selectAll(".Day").data(dataT).enter().append("g").attr("class", "g").attr("transform", function (d) {
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
          div.html("name:" + d.name + "<br/>conso : " + decimalAdjust('round', (d.datasize), -4) + "Mo<br/>price : " + decimalAdjust('round', d.pricing, -4) + "€<br/>").style("left", d3.event.pageX + "px").style("top", d3.event.pageY - 28 + "px");
        }).on("mouseout", function (d) {
          d3.select(this).style("opacity", .9)
          div.transition().duration(500).style("opacity", 0);
        })

      };
      drawStackChart();
    }.bind(this))
  })
</script>
</graph-of-use-workspace>

<!--  var legend = canvasStackChart.selectAll(".legend")
            .data(colorStackChart.domain().slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return "translate(0," + i * 20 + ")";
            });

            legend.append("rect")
            .attr("x", widthStackChart + 170)
            .attr("width", 16)
            .attr("height", 16)
            .style("fill",colorStackChart)

            legend.append("text")
            .attr("x", widthStackChart + 160)
            .attr("y", 9)
            .attr("font-size", "12px")
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) {
              console.log("legend", d)
                if(d != "name"){
                    return d;
                }
            });  -->
