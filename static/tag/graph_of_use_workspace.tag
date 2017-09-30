<graph-of-use-workspace> 
        <div class="container-top">
            <div class="center-left-top">
            <h4 style="font-size: 1.5em;"> {this.name} </h4>
            <p> {this.job || null} </p>
            <p> {this.societe || null} </p>
            <p> {this.email} </p>
            </div>
            <div class="center-right-top">
            <div class="workspace">
                <h4 class="title-number"><strong>{this.numberWorkspace}</strong> </h4>
                <p class="sub-title">workspaces total</p>
            </div>
            <div class="workspace">
                <h4 class="title-number"> <strong>{this.golbalConsumption} Mo</strong>  </h4>
                <p class="sub-title">Consomé sur 30 jours</p>
            </div>
            </div>
        </div>
        <div style="text-align: center; padding: 5%; width:100%" >
            <div>
              Consomation par workspace sur 30 jours 
            </div>
        </div>
        <div style="display: flex; justify-content: center" >
            <div class="item-flex">
                <svg id="stacked"></svg></div>
            </div>
        </div>

<style scoped>

  .title-number {
    font-size: 30px;
    text-align: center
  }

  .container-top{
    display:flex;
    background-color: rgb(250,250,250);
  }
    #bad-result{
      color: red;
      font-size: 18px;
      font-family: 'Raleway', sans-serif;
      padding-top: 4%;
    }

     .center-left-top{
        text-align:left;
        width: 30%;
     }
    .center-right-top{
      display: flex;
      justify-content: space-around;
      width: 60%;
    }
    #good-result{
      color: green;
      font-size: 18px;
      font-family: 'Raleway', sans-serif;
      padding-top: 4%;
    }

    .sub-title {
      text-align:center;
      margin-top: 30%;
    }
  .change-mail {
    background-color: inherit !important;
    border-bottom: 1px solid #3498db !important;
    border: none;
    color: #3498db;
    text-align:center;
    min-width:40%;
  }
    .mail-btn {
      color: #ffffff;
      background-color: green;
      border: none;
      padding:10px;
      border-radius: 5px 5px 5px 5px;
      text-align:center;
      max-width: 25%;
      margin-top: 10%;
    }
    .dec-btn {
      color: #ffffff;
      background-color: red;
      border: none;
      padding:10px;
      border-radius: 5px 5px 5px 5px;
      text-align:center;
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
        border: 0px;
        border-radius: 8px;
        pointer-events: none;
    } 
</style>
    <script>
    this.on('mount', function () {
        console.log("mount")
        RiotControl.trigger('load_profil'); 
        RiotControl.on('profil_loaded', function(data){
        function decimalAdjust(type, value, exp) {
              // Si la valeur de exp n'est pas définie ou vaut zéro...
              if (typeof exp === 'undefined' || +exp === 0) {
              return Math[type](value);
              }
              value = +value;
              exp = +exp;
              // Si la valeur n'est pas un nombre 
              // ou si exp n'est pas un entier...
              if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
              return NaN;
              }
              // Si la valeur est négative
              if (value < 0) {
              return decimalAdjust(type, -value, exp);
              }
              // Décalage
              value = value.toString().split('e');
              value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
              // Décalage inversé
              value = value.toString().split('e');
              return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
        }

        var Allday = []
        var AllDayObject = {}
        new Date()
        //if()
        for (var i = 0 ; i < new Date().getUTCDate(); i ++){
          Allday.push(moment().subtract(i, 'days')._d.getUTCDate() + moment().subtract(i, 'days')._d.getUTCMonth() + 1)
          AllDayObject[moment().subtract(i, 'days')._d.getUTCDate()] = []
        }
        
        /// INIT DATA PROFIL
        this.golbalConsumption = 0
        this.resultEmail = "";
        this.result = true;
        this.profil = data;
        this.email =  data.user.credentials.email;
        this.job =  data.user.job;
        this.societe =  data.user.societe;
        this.name =  data.user.name;
        this.numberWorkspace = data.workspaces.length
        data.workspaces.forEach(function(workspace){
            workspace.flow = 0
            workspace.pricing = 0
            if(workspace.consumption_history.length > 0){
                workspace.consumption_history.forEach(function(cons){
                    var d = new Date(cons.dates.created_at);
                    if(Allday.indexOf(d.getUTCDate() + d.getUTCMonth() + 1) != -1){
                        this.golbalConsumption += cons.flow_size
                        this.golbalConsumption = decimalAdjust('round',this.golbalConsumption , -2 );
                        var c = {}
                    if (workspace.name) {
                        var name = workspace.name
                    } else {
                        var name = "no name"
                }
                if(d != undefined && AllDayObject[d.getDate()]!= undefined){
                    console.log("AllDayObject[d.getDate()]", d.getDate(), AllDayObject[d.getDate()])
                    AllDayObject[d.getDate()].push({
                        flow : cons.flow_size,
                        pricing : cons.price,
                        id: workspace._id,
                        name: workspace.name
                    })
                }
              }
            }.bind(this))
          }
        }.bind(this))

        console.log("allday" , AllDayObject)
         // aggregation des flux 
        var lasttab = {}
        for (var conso in AllDayObject) {
            lasttab[conso] = {}
            if(AllDayObject[conso].length > 0){
                AllDayObject[conso].forEach(function (compo) {
                    console.log(compo.id, compo.price)
                    if (lasttab[conso][compo.id] == null) {
                        lasttab[conso][compo.id] = {}
                        lasttab[conso][compo.id].flow = compo.flow
                        lasttab[conso][compo.id].name = compo.name
                        lasttab[conso][compo.id].price = compo.pricing
                    }else{
                        lasttab[conso][compo.id].flow += compo.flow
                        lasttab[conso][compo.id].name = compo.name
                        lasttab[conso][compo.id].price += compo.pricing
                    }
                })
            }else{
                console.log("no data")
            }
        };


        /// mis des data dans un meme tableau
        var dataT = []
        for (var conso in lasttab) {
            var c = {}
            c["Day"] = conso
            for (var consoFinal in lasttab[conso]) {
                c[consoFinal] = {
                    name: lasttab[conso][consoFinal].name,
                    flow: lasttab[conso][consoFinal].flow,
                    price: lasttab[conso][consoFinal].price,
                }
            }
            dataT.push(c)
        }

        console.log(dataT)

        this.update();
      
        /// D3 JS INITIALIZE

        var marginStackChart = {
            top: 20,
            right: 200,
            bottom: 30,
            left: 30
            },
            widthStackChart = 1000 - marginStackChart.left - marginStackChart.right,
            heightStackChart = 500 - marginStackChart.top - marginStackChart.bottom;

        var xStackChart = d3.scaleBand()
            .range([0, widthStackChart])
            .padding(0.1);
        var yStackChart = d3.scaleLinear()
            .range([heightStackChart, 0]);


        var colorStackChart = d3.scaleOrdinal(["#581845", "#900C3F","#C70039","#FF5733", "#FFC30F"])


        var canvasStackChart = d3.select("#stacked")
            .attr("width", widthStackChart + marginStackChart.left + marginStackChart.right)
            .attr("height", heightStackChart + marginStackChart.top + marginStackChart.bottom)
            .append("g")
            .attr("transform", "translate(" + marginStackChart.left + "," + marginStackChart.top + ")");


        var div = d3.select(".item-flex").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        //// d3JS DRAW FUNCTION

        function drawStackChart() {
          colorStackChart.domain(d3.keys(data[0]).filter(function (key) {;
          return key !== "Day";
          }));
          console.log(dataT)
          dataT.forEach(function (d) {
            if(Object.keys(d).length > 1){
                d.ages = []
                var y0 = 0;
                for(var prop in d ){
                    if(prop != "Day" && prop != "ages"){
                        console.log("if",prop,  d[prop])  
                        d.ages.push(
                            {
                                pricing: d[prop].price,
                                name: d[prop].name,
                                datasize: d[prop].flow,
                                y0: +y0,
                                y1: y0 += d[prop].price
                            }
                        );
                    }
                }
                d.total = d.ages[d.ages.length - 1].y1;
                console.log("total", d.total)
            }else{
                d.ages = []
                var y0 = 0;
                d.ages.push({
                    name: "name",
                    y0: y0,
                    y1: y0
                });
                d.total = 0;
            }
        });

            console.log("last data", dataT)

            xStackChart.domain(dataT.map(function (d) {;
                return d.Day;
            }));
            yStackChart.domain([0, d3.max(dataT, function (d) {
                return d.total;
            })]);

            canvasStackChart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + heightStackChart + ")")
            .call(d3.axisBottom(xStackChart));

            canvasStackChart.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", widthStackChart + 5)
            .attr("y", heightStackChart + 30)
            .attr("font-size", "12px")
            .text("jours");

            canvasStackChart.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yStackChart))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")


            canvasStackChart.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", 6)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .attr("font-size", "12px")
            .text("Consomation( € )");


            var state = canvasStackChart.selectAll(".Day")
            .data(dataT)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform", function (d) {
                return "translate(" + xStackChart(d.Day) + ",0)";
            })
            

            state.selectAll("rect")
            .data(function (d) {
                return d.ages;
            })
            .enter().append("rect")
            .attr("width", xStackChart.bandwidth())
            .attr("y", function (d) {
                return yStackChart(d.y1);
            })
            .attr("height", function (d) {
                return yStackChart(d.y0) - yStackChart(d.y1);
            })
            .style("fill", function (d) {
                return colorStackChart(d.name);
            })
            .on("mouseover", function(d) {
                var conso =  decimalAdjust('round', (d.datasize), -4); 
                var price =  decimalAdjust('round', d.y1 - d.y0, -4 );
                d3.select(this).style("opacity", .6)  
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("name:" + d.name + "<br/>" + "conso : " + decimalAdjust('round', (d.datasize), -4) + "Mo" + "<br/>" + "price : " +  decimalAdjust('round', d.pricing, -4) + "€" +  "<br/>" )
                    .style("left", d3.event.pageX  + "px")
                    .style("top", d3.event.pageY - 28 +  "px");
            })
            .on("mouseout", function(d) {
                d3.select(this).style("opacity", .9) 
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })


            var legend = canvasStackChart.selectAll(".legend")
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
            });


        };
        drawStackChart();
        }.bind(this))
    })
    </script>
</graph-of-use-workspace>