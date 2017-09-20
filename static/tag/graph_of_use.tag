

<graph-of-use>
    <canvas id="myChart" width="400" height="400"></canvas>
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
        console.log("in chartjs table ==============================+>", this.innerData.consumption_history)
        var data = []
        this.innerData.consumption_history.forEach(function(cons){
            console.log(cons)
            
        })
        
        var canvas = document.getElementById("myChart");
        var ctx = canvas.getContext("2d");
        var myBar = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                title: {
                    display: true,
                    text: "Chart.js Bar Chart - Stacked"
                },
                tooltips: {
                    mode: 'label',
                    callbacks: {
                        label: function(tooltipItem, data) {
                            var corporation = data.datasets[tooltipItem.datasetIndex].label;
                            var valor = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                            var total = 0;
                            for (var i = 0; i < data.datasets.length; i++)
                                total += data.datasets[i].data[tooltipItem.index];
                            if (tooltipItem.datasetIndex != data.datasets.length - 1) {
                                return corporation + " : $" + valor.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                            } else {
                                return [corporation + " : $" + valor.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'), "Total : $" + total];
                            }
                        }
                    }
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        stacked: true,
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        });
        
        canvas.onclick = function (evt) {
            var points = chart.getPointsAtEvent(evt);
            alert(chart.datasets[0].points.indexOf(points[0]));
        };
    });
    
</script>

</graph-of-use>


