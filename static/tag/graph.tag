<graph>
  <div class="commandBar containerH">
    <div class="containerH commandGroup" if={currentComponent!=undefined}>
      <div onclick={editClick} class="commandButton" }>
        edit
      </div>
      <div class="commandButton" }>
        connect Before
      </div>
      <div class="commandButton" }>
        connect After
      </div>
      <div class="commandButton" }>
        remove
      </div>
      <div class="commandButton" }>
        run this component
      </div>
    </div>
    <div></div>
    <div class="containerH commandGroup">
      <div onclick={addComponentClick} class="commandButtonImage" if={!opts.disallowcommand==true}>
        <img src="./image/Super-Mono-png/PNG/basic/blue/toggle-expand-alt.png" height="40px">
      </div>
    </div>
  </div>
  <div id="graphContainer containerV">
    <svg viewBox="0 0 1500 900">
      <!--width="1000" height="600"-->
      <filter id="dropshadow" x="1%" y="1%" width="110%" height="110%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
        <!-- stdDeviation is how much to blur -->
        <feOffset dx="-2" dy="-1" result="offsetblur1"/>
        <feColorMatrix type="luminanceToAlpha"/>
        <feOffset dx="2" dy="2" result="offsetblur2"/>
        <feMerge>
          <!--used to combine filters-->
          <feMergeNode in="offsetblur1"/>
          <feMergeNode in="offsetblur2"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <g id="shapeLayer"></g>
      <g id="textLayer"></g>
    </svg>
  </div>
  <!--graphContainer-->
  <script>

    addComponentClick(e) {
      RiotControl.trigger('workspace_current_add_component_show', e);
    }

    editClick(e) {
      RiotControl.trigger('component_current_show');
      RiotControl.trigger('component_current_select', this.currentComponent);
    }

    //this.currentComponent={}; source urile : https://bl.ocks.org/mbostock/1095795 Constants for the SVG
    var width = 1500,
      height = 900; // utilisé dans le script en bas

    /*
    Fonctions
  */

    // fonctions déplacements ( glissé )
    this.dragstarted = function (d) { // d le est le noeud, this est le composant riot js graph
      // if (!d3.event.active) {   this.simulation.alphaTarget(1.0).restart(); }
      d.fx = d.x;
      d.fy = d.y;
      d.xOrigin = d.x;
      d.yOrigin = d.y;
    }.bind(this); // permet de conserver this pour la prochaine execution de la fonction

    this.dragged = function (d) {
      //console.log('dragged',d3.event.x);
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }.bind(this);

    this.dragended = function (d) {

      if (d.fx == d.xOrigin && d.fy == d.yOrigin) {
        console.log('CLICK');
        this.currentComponent = d.component;
        this.update();
        //RiotControl.trigger('component_current_show'); RiotControl.trigger('component_current_select', d.component);
      } else {
        console.log('dragended');
        RiotControl.trigger('item_updateField', {
          id: d.id,
          field: "graphPositionX",
          data: d.fx
        });
        RiotControl.trigger('item_updateField', {
          id: d.id,
          field: "graphPositionY",
          data: d.fy
        });
        RiotControl.trigger('workspace_current_persist');
        if (!d3.event.active) {
          this.simulation.alphaTarget(0.1);
        }
      }
    }.bind(this);

    this.refreshGraph = function (data) {

      //this.svg.selectAll("*").remove();
      console.log('GRAPH | workspace_current_changed ', data);
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

      // console.log(inputs, outputs); calcule une distance type pour positionner les inputs et outputs du graphe
      var inputsOffset = height / (inputs + 1);
      var outputsOffset = height / (outputs + 1);

      var inputCurrentOffset = inputsOffset;
      var outputCurrentOffset = outputsOffset;

      //console.log(inputsOffset, outputsOffset);

      for (record of data.components) {
        if (record.connectionsBefore.length == 0) { // si rien n est connecte avant
          this.graph.nodes.push({
            text: record.type, //-
            id: record._id,
            graphIcon: record.graphIcon,
            fx: record.graphPositionX || 10, //positionne l'élémént sur le bord gauche
            fy: record.graphPositionY || inputCurrentOffset,
            component: record
          });
          inputCurrentOffset += inputsOffset;
        } else if (record.connectionsAfter.length == 0) {
          this.graph.nodes.push({
            text: record.type,
            id: record._id,
            graphIcon: record.graphIcon,
            fx: record.graphPositionX || width - 10 - record.type.length * 10, // positionne l'element en largeur par rapport au bord droit du graphe
            fy: record.graphPositionY || outputCurrentOffset,
            component: record
          });
          outputCurrentOffset += outputsOffset;
        } else { // tous ceux du milieu
          var node = {
            text: record.type,
            id: record._id,
            graphIcon: record.graphIcon,
            x: record.graphPositionX || width / 2,
            y: record.graphPositionY || height / 2, // on laisse a la force le soin de les repartir
            component: record
          }

          if (record.graphPositionX != undefined) {
            node.fx = record.graphPositionX;
          } else {
            node.x = width / 2;
          }

          if (record.graphPositionY != undefined) {
            node.fy = record.graphPositionY;
          } else {
            node.y = height / 2;
          }

          this.graph.nodes.push(node);
        }
        for (connection of record.connectionsAfter) {
          // console.log('connection (After)', connection._id);
          this.graph.links.push({
            source: record._id,
            target: connection._id,
            id: record._id + '-' + connection._id
          }) // creation de tous les links
        }
      }
      console.log(this.graph);

      // lancement de la simulation console.log("simulation start", this.graph.nodes) console.log("simulation start", this.graph.links) console.log("fin simulation") les texts this.texts =
      // this.svg.select("#textLayer").selectAll("text").data(this.graph.nodes); this.texts.exit().remove(); //this.texts = this.texts.enter().append("text").merge(this.texts) //  utiliser tspan ??? this.texts = this.texts.enter().append("text") //
      // .attr("r",20) .attr("cx",function(d){return d.x;}) .attr("cy",function(d){return d.y;})   .attr("fill", "#000") //.attr("opacity",0.5) // .attr("width", "20") .attr("height","20")   .text(function (d) { return d.text; }).each(function (d) {
      // d.width = this.getBBox().width;   d.height = this.getBBox().height; }); //; desactive pour l instant call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended)); les links

      if (this.svg == undefined) {
        this.svg = d3.select("svg");
      }

      if (this.simulation == undefined) {
        /*
        this.simulation = d3.forceSimulation(this.graph.nodes).force("charge", d3.forceManyBody().strength(-1000)).force("link", d3.forceLink([]).id(function (d) {
          return d.id // cela semble désigner l'id des noeud (comment les liens retrouvent la propriété id des noeud) ne pas toujours chercher a comprendre comment d3 marche, mais c est necessaire )
        }).distance(200)).force("x", d3.forceX()).force("y", d3.forceY()).alphaTarget(1).on("tick", this.ticked);
        */

        this.simulation = d3.forceSimulation(this.graph.nodes).velocityDecay(0.9).force('link', d3.forceLink(this.graph.links).id(function (d) {
          return d.id // ( ne pas toujours chercher a comprendre comment d3 marche, mais c est necessaire )
        })).force("collide", d3.forceCollide().radius(30).iterations(2)).on("tick", this.ticked);

      }

      this.links = this.svg.select("#shapeLayer").selectAll('line').data(this.graph.links, function (d) {
        return d.id;
      });
      this.links.exit().remove();
      this.links = this.links.enter().append('line').merge(this.links)

      this.nodes = this.svg.select("#shapeLayer").selectAll("image").data(this.graph.nodes, function (d) {
        return d.id;
      });
      this.nodes.exit().remove();
      this.nodes = this.nodes.enter().append("image").attr("xlink:href", function (d) {
        return 'image/components/' + d.graphIcon;
      }).attr("width", function (d) { // width et height definis plus haut par bbox
        return 220;
      }).attr("height", function (d) {
        return 70;
      }).call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended)).merge(this.nodes);

      // les nodes this.nodes = this.svg.select("#shapeLayer").selectAll("image").data(this.graph.nodes); this.nodes.exit().remove(); // this.nodes = this.nodes.enter().append("rect").merge(this.nodes). //  utiliser tspan ??? this.nodes =
      // this.nodes.enter().append("rect").attr("width", function (d) { // width et height definis plus haut par bbox   return d.width + 10; // }).attr("height", function(d){   return d.height + 10; }) this.nodes =
      // this.nodes.enter().append("image").attr("xlink:href", function (d) {   return 'image/components/' + d.graphIcon; }).attr("width", function (d) { // width et height definis plus haut par bbox   return 220; }).attr("height", function (d) {   return
      // 70; }) //  .attr("x",function(d){return d.x;})  .attr("y",function(d){return d.y;}) .attr("fill", "#e5e5ff") //.attr("opacity",0.5) .text(function(d){return d.text;})   .call(d3.drag().on("start", this.dragstarted).on("drag",
      // this.dragged).on("end", this.dragended)); if (this.svg == undefined) {

      this.simulation.nodes(this.graph.nodes);
      this.simulation.force("link").links(this.graph.links);
      this.simulation.alpha(1).restart();

      // .force('center', d3.forceCenter(width / 2, height / 2)) .force("x", d3.forceX().strength(0.002)) .force("y", d3.forceY().strength(0.002)) .on("tick", ticked); var simulation = d3.forceSimulation(graph.nodes)     .force('charge',
      // d3.forceManyBody()) //.distanceMax(500).strength(-0.8)) // .distanceMax(220))     .force('link', d3.forceLink(graph.links).strength(2))     // .distance(20).strength(1)     .force('center', d3.forceCenter(width / 2, height / 2)); } attache l
      // evenement

    }.bind(this);

    this.on('unmount', function () {
      this.simulation.stop();
      RiotControl.off('workspace_current_changed', this.refreshGraph);
    });

    // grace a RiotControl.on controller
    this.ticked = function () {
      console.log("ticked");
      this.links.attr('x1', function (d) {
        return d.source.x + 165;
      }).attr('y1', function (d) {
        return d.source.y + 35;
      }).attr('x2', function (d) {
        return d.target.x + 55;
      }).attr('y2', function (d) {
        return d.target.y + 35;
      });

      this.nodes.attr('x', function (d) {
        return d.x - 5;
      }).attr('y', function (d) {
        return d.y - 5;
      });

      // this.texts.attr('x', function (d) {   return d.x; }).attr('y', function (d) {   return d.y + d.height; }); tickCount++; if (tickCount>10) {   simulation.stop(); }

    }.bind(this); // jusque la on est dans le workspace changed

    // evenement appele par riot
    this.on('mount', function () { // mount du composant riot

      RiotControl.on('workspace_current_changed', this.refreshGraph);
      RiotControl.trigger('workspace_current_refresh'); // et ici on est dans le mount

    }); // fin mount
  </script>

  <style scoped>
    svg {
      background-color: #EFEFEF;
    }
    line {
      stroke: #000;
      stroke-width: 1;
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
