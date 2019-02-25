<graph-of-use-workspace>

  <div class="mainContainerGraph">
    <div class="containerV containerData">
      <div class="containerH  contentData">
        <div class="cardData" >
          <span class="textNumber">{numberWorkspace}</span><span class="textBase">  Workspaces</span>
        </div>
        <div class="cardData" >
          <span class="textNumber">{decimalAdjust('round', globalMo, -2)}</span><span class="textBase">  Mo </span>
        </div>
        <div class="cardData">
          <span class="textNumber">{decimalAdjust('round', globalPrice, -2)}</span><span class="textBase"> Crédit(s) </span>
        </div>
      </div>
    </div>
    <div if={dataLoaded} class="containerH containerData">
      <div class="item-flex"  style="background-color:rgb(255,255,255); flex: 1">
        <svg viewBox="0 0 1000 60O" id="stacked"></svg>
      </div>
    </div>
  </div>

  <script>
  this.resultEmail = "";
  this.result = true;
  this.numberWorkspace = 0

  decimalAdjust(type, value, exp) {
    // Si la valeur de exp n'est pas définie ou vaut zéro...
    if (typeof exp === 'undefined' || + exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Si la valeur n'est pas un nombre ou si exp n'est pas un entier...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return 0;
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

  this.initD3js = data => {
    if(data){
      var marginStackChart = {
          top: 40,
          right: 50,
          bottom: 30,
          left: 50,
        },
        widthStackChart = 1100,
        heightStackChart = 500;

      var xStackChart = d3.scaleBand().range([0, widthStackChart]).padding(0.4);

      var yStackChart = d3.scaleLinear().range([heightStackChart, 0]);

      var xAxis = d3.axisBottom().scale(xStackChart)

      var yAxis = d3.axisLeft().scale(yStackChart)

      var colorStackChart = d3.scaleOrdinal(d3.schemeSet3);

      var canvasStackChart = d3
        .select("#stacked")
        .attr("width", widthStackChart + marginStackChart.left + marginStackChart.right)
        .attr("height", heightStackChart + marginStackChart.top + marginStackChart.bottom)
        .append("g")
        .attr("transform", "translate(" + marginStackChart.left + "," + marginStackChart.top + ")");

      var div = d3.select(".item-flex").append("div").attr("class", "tooltip").style("opacity", 0);


      xStackChart.domain(data.data.map(function (d) {
        return d.Day.split("-")[1];
      }));

      yStackChart.domain([
        0,
        data.golbalConsumption
      ]);
      // gridlines in y axis function
      function make_y_gridlines() {
          return d3.axisLeft(yStackChart)
              .ticks(5)
      }
      // y legend
      canvasStackChart
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightStackChart + ")")
        .style("font-weight", "200")
        .style("font-size", "10px")
        .style("text-transform", "uppercase")
        .style("font-family", "sans-serif")
        .call(xAxis);
      // X legend
      canvasStackChart
        .append("g")
        .attr("class", "y axis")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("font-weight", "200")
        .style("font-size", "10px")
        .style("text-transform", "uppercase")
        .style("font-family", "sans-serif")
        .style("text-anchor", "end")
        .call(yAxis)
        .append("text")
      // title graph
      canvasStackChart
        .append("text")
        .attr("x", 550)            
        .attr("y", -10)
        .attr("class", "title-space")
        .attr("text-anchor", "middle")  
        .style("fill", "rgb(141,141,141)")
        .text("Consomation de vos crédit par jours par workspaces ( 30 derniers jours )");
      // x unity
      canvasStackChart
        .append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", widthStackChart + 40)
        .attr("y", heightStackChart + 15)
        .style("font-weight", "200")
        .style("font-size", "10px")
        .style("text-transform", "uppercase")
        .style("font-family", "sans-serif")
        .text("Jours");    
      // y unity
      canvasStackChart
        .append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", -10)
        .attr("x", 0)
        .attr("dy", ".75em")
        .style("font-weight", "200")
        .style("font-size", "10px")
        .style("text-transform", "uppercase")
        .style("font-family", "sans-serif")
        .text("Credits");
      // add the Y gridlines
      canvasStackChart.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines().tickSize(-widthStackChart).tickFormat(""))

      var state = canvasStackChart
        .selectAll(".Day")
        .data(data.data).enter()
        .append("g")
        .attr("class", "g")
        .attr("transform", function (d) {return "translate(" + xStackChart(d.Day.split("-")[1])+ ",0)"})


      state.selectAll("rect")
        .data(function (d) {return d.workspaces})
        .enter()
        .append("rect")
        .attr("width", xStackChart.bandwidth())
        .attr("y", function (d) {return yStackChart(d.y1)})
        .attr("height", function (d) {return yStackChart(d.y0) - yStackChart(d.y1)})
        .style("fill", function (d) {return colorStackChart(d.id)})
        .on("mouseover", function (d) {
          d3
            .select(this)
            .style("opacity", .6);
          div
            .transition()
            .duration(200)
            .style("opacity", 1);
          let name = d.name ? "Nom:" + d.name : '';
          div
            .html( 
              name + 
              "<br/>Conso : " + Math.round(d.flow * 100) / 100  + "Mo"+
              "<br/>Prix : " + Math.round(d.price * 100) / 100  + "Crédit(s)<br/>")
              .style("left", d3.event.pageX-250 + "px")
              .style("top", d3.event.pageY - 28 + "px");
        })
        .on("mouseout", function (d) {
          d3
            .select(this)
            .style("opacity", 1)
          div
            .transition()
            .duration(500)
            .style("opacity", 0);
        });
        
    }
  };

  this.initgraph = (data) => {
      if(data){
        this.dataLoaded = true
        this.numberWorkspace = data.workspaceNumber
        this.globalPrice = data.golbalConsumption
        this.globalMo = data.golbalConsumptionMo
        this.update()
        this.initD3js(data)
      }
    }



  this.on('mount', function () {
    this.dataLoaded= false
    RiotControl.on('load_user_workspace_graph_done', this.initgraph)
    RiotControl.trigger('load_user_workspace_graph');
  }.bind(this))

  this.on('unmount', function () {
    RiotControl.off('load_user_workspace_graph_done', this.initgraph);
  })
</script>
<style scoped>
  .domain {
    stroke: none !important;
  }
  .mainContainerGraph {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .containerData {
    margin: 4vh 0;
    width: 90%;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }
  .cardGraph {
    overflow-x: scroll;
  }
  .contentData {
    width: 100%;
    justify-content: space-between;
  }
  .cardData {
    background: white;
    border-radius: 2px;
    border: none;
    display: flex;
    flex:0.2;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 5vh;
  }
  .textNumber {
    font-size:2em;
    color:rgb(41,181,237);
  }
  .textBase {
    font-size: 0.8em;
    color: rgb(141,141,141);
  }

  .containerGraph {
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: 90%;
    margin-bottom: 5vh;
  }
  .cardTitle {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 12vh;
  }
  
  .item-flex {
      overflow-x:scroll
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
    font-family: Arial, Helvetica, "Liberation Sans", FreeSans, sans-serif;
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
    font-family: Arial, Helvetica, "Liberation Sans", FreeSans, sans-serif;
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
    font-family: Arial, Helvetica, "Liberation Sans", FreeSans, sans-serif;
  }

  div.tooltip {
    top: 0;
    position: absolute;
    text-align: left;
    width: 100px;
    height: 70px;
    padding: 20px;
    font: 12px Arial, Helvetica, "Liberation Sans", FreeSans, sans-serif;
    background: lightsteelblue;
    border: 0;
    border-radius: 8px;
    pointer-events: none;
    background-color: white;
    color: lightsteelblue;
    /* border: 0.5px solid rgb(41,177,238); */
    box-shadow: 0 0 5px 0 rgba(133,133,133,0.38);
  }

  .x.axis path {
    display: none;
  }
  .axis {
    font: 10px Arial, Helvetica, "Liberation Sans", FreeSans, sans-serif;
  }

  .axis line {
    stroke: none;
  }
  .axis path {
    fill: none;
    stroke: lightgrey;
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
</graph-of-use-workspace>
