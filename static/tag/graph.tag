<graph>
  <div class="commandBar containerH">
    <div class="containerH commandGroup" if={selectedNodes.length==1}>
      <div id="editButton" onclick={editClick} class="commandButton" }>
        edit
      </div>
      <div onclick={connectBeforeClick} class="{commandButton:true,activConnection:modeConnectBefore}">
        connect Before
      </div>
      <div onclick={connectAfterClick} class="{commandButton:true,activConnection:modeConnectAfter}" }>
        connect After
      </div>
      <div onclick={removeClick} class="commandButton" }>
        remove
      </div>
      <div id="workButton" onclick={workComponentClick} class="commandButton" }>
        run this component
      </div>
    </div>
    <div></div>
    <div class="containerH commandGroup">
      <div id="addComponent" onclick={addComponentClick} class="commandButtonImage" if={!opts.disallowcommand==true}>
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
      <g id="background" >
        <rect width="1500" height="900" class="background"></rect>
      </g>
      <g id="lineLayer"></g>
      <g id="shapeLayer"></g>
      <g id="shapeSelector"></g>
      <g id="textLayer"></g>
    </svg>
  </div>
  <!--graphContainer-->
  <script>
    this.selectedNodes = [];
    this.selectors = [];
    this.modeConnectAfter = false;
    this.modeConnectBefore = false;

    addComponentClick(e) {
      RiotControl.trigger('workspace_current_add_component_show', e);
    }

    editClick(e) {
      console.log('graph edit Component | ',this.selectedNodes[0].component);
      //RiotControl.trigger('component_current_show');
      RiotControl.trigger('component_current_select', this.selectedNodes[0].component);
    }

    removeClick(e) {
      RiotControl.trigger('workspace_current_delete_component', this.selectedNodes[0].component);
      //   RiotControl.trigger('workspace_current_persist'); RiotControl.trigger('component_current_select', this.selectedNodes);
    }

    connectBeforeClick(e) {
      RiotControl.trigger('item_current_connect_before_show');
    }

    connectAfterClick(e) {
      RiotControl.trigger('item_current_connect_after_show');
    }

    workComponentClick(e){
        RiotControl.trigger('item_current_work');
    }

    //this.selectedNodes={}; source urile : https://bl.ocks.org/mbostock/1095795 Constants for the SVG
    var width = 1500,
      height = 900; // utilisé dans le script en bas

    /*
    Fonctions
  */
    this.drawSelected = function () {
      console.log(this.selectedNodes);
      this.selectors = this.svg.select("#shapeSelector").selectAll("rect").data(this.selectedNodes, function (d) {
        return d.id + 'selected';
      });
      this.selectors.exit().remove();
      this.selectors = this.selectors.enter().append("rect").attr("width", function (d) { // width et height definis plus haut par bbox
        return 240;
      }).attr("height", function (d) {
        return 90;
      }).attr("rx", function (d) {
        return 10;
      }).attr("ry", function (d) {
        return 10;
      }).attr('x', function (d) {
        return d.x - 10;
      }).attr('y', function (d) {
        return d.y - 10;
      }).attr('class', function (d) {
        return 'selector';
      }).call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));
    }

    // fonctions déplacements ( glissé )
    this.dragstarted = function (d) { // d le est le noeud, this est le composant riot js graph
      d.xOrigin = d.x;
      d.yOrigin = d.y;
    };

    this.dragged = function (dragged) {
      dragged.x = d3.event.x;
      dragged.y = d3.event.y;
      //d3.select(this).attr("x", dragged.x).attr("y", dragged.y); //this représente le DOM
      this.nodes = this.svg.select("#shapeLayer").selectAll("image").data([dragged], function (d) {
        return d.id;
      }).attr("x", dragged.x).attr("y", dragged.y);
      this.selectors = this.svg.select("#shapeSelector").selectAll("rect").data([dragged], function (d) {
        return d.id;
      }).attr("x", dragged.x - 10).attr("y", dragged.y - 10);
      let beforeLinks = sift({
        "target.id": dragged.id
      }, this.graph.links);
      this.links = this.svg.select("#lineLayer").selectAll("line").data(beforeLinks, function (d) {
        return d.id;
      }).attr("x2", dragged.x + 55).attr("y2", dragged.y + 35);
      let afterLinks = sift({
        "source.id": dragged.id
      }, this.graph.links);
      this.links = this.svg.select("#lineLayer").selectAll("line").data(afterLinks, function (d) {
        return d.id;
      }).attr("x1", dragged.x + 165).attr("y1", dragged.y + 35);
    }.bind(this);

    this.dragended = function (d) {

      if (d.x == d.xOrigin && d.y == d.yOrigin) {
        //console.log('CLICK'); let selectedNode = d; selectedNode.mainObjectId = d.id;
        if (this.modeConnectBefore || this.modeConnectAfter) {
          if(this.modeConnectBefore){
            //console.log(d.component,this.selectedNodes[0].component);
            RiotControl.trigger('connect_components', d.component,this.selectedNodes[0].component);
          }
          if(this.modeConnectAfter){
            console.log(d.component,this.selectedNodes[0].component);
            RiotControl.trigger('connect_components',this.selectedNodes[0].component, d.component);
          }
        } else {
          this.selectedNodes = [d];
          RiotControl.trigger('component_current_set',d.component);
          this.drawSelected();
          this.update();
        }
        //RiotControl.trigger('component_current_show'); RiotControl.trigger('component_current_select', d.component);
      } else {
        console.log('dragended');
        RiotControl.trigger('item_updateField', {
          id: d.id,
          field: "graphPositionX",
          data: d.x
        });
        RiotControl.trigger('item_updateField', {
          id: d.id,
          field: "graphPositionY",
          data: d.y
        });
        RiotControl.trigger('workspace_current_persist');
        // this.updateBoundObject(d); this.drawSelected(); if (!d3.event.active) {   this.simulation.alphaTarget(0.1); }
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
        if (record.connectionsBefore.length == 0 && record.graphPositionX == undefined && record.graphPositionY == undefined) {
          inputs++;
        }
        if (record.connectionsAfter.length == 0 && record.graphPositionX == undefined && record.graphPositionY == undefined) {
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
        var node = {};
        if (record.connectionsBefore.length == 0 && record.graphPositionX == undefined && record.graphPositionY == undefined) { // si rien n est connecte avant
          node = {
            text: record.type, //-
            id: record._id,
            graphIcon: record.graphIcon,
            // fx: record.graphPositionX || 10, //positionne l'élémént sur le bord gauche fy: record.graphPositionY || inputCurrentOffset,
            x: record.graphPositionX || 10, //positionne l'élémént sur le bord gauche
            y: record.graphPositionY || inputCurrentOffset,
            component: record
          }
          inputCurrentOffset += inputsOffset;
        } else if (record.connectionsAfter.length == 0 && record.graphPositionX == undefined && record.graphPositionY == undefined) {
          node = {
            text: record.type,
            id: record._id,
            graphIcon: record.graphIcon,
            // fx: record.graphPositionX || width - 10 - record.type.length * 10, // positionne l'element en largeur par rapport au bord droit du graphe fy: record.graphPositionY || outputCurrentOffset,
            x: record.graphPositionX || width - 10 - record.type.length * 10, // positionne l'element en largeur par rapport au bord droit du graphe
            y: record.graphPositionY || outputCurrentOffset,
            component: record
          }
          outputCurrentOffset += outputsOffset;
        } else { // tous ceux du milieu
          node = {
            text: record.type,
            id: record._id,
            graphIcon: record.graphIcon,
            x: record.graphPositionX || width / 2,
            y: record.graphPositionY || height / 2,
            component: record
          }

        }
        this.graph.nodes.push(node);
      }

      for (record of data.components) {
        for (connection of record.connectionsAfter) {
          this.graph.links.push({
            source: sift({
              id: record._id
            }, this.graph.nodes)[0],
            target: sift({
              id: connection._id
            }, this.graph.nodes)[0],
            id: record._id + '-' + connection._id
          }) // creation de tous les links
        }
      }

      console.log(this.graph);

      if (this.svg == undefined) {
        this.svg = d3.select("svg");
      }

      d3.select("#background").on("click",function(d){
        //console.log('CLICK ON main',d3.select(this));
        this.selectedNodes = [];
        RiotControl.trigger('component_current_set',undefined);
        this.drawSelected();
        this.update();
      }.bind(this));

      // if (this.simulation == undefined) {   /*   this.simulation = d3.forceSimulation(this.graph.nodes).force("charge", d3.forceManyBody().strength(-1000)).force("link", d3.forceLink([]).id(function (d) {     return d.id // cela semble désigner l'id des
      // noeud (comment les liens retrouvent la propriété id des noeud) ne pas toujours chercher a comprendre comment d3 marche, mais c est necessaire )   }).distance(200)).force("x", d3.forceX()).force("y", d3.forceY()).alphaTarget(1).on("tick",
      // this.ticked);   */
      //
      //   this.simulation = d3.forceSimulation(this.graph.nodes).velocityDecay(0.9).force('link', d3.forceLink(this.graph.links).id(function (d) {     return d.id // ( ne pas toujours chercher a comprendre comment d3 marche, mais c est necessaire )
      // })).force("collide", d3.forceCollide().radius(30).iterations(2)).on("tick", this.ticked);
      //
      // }

      this.links = this.svg.select("#lineLayer").selectAll('line').data(this.graph.links, function (d) {
        return d.id;
      });
      this.links.exit().remove();
      this.links = this.links.enter().append('line').attr('x1', function (d) {
        return d.source.x + 165;
      }).attr('y1', function (d) {
        return d.source.y + 35;
      }).attr('x2', function (d) {
        return d.target.x + 55;
      }).attr('y2', function (d) {
        return d.target.y + 35;
      }).merge(this.links)

      this.nodes = this.svg.select("#shapeLayer").selectAll("image").data(this.graph.nodes, function (d) {
        return d.id;
      });
      this.nodes.exit().remove();
      this.nodes = this.nodes.enter().append("image").attr("xlink:href", function (d) {
        return 'image/components/' + d.graphIcon;
      }).attr("width", function (d) {
        return 220;
      }).attr("height", function (d) {
        return 70;
      }).attr('x', function (d) {
        return d.x;
      }).attr('y', function (d) {
        return d.y;
      }).attr('data-id', function (d) {
        return d.id;
      }).call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended)).merge(this.nodes);

      if (this.selectedNodes.length>0){
        this.selectedNodes=sift({id:{$in:this.selectedNodes.map(s=>s.id)}},this.graph.nodes);
        this.drawSelected();
      }

      // this.simulation.nodes(this.graph.nodes); this.simulation.force("link").links(this.graph.links); this.simulation.alpha(1).restart();

    }.bind(this);

    this.on('unmount', function () {
      //this.simulation.stop();
      RiotControl.off('workspace_current_changed', this.refreshGraph);
    });


    // this.ticked = function () {
    //   console.log("ticked");
    //   this.links.attr('x1', function (d) {
    //     return d.source.x + 165;
    //   }).attr('y1', function (d) {
    //     return d.source.y + 35;
    //   }).attr('x2', function (d) {
    //     return d.target.x + 55;
    //   }).attr('y2', function (d) {
    //     return d.target.y + 35;
    //   });
    //
    //   this.nodes.attr('x', function (d) {
    //     return d.x - 5;
    //   }).attr('y', function (d) {
    //     return d.y - 5;
    //   });
    //   if (this.selectors.length > 0) {
    //     this.selectors.attr('x', function (d) {
    //       return d.x - 5;
    //     }).attr('y', function (d) {
    //       return d.y - 5;
    //     });
    //   }
    //
    //   // this.texts.attr('x', function (d) {   return d.x; }).attr('y', function (d) {   return d.y + d.height; }); tickCount++; if (tickCount>10) {   simulation.stop(); }
    //
    // }.bind(this); // jusque la on est dans le workspace changed

    RiotControl.on('item_curent_connect_show_changed', function (modes) {
      console.log('item_curent_connect_show_changed', modes);
      this.modeConnectAfter = modes.after;
      this.modeConnectBefore = modes.before;
      this.update();
    }.bind(this));

    // evenement appele par riot
    this.on('mount', function () { // mount du composant riot

      RiotControl.on('workspace_current_changed', this.refreshGraph);
      RiotControl.trigger('workspace_current_refresh'); // et ici on est dans le mount

    }); // fin mount

    this.on('unmount', function () { // mount du composant riot
      RiotControl.off('workspace_current_changed', this.refreshGraph);
    });
  </script>

  <style scoped>
    svg {
      //background-color: #EFEFEF;
    }
    line {
      stroke: #000;
      stroke-width: 1;
    }

    .selector {
      //filter:url(#dropshadow);
      fill: #649DF9;
      fill-opacity : 0.4
    }

    .background {
      fill: white;
      fill-opacity : 1;
      stroke: #000;
      stroke-width: 1;
    }
    text {
      cursor: default;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none; // pas necessaire pour ms edge  ?
      user-select: none;
    }

    .activConnection {
      background-color: orange !important;
      color: white;
    }

  </style>
</graph>
