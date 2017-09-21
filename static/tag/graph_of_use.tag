

<graph-of-use>
    <div class="commandBar containerV" style="flex-grow:1">
        <div class="containerH commandGroup" >
            <div>
                Consomation sur vos 30 jours 
            </div>
        </div>
    </div>
    <div style="display: flex;" >
        <div class="item-flex">
            <canvas id="myChart"  width="700"></canvas>
        </div>
        <div class="item-flex">
            <zenTable style="flex:1" ref="componentZenTable" disallownavigation="true" >
                <yield to="header">
                <div>consomation</div>
                <div>pricing</div>
                </yield>
                <yield to="row">
                <div style="width:30%">{name}</div>
                <div style="width:70%">{description}</div>
                </yield>
            </zenTable>
        </div>
    </div>
    
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
  this.innerData.components.forEach(function(component){
      if(component.consumption_history.length > 0 ){
          compteurCompoflow[component.editor] = 0
          component.consumption_history.forEach(function(consumption_history){
              var d = new Date(consumption_history.dates.created_at);
                  if(barChartData.labels.indexOf(d.getDate()) == -1 ){
                      barChartData.labels.push(d.getDate())
                      consumption_by_day[d.getDate()] = []
                      consumption_by_day[d.getDate()].push({data: consumption_history.flow_size, label:component.editor, date: consumption_history.dates.created_at})
                  }
                  else{
                      consumption_by_day[d.getDate()].push({data: consumption_history.flow_size, label:component.editor, date: consumption_history.dates.created_at})
                  }    
          })  
      }            
  })

// aggregation des flux 
  var lasttab = {}
  for(var conso in consumption_by_day){
        lasttab[conso] = {}
        consumption_by_day[conso].forEach(function(compo){
            if(lasttab[conso][compo.label] == null){
                lasttab[conso][compo.label] = compo.data
            }
            lasttab[conso][compo.label] += compo.data
            
        })
  }

/// mis des data dans un meme tableau 
var test = []
  for(var conso in lasttab){
        for(var consoFinal in lasttab[conso]){
            test.push({datasize:  lasttab[conso][consoFinal] , name:consoFinal})//console.log(Object.keys(lasttab[conso],lasttab[conso][consoFinal]))
        }       
  }

/// groupe by des component ( reduce traite de en ligne de gauche a droite les data du table et applique un callback
// qui prend en params l'element 1 et 2)
var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x.datasize);
    return rv;
  }, {});
};


var lastObject = groupBy(test,'name')

/// reconstruction de l'object attendu 
for(var lastObj in lastObject){ 
    barChartData.datasets.push({label: lastObj, data: lastObject[lastObj], backgroundColor: "rgba(" + r + "," + g + "," + b + "," + "0.7)"});
    r += 95;
    g += 30
    b += 20
}


  
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
                  label: function(tooltipItem, data) { 
                      return data.datasets[tooltipItem.datasetIndex].label + ": " + tooltipItem.yLabel;
                  }
              }
          },
          responsive: false,
          scales: {
          xAxes: [{ 
              stacked: true, 
              gridLines: { display: false },
              }],
          yAxes: [{ 
              stacked: true, 
              ticks: {
                      callback: function(value) { return value; },
                      }, 
              }],
          }, // scales
          legend: {display: true}
      } // options
  });
                
  canvas.onclick = function (evt) {
    var activePoint = chart.getElementAtEvent(evt)[0];
    var data = activePoint._chart.data;
    var datasetIndex = activePoint._datasetIndex;
    var labelsIndex = activePoint._index;
    var lab =  data.labels[labelsIndex]
    var label = data.datasets[datasetIndex].label;
    var value = data.datasets[datasetIndex].data[activePoint._index];
    var compoObject = {}
    for(var conso in consumption_by_day){
        console.log("=======>", consumption_by_day[lab])
        if(conso == lab){
            compoObject[lab] = {}
            consumption_by_day[lab].forEach(function(compo){
                console.log(compo.label)
                if(compo.label == label){
                    //console.log(label)
                }
                if(compoObject[lab][label] == null){
                    compoObject[lab][label] = []
                    console.log(compoObject[lab][label].length , "in first")
                    if(compo.label == label){
                        compoObject[lab][label].push(compo)
                    }
                }else{
                    if(compo.label == label){
                        compoObject[lab][label].push(compo)
                        console.log(compoObject[lab][label].length, "in second") 
                    }
                }
            })
        }
    }
    console.log(compoObject)
  }
})

    
</script>

</graph-of-use>
<!--  

                tooltips: {
                    mode: 'label',
                    callbacks: {
                        label: function(tooltipItem, data) {
                            var consomation = data.datasets[tooltipItem.datasetIndex].label;
                            var valor = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                            var total = 0;
                            for (var i = 0; i < data.datasets.length; i++)
                                total += data.datasets[i].data[tooltipItem.index];
                            if (tooltipItem.datasetIndex != data.datasets.length - 1) {
                                return consomation + " : $" + valor.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                            } else {
                                return [consomation + " : $" + valor.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'), "Total : $" + total];
                            }
                        }
                    }
                },  -->

