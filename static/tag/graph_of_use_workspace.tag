<graph-of-use-workspace class="scrollable">
  <div class="containerH" style="margin-top:5em"> 
    <div class="containerV" style="flex:0.7;;background:white;padding: 2em;">
      <span style="margin-bottom:1em;text-align: center;font-size:1.3em;"> Vos données globales (30 jours) </span>
      <div class="containerH" style="justify-content:space-between">
        <div class="card" >
          <span style="font-size:2em;color:rgb(14,33,89)">{this.numberWorkspace}</span><span style="font-size:0.8em;color:rgb(141,141,141)">  Workspaces</span>
        </div>
        <div class="card" >
          <span style="font-size:2em;color:rgb(14,33,89)">{this.golbalConsumption}</span><span style="font-size:0.8em;color:rgb(141,141,141)">  Mo</span>
        </div>
        <div class="card">
          <span style="font-size:2em;color:rgb(14,33,89)">{this.golbalConsumption}</span><span style="font-size:0.8em;color:rgb(141,141,141)"> Euros</span>
        </div>
      </div>
    </div>
  </div>
  <div class="containerH" style="padding:5vh">
    <div class="item-flex">
      <svg viewBox="0 0 1000 600" id="stacked" style="background-color:rgb(250,250,250);"></svg>
    </div>
  </div>
</div>

<style scoped>
  .card {
    background: rgba(0,0,0,0.03);
    border-radius: 5px;
    font-family: "adelle-sans", sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 8vh;

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
    background-color:rgb(41,177,238);
    color:white;
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
  .line {
  fill: none;
  stroke: steelblue;
  stroke-width: 2px;
}

.grid line {
  stroke: lightgrey;
  stroke-opacity: 0.7;
  shape-rendering: crispEdges;
}

.grid path {
  stroke-width: 0;
}

</style>
<script>
  this.resultEmail = "";
  this.result = true;
  this.numberWorkspace = ""

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
  }.bind(this)


  /// D3 JS INITIALIZE

  this.initD3js = function (data) {
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

    var colorStackChart = d3.scaleOrdinal(d3.schemeCategory20c);

    var canvasStackChart = d3.select("#stacked").attr("width", widthStackChart + marginStackChart.left + marginStackChart.right).attr("height", heightStackChart + marginStackChart.top + marginStackChart.bottom).append("g").attr("transform", "translate(" + marginStackChart.left + "," + marginStackChart.top + ")");

    var div = d3.select(".item-flex").append("div").attr("class", "tooltip").style("opacity", 0);

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

    xStackChart.domain(data.map(function (d) {;
      return d.Day.split("-")[0] + "-" + d.Day.split("-")[1];
    }));
    yStackChart.domain([
      0,
      d3.max(data, function (d) {
        if(d.total){
          return d.total;
        }
        return 100
      })
    ]);

    canvasStackChart.append("g").attr("class", "x axis").attr("transform", "translate(0," + heightStackChart + ")").call(xAxis);

    canvasStackChart.append("text").attr("class", "x label").attr("text-anchor", "end").attr("x", widthStackChart + 40).attr("y", heightStackChart + 15).attr("font-size", "12px").text("Jours");

    canvasStackChart.append("g").attr("class", "y axis").call(d3.axisLeft(yStackChart)).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end")

    canvasStackChart.append("text").attr("class", "y label").attr("text-anchor", "end").attr("y", 6).attr("dy", ".75em").attr("transform", "rotate(-90)").attr("font-size", "12px").text("Consomation( € )");

    var state = canvasStackChart.selectAll(".Day").data(data).enter().append("g").attr("class", "g").attr("transform", function (d) {
      return "translate(" + xStackChart(d.Day.split("-")[0] + "-" + d.Day.split("-")[1]) + ",0)";
    })


    // gridlines in x axis function
    function make_x_gridlines() {		
        return d3.axisBottom(xStackChart)
            .ticks(5)
    }

    // gridlines in y axis function
    function make_y_gridlines() {		
        return d3.axisLeft(yStackChart)
            .ticks(5)
    }

    // add the X gridlines
    //canvasStackChart.append("g")			
    //  .attr("class", "grid")
    //  .attr("transform", "translate(0," + heightStackChart + ")")
    //  .call(make_x_gridlines()
    //      .tickSize(-heightStackChart)
    //      .tickFormat("")
    //  )

    // add the Y gridlines
    canvasStackChart.append("g")			
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-widthStackChart)
        .tickFormat("")
      )



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

  this.initgraph = function (data) {
    this.numberWorkspace = data.numberWorkspace
    this.golbalConsumption = data.global
    this.initD3js(data.data)
    this.update()
  }.bind(this)

  RiotControl.on('load_user_workspace_graph_done', this.initgraph)

  this.on('mount', function () {
    RiotControl.trigger('load_user_workspace_graph');
  }.bind(this))

  this.on('unmount', function () {
    RiotControl.off('load_user_workspace_graph_done', this.initgraph);
  })
</script>
</graph-of-use-workspace>
<!--  

 this.formatData(data).then(function (res) {
      this.numberWorkspace = data.workspaces.length
      this.golbalConsumption = res.global
      this.initD3js(res.data)
      this.update()
    }.bind(this))  -->

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
