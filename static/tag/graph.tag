<graph>

  <div id="graphContainer">
    <svg viewBox="0 0 1000 600"><!--width="1000" height="600"-->
      <filter id="dropshadow" x="1%" y="1%" width="110%" height="110%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
        <!-- stdDeviation is how much to blur -->
        <feOffset dx="-2" dy="-1" result="offsetblur1"/>
        <feColorMatrix type="luminanceToAlpha"/>
        <feOffset dx="2" dy="2" result="offsetblur2"/>
        <feMerge><!--used to combine filters-->
          <feMergeNode in="offsetblur1"/>
          <feMergeNode in="offsetblur2"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <g id=shapeLayer></g>
      <g id="textLayer"></g>
    </svg>
  </div><!--graphContainer-->

  <script>
    //Constants for the SVG
    var width = 1000,
      height = 600; // utilisé dans le script en bas

    /*
    Fonctions
  */

  // fonctions déplacements ( glissé )
    this.dragstarted = function (d) { // d le est le noeud, this est le composant riot js graph
      if (!d3.event.active)
        this.simulation.alphaTarget(1.0).restart();
      d.fx = d.x;
      d.fy = d.y;
    }.bind(this); // permet de conserver this pour la prochaine execution de la fonction

    this.dragged = function (d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }.bind(this);

    this.dragended = function (d) {
      if (!d3.event.active) {
        this.simulation.alphaTarget(0.1);
      }
    }.bind(this);

  // evenement appele par riot
    this.on('mount', function () { // mount du composant riot

      this.svg = d3.select("svg");

      RiotControl.on('workspace_current_changed', function (data) {   // controller MVC central, les views sont les tags .tag
      //  console.log('GRAPH | workspace_current_changed ', data);
        this.graph = {};
        this.graph.nodes = [];
        this.graph.links = [];

        var inputs = 0;
        var outputs = 0;

        // determine le nombre d inputs et d outputs
        for (record of data.components) {
          if (record.connectionsBefore.length == 0) {
            inputs++;
          }
          if (record.connectionsAfter.length == 0) {
            outputs++;
          }
        }

        // console.log(inputs, outputs);

        // calcule une distance type pour positionner les inputs et outputs du graphe
        var inputsOffset = height / (inputs + 1);
        var outputsOffset = height / (outputs + 1);

        var inputCurrentOffset = inputsOffset;
        var outputCurrentOffset = outputsOffset;

        //console.log(inputsOffset, outputsOffset);

        for (record of data.components) {
          if (record.connectionsBefore.length == 0) { // si rien n est connecte avant
            this.graph.nodes.push({
              text: record.type,
              id: record._id.$oid,
              fx: 10,
              fy: inputCurrentOffset
            });
            inputCurrentOffset += inputsOffset;
          } else if (record.connectionsAfter.length == 0) {
            this.graph.nodes.push({
              text: record.type,
              id: record._id.$oid,
              fx: width - 10 - record.type.length * 10, // positionne l'element en largeur par rapport au bord droit du graphe
              fy: outputCurrentOffset
            });
            outputCurrentOffset += outputsOffset;
          } else { // tous ceux du milieu
            this.graph.nodes.push({
              text: record.type,
              id: record._id.$oid,
              x: width / 2,
              y: height / 2 // on laisse a la force le soin de les repartir
            });
          }
          for (connection of record.connectionsAfter) {
            // console.log('connection (After)', connection._id.$oid);
            this.graph.links.push({source: record._id.$oid, target: connection._id.$oid}) // creation de tous les links
          }
        }

        // lancement de la simulation
        this.simulation = d3.forceSimulation(this.graph.nodes).velocityDecay(0.9).force('link', d3.forceLink(this.graph.links).id(function (d) {
          return d.id // ( ne pas toujours chercher a comprendre comment d3 marche, mais c est necessaire )
        }))
        //.force('center', d3.forceCenter(width / 2, height / 2)) .force("x", d3.forceX().strength(0.002)) .force("y", d3.forceY().strength(0.002))
          .force("collide", d3.forceCollide().radius(30).iterations(2));
        // .on("tick", ticked); var simulation = d3.forceSimulation(graph.nodes)     .force('charge', d3.forceManyBody()) //.distanceMax(500).strength(-0.8)) // .distanceMax(220))     .force('link', d3.forceLink(graph.links).strength(2))     //
        // .distance(20).strength(1)     .force('center', d3.forceCenter(width / 2, height / 2));

        // les texts
        this.texts = this.svg.select("#textLayer").selectAll("text").data(this.graph.nodes);
        this.texts.exit().remove();
        //this.texts = this.texts.enter().append("text").merge(this.texts) //  utiliser tspan ???
        this.texts = this.texts.enter().append("text")
        // .attr("r",20) .attr("cx",function(d){return d.x;}) .attr("cy",function(d){return d.y;})
          .attr("fill", "#000") //.attr("opacity",0.5)
        // .attr("width", "20") .attr("height","20")
          .text(function (d) {
          return d.text;
        }).each(function (d) {
          d.width = this.getBBox().width;
          d.height = this.getBBox().height;
        }); //;
        // desactive pour l instant
        // call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));

        // les links
        this.links = this.svg.select("#shapeLayer").selectAll('line').data(this.graph.links);
        this.links.exit().remove();
        //this.links = this.links.enter().append('line').merge(this.links)
        this.links = this.links.enter().append('line');

        // les nodes
        this.nodes = this.svg.select("#shapeLayer").selectAll("rect").data(this.graph.nodes);
        this.nodes.exit().remove();
        //this.nodes = this.nodes.enter().append("rect").merge(this.nodes). //  utiliser tspan ???
        this.nodes = this.nodes.enter().append("rect").attr("width", function (d) { // width et height definis plus haut par bbox
          return d.width + 10;
        }).attr("height", function(d){
          return d.height + 10;
        })
        //  .attr("x",function(d){return d.x;})  .attr("y",function(d){return d.y;})
          // .attr("fill", "#e5e5ff") //.attr("opacity",0.5)
        // .text(function(d){return d.text;})
          .call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));

        // attache l evenement
        this.simulation.on('tick', this.ticked);
      }.bind(this));



      // grace a RiotControl.on controller
      this.ticked = function () {
        // console.log("ticked");
        this.links.attr('x1', function (d) {
          return d.source.x;
        }).attr('y1', function (d) {
          return d.source.y;
        }).attr('x2', function (d) {
          return d.target.x;
        }).attr('y2', function (d) {
          return d.target.y;
        });

        this.nodes.attr('x', function (d) {
          return d.x - 5;
        }).attr('y', function (d) {
          return d.y - 5;
        });

        this.texts.attr('x', function (d) {
          return d.x;
        }).attr('y', function (d) {
          return d.y + d.height;
        });
        // tickCount++; if (tickCount>10) {   simulation.stop(); }

      }.bind(this); // jusque la on est dans le workspace changed

      RiotControl.trigger('workspace_current_refresh'); // et ici on est dans le mount

    }); // fin mount


  </script>

  <style scoped>
    svg {
      height:100vh;
      width: 100vw;
      background-color: lightgray;
      font-family: sans-serif;
    }
    line {
      stroke : #000;
      stroke-width : 1;
    }

    rect {
      filter:url(#dropshadow);
      fill: #fff;
    }
    text {
      cursor: default;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none; // pas necessaire pour ms edge  ?
      user-select: none;
    }

  </style>
</graph>
