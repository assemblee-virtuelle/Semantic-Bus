   
<graph-of-use>
    <div class="containerV" style="flex-grow:1">
        <div style="text-align: center; padding: 5%;" >
            <div>
                Consomation sur vos 30 jours 
            </div>
        </div>
    </div>
    <div style="display: flex" >
        <div class="item-flex">
            <svg id="stacked"></svg></div>
        </div>
    </div>
    

<style>

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
    font-family: sans-serif
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
    //var dateObj = new Date();
    //var month = dateObj.getUTCMonth() + 1; //months from 1-12
    //var day = dateObj.getUTCDate();
    //var year = dateObj.getUTCFullYear();
    Allday = []
    AllDayObject = {}
    for (var i = 0 ; i < new Date().getUTCDate(); i ++){
        Allday.push(moment().subtract(i, 'days')._d.getUTCDate())
        AllDayObject[moment().subtract(i, 'days')._d.getUTCDate()] = []
    }
    this.innerData.components.forEach(function (component) {
        if (component.consumption_history.length > 0) {
            compteurCompoflow[component.module] = 0
                component.consumption_history.forEach(function (consumption_history) {
                    var d = new Date(consumption_history.dates.created_at);
                    if(Allday.indexOf(d.getUTCDate()) != -1){
                        var c = {}
                        if (component.name) {
                            var name = component.name
                        } else {
                            var name = "no name"
                        }
                        AllDayObject[d.getDate()].push(c[component.module] = {
                            day: d.getDate(),
                            fullDate: d,
                            price: consumption_history.price,
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
    for (var conso in AllDayObject) {
        lasttab[conso] = {}
        if(AllDayObject[conso].length > 0){
            AllDayObject[conso].forEach(function (compo) {
                if (lasttab[conso][compo.label] == null) {
                    lasttab[conso][compo.label] = {}
                    lasttab[conso][compo.label].data = compo.data
                    lasttab[conso][compo.label].id = compo.id
                    lasttab[conso][compo.label].name = compo.name
                    lasttab[conso][compo.label].day = compo.day
                    lasttab[conso][compo.label].fullDate = compo.fullDate
                    lasttab[conso][compo.label].price = compo.price
                }else{
                    lasttab[conso][compo.label].data += compo.data
                    lasttab[conso][compo.label].price += compo.price
                    lasttab[conso][compo.label].id = compo.id
                    lasttab[conso][compo.label].name = compo.name
                    lasttab[conso][compo.label].day = compo.day
                    lasttab[conso][compo.label].fullDate = compo.fullDate
                }
            })
        }else{
            console.log("no data")
        }
    };



    /// mis des data dans un meme tableau
    var data = []
    for (var conso in lasttab) {
        var c = {}
        c["Day"] = conso
        for (var consoFinal in lasttab[conso]) {
            c[consoFinal] = {
                price: lasttab[conso][consoFinal].price,
                datasize: lasttab[conso][consoFinal].data,
                name: lasttab[conso][consoFinal].name,
                id: lasttab[conso][consoFinal].id,
                fullDate: lasttab[conso][consoFinal].fullDate
            }
        }
        data.push(c)
    }

    console.log(data)
    //Month is 1 based
    function daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
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
      return -decimalAdjust(type, -value, exp);
    }
    // Décalage
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Décalage inversé
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }


    var marginStackChart = {
        top: 20,
        right: 150,
        bottom: 30,
        left: 40
        },
        widthStackChart = 1200 - marginStackChart.left - marginStackChart.right,
        heightStackChart = 500 - marginStackChart.top - marginStackChart.bottom;

    var xStackChart = d3.scaleBand()
        .range([0, widthStackChart])
        .padding(0.1);
    var yStackChart = d3.scaleLinear()
        .range([heightStackChart, 0]);


    var colorStackChart = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"])


    var canvasStackChart = d3.select("#stacked")
        .attr("width", widthStackChart + marginStackChart.left + marginStackChart.right)
        .attr("height", heightStackChart + marginStackChart.top + marginStackChart.bottom)
        .append("g")




    var div = d3.select(".item-flex").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    

    function drawStackChart() {
        colorStackChart.domain(d3.keys(data[0]).filter(function (key) {;
        return key !== "Day";
        }));
        data.forEach(function (d) {
            if(Object.keys(d).length > 1){
                d.ages = []
                var y0 = 0;
                for(var prop in d ){
                    if(prop != "Day" && prop != "ages"){
                        console.log("if", prop)
                        
                        d.ages.push(
                            {
                            name: prop,
                            price: d[prop].price,
                            y0: +y0,
                            y1: y0 += +d[prop].datasize
                            }
                        );
                    }
                }
                d.total = d.ages[d.ages.length - 1].y1;
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

        console.log(data)

        xStackChart.domain(data.map(function (d) {;
        return d.Day;
        }));
        yStackChart.domain([0, d3.max(data, function (d) {
        return d.total;
        })]);

        canvasStackChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightStackChart + ")")
        .call(d3.axisBottom(xStackChart));

        canvasStackChart.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yStackChart))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("No Of Buildings");

        var state = canvasStackChart.selectAll(".Day")
        .data(data)
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
            var conso =  decimalAdjust('round', (d.y1 - d.y0), -4); 
            var price =  decimalAdjust('round', d.price, -4);
            d3.select(this).style("opacity", .6)  
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("name:" + d.name + "<br/>" + "conso(Mo) : " + conso + "<br/>" + "price(€) : " + price)
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
        .attr("width", 18)
        .attr("height", 18)
        .style("fill",colorStackChart)

        legend.append("text")
        .attr("x", widthStackChart + 160)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) {
            if(d != "name"){
                return d;
            }
        });


    };
    drawStackChart();
})
</script>

</graph-of-use>


