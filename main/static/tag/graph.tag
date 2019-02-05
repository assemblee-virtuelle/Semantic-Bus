<graph class="containerV background-grill">
  <!-- page graph -->
  <div id="graphContainer" style="flex-grow:1;" class="containerH background-grill">
    <svg ref="graphSvgCanvas" style="flex-grow:1;">
      <filter id="dropshadow" x="1%" y="1%" width="110%" height="110%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
        <feOffset dx="-2" dy="-1" result="offsetblur1"/>
        <feColorMatrix type="luminanceToAlpha"/>
        <feOffset dx="2" dy="2" result="offsetblur2"/>
        <feMerge>
          <feMergeNode in="offsetblur1"/>
          <feMergeNode in="offsetblur2"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <g class="axis axis--x"></g>
      <g class="axis axis--y"></g>
      <g id="main-container">
        <rect width="1500"  height="900" id="background" class="background" ref"graph"></rect>
        <g id="lineSelector"></g>
        <g id="lineLayer"></g>
        <g id="stateLayer"></g>
        <g id="shapeSelector"></g>
        <g id="shapeLayer"></g>
        <svg id="textLayer">
          <rect class="tooltip" width="220" height="30"></rect>
          <text x="10" y="20" width="200" height="20"></text>
        </svg>
        <g id="lineCommandLayer"></g>
        <g id="shapeCommandLayer"></g>
      </g>

    </svg>
  </div>
    <!-- Bouton ajouter un composant -->
  <div class="containerH" style="flex-basis:45px; justify-content:center;flex-shrink:0;flex-grow:0;" >
    <div onclick={showAddComponentClick} title="Ajouter un composant" class="commandButtonImage">
      <img src="./image/ajout_composant.svg" height="40px" width="40px">
    </div>
  </div>

  <!--graphContainer-->
  <script>
    this.selectedNodes = [];
    this.selectorsNodes = [];
    this.selectedLines = [];
    this.selectorsLines = [];
    this.modeConnectAfter = false;
    this.modeConnectBefore = false;
    this.fullscreen = true;
    this.cubeResolution = 50;
    this.selectedElement;
    this.offset;
    this.initGraphDone = false;
    this.transform
    
    showAddComponentClick(e) {
      route('workspace/' + this.graph.workspace._id + '/addComponent');
    }

    this.drawSelected = function () {
      this.selectedNodes = sift({
        'selected': true
      }, this.graph.nodes);

      this.modeConnectAfter = sift({
        'connectAfterMode': true
      }, this.graph.nodes).length > 0;
      this.modeConnectBefore = sift({
        'connectBeforeMode': true
      }, this.graph.nodes).length > 0;

      //console.log(this.selectedNodes);
      this.selectorsNodes = this.svg.select("#shapeSelector").selectAll("rect").data(this.selectedNodes, function (d) {
        return d.id + '-selected';
      });
      this.selectorsNodes.exit().remove();
      this.selectorsNodes = this.selectorsNodes.enter().append("rect").merge(this.selectorsNodes).attr("width", function (d) { // width et height definis plus haut par bbox
        return 280;
      }).attr("height", function (d) {
        return 130;
      }).attr("rx", function (d) {
        return 10;
      }).attr("ry", function (d) {
        return 10;
      }).attr('x', function (d) {
        return d.x - 30;
      }).attr('y', function (d) {
        return d.y - 30;
      }).attr("class", function (d) {
        return 'connectBeforeButtonGraph';
      }).attr("data-id", function (d) {
        return d.id;
      }).call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));
      //
      // var cloneString = d3.select("#componentCommandBarModel").node().cloneNode(true).outerHTML; console.log(cloneString);

      this.selectorsShapeCommandeBar = this.svg.select("#shapeCommandLayer").selectAll("svg").data(this.selectedNodes, function (d) {
        return d.id + '-shapeCommandBarComponent';
      });
      this.selectorsShapeCommandeBar.exit().remove();
      this.selectorsShapeCommandeBar = this.selectorsShapeCommandeBar.enter().append("svg").merge(this.selectorsShapeCommandeBar).attr('x', function (d) {
        return d.x - 30;
      }).attr('y', function (d) {
        return d.y - 30;
      }).each(function (d) {
        d3.select(this).selectAll("image").remove();
        d3.select(this).append("image").attr("xlink:href", function (d) {
          let image = "";
          if (d.connectBeforeMode == true) {
            image = "./image/Super-Mono-png/PNG/basic/green/toggle-expand.png";
          } else {
            image = "./image/Super-Mono-png/PNG/basic/green/toggle-expand-alt.png";
          }
          return image;
        }).attr("width", function (d) {
          return 30;
        }).attr("height", function (d) {
          return 30;
        }).attr("x", function (d) {
          return 0;
        }).attr("y", function (d) {
          return 50;
        }).on("click", function (d) {
          RiotControl.trigger('item_current_connect_before_show');
        });

        d3.select(this).append("image").attr("xlink:href", function (d) {
          return "./image/Super-Mono-png/PNG/basic/blue/document-edit.png";
        }).attr("width", function (d) {
          return 30;
        }).attr("height", function (d) {
          return 30;
        }).attr("x", function (d) {
          return 60;
        }).attr("y", function (d) {
          return 100;
        }).attr("class", function (d) {
          return 'editButtonGraph';
        }).attr("data-id", function (d) {
          return d.id;
        }).on("click", function (d) {
          route(`workspace/${d.component.workspaceId}/component/${d.component._id}`);
          //RiotControl.trigger('component_current_select', d.component);
        });

        d3.select(this).append("image").attr("xlink:href", function (d) {
          return "./image/Super-Mono-png/PNG/basic/blue/button-play.png";
        }).attr("width", function (d) {
          return 30;
        }).attr("height", function (d) {
          return 30;
        }).attr("x", function (d) {
          return 120;
        }).attr("y", function (d) {
          return 100;
        }).attr("class", function (d) {
          return 'workButtonGraph';
        }).attr("data-id", function (d) {
          return d.id;
        }).on("click", function (d) {
          RiotControl.trigger('item_current_work');
        });

        if (d.status && d.status != 'waiting') {
          d3.select(this).append("image").attr("xlink:href", function (d) {
            return "./image/Super-Mono-png/PNG/sticker/icons/outbox.png";
          }).attr("width", function (d) {
            return 30;
          }).attr("height", function (d) {
            return 30;
          }).attr("x", function (d) {
            return 120;
          }).attr("y", function (d) {
            return 0;
          }).attr("class", function (d) {
            return 'workButtonGraph';
          }).attr("data-id", function (d) {
            return d.id;
          }).on("click", function (d) {
            RiotControl.trigger('component_preview');
          });
        }

        d3.select(this).append("image").attr("xlink:href", function (d) {
          return "./image/Super-Mono-png/PNG/basic/red/bin.png";
        }).attr("width", function (d) {
          return 30;
        }).attr("height", function (d) {
          return 30;
        }).attr("x", function (d) {
          return 180;
        }).attr("y", function (d) {
          return 100;
        }).attr("class", function (d) {
          return 'deleteButtonGraph';
        }).attr("data-id", function (d) {
          return d.id;
        }).on("click", function (d) {
          RiotControl.trigger('workspace_current_delete_component', d.component);
        });

        d3.select(this).append("image").attr("xlink:href", function (d) {
          let image = "";
          if (d.connectAfterMode == true) {
            image = "./image/Super-Mono-png/PNG/basic/green/toggle-expand.png";
          } else {
            image = "./image/Super-Mono-png/PNG/basic/green/toggle-expand-alt.png";
          }
          return image;
        }).attr("width", function (d) {
          return 30;
        }).attr("height", function (d) {
          return 30;
        }).attr("x", function (d) {
          return 250;
        }).attr("y", function (d) {
          return 50;
        }).attr("class", function (d) {
          return 'connectAfterButtonGraph';
        }).attr("data-id", function (d) {
          return d.id;
        }).on("click", function (d) {
          RiotControl.trigger('item_current_connect_after_show');
        });
      });

      // }
      //
      // this.drawSelectedLines = function (selectedLines) {
      this.selectedLines = sift({
        'selected': true
      }, this.graph.links);
      //console.log(this.selectedNodes);
      this.selectorsLines = this.svg.select("#lineSelector").selectAll("line").data(this.selectedLines, function (d) {
        return d.id + 'selected';
      });
      this.selectorsLines.exit().remove();
      this.selectorsLines = this.selectorsLines.enter().append("line").merge(this.selectorsLines).attr('x1', function (d) {
        //return d.source.x + 165;
        return d.source.x + 110;
      }).attr('y1', function (d) {
        //return d.source.y + 35;
        return d.source.y + 35;
      }).attr('x2', function (d) {
        // return d.target.x + 55;
        return d.target.x + 110;
      }).attr('y2', function (d) {
        //return d.target.y + 35;
        return d.target.y + 35;
      });

      this.selectorsLineCommandeBar = this.svg.select("#lineCommandLayer").selectAll("svg").data(this.selectedLines, function (d) {
        return d.id + '-lineCommandBarComponent';
      });
      this.selectorsLineCommandeBar.exit().remove();
      this.selectorsLineCommandeBar = this.selectorsLineCommandeBar.enter().append("svg").merge(this.selectorsLineCommandeBar).attr('x', function (d) {
        return ((d.source.x + d.target.x) / 2) + 95;
      }).attr('y', function (d) {
        return ((d.source.y + d.target.y) / 2) + 10;
      }).each(function (d) {
        d3.select(this).append("image").attr("xlink:href", function (d) {
          return "./image/Super-Mono-png/PNG/basic/red/bin.png";
        }).attr("width", function (d) {
          return 30;
        }).attr("height", function (d) {
          return 30;
        }).attr("x", function (d) {
          return 0;
        }).attr("y", function (d) {
          return 0;
        }).on("click", function (d) {
          RiotControl.trigger('disconnect_components', d);

        });
      });

      this.update();
    }.bind(this);

    // fonctions déplacements ( glissé )
    this.dragstarted = function (d) { // d le est le noeud, this est le composant riot js graph
      d.xOrigin = d.x;
      d.yOrigin = d.y;
    };

    function snapToGrid(p, r) {
      return Math.round(p / r) * r;
    }

    this.dragged = function (dragged) {
      let containerStyle = document.querySelector('#graphContainer').getBoundingClientRect();
      let width = containerStyle.width ;
      let height = containerStyle.height;
      var boxSize = width/this.cubeResolution;

      dragged.x = d3.event.x;
      dragged.y = d3.event.y;
      var start_x = d3.event.x;
      var start_y = d3.event.y;

      let gridX = snapToGrid(d3.event.x, this.cubeResolution);
      let gridY = snapToGrid(d3.event.y, this.cubeResolution)

      RiotControl.trigger('workspace_current_move_component', dragged);

      this.nodes = this.svg.select("#shapeLayer").selectAll("image").data([dragged], function (d) {
        return d.id;
      }).attr("x", gridX).attr("y", gridY);
      this.selectorsNodes = this.svg.select("#shapeSelector").selectAll("rect").data([dragged], function (d) {
        return d.id;
      }).attr("x", gridX - 30).attr("y", gridY - 30);

      this.selectorsShapeCommandeBar = this.svg.select("#shapeCommandLayer").selectAll("svg").data([dragged], function (d) {
        return d.id;
      }).attr("x", gridX - 30).attr("y", gridY - 30);

      let beforeLinks = sift({
        "target.id": dragged.id
      }, this.graph.links);
      //console.log('beforeLinks', beforeLinks);
      this.links = this.svg.select("#lineLayer").selectAll("line").data(beforeLinks, function (d) {
        return d.id;
      }).attr("x2", gridX + 110).attr("y2", gridY + 35);
      let beforeLinksSelected = sift({
        "target.id": dragged.id
      }, this.selectedLines);
      this.selectorsLines = this.svg.select("#lineSelector").selectAll("line").data(beforeLinksSelected, function (d) {
        return d.id;
      }).attr("x2", gridX + 110).attr("y2", gridY + 35);
      this.selectorsLineCommandeBar = this.svg.select("#lineCommandLayer").selectAll("svg").data(beforeLinksSelected, function (d) {
        return d.id;
      }).attr('x', function (d) {
        return ((d.source.x + dragged.x) / 2) + 95;
      }).attr('y', function (d) {
        return ((d.source.y + gridY) / 2) + 10;
      });

      let afterLinks = sift({
        "source.id": dragged.id
      }, this.graph.links);

      this.links = this.svg.select("#lineLayer").selectAll("line").data(afterLinks, function (d) {
        return d.id;
      }).attr("x1", gridX + 110).attr("y1", gridY + 35)
      let afterLinksSelected = sift({
        "source.id": dragged.id
      }, this.selectedLines);
      this.selectorsLines = this.svg.select("#lineSelector").selectAll("line").data(afterLinksSelected, function (d) {
        return d.id;
      }).attr("x1", gridX + 110).attr("y1", gridY + 35);
      this.selectorsLineCommandeBar = this.svg.select("#lineCommandLayer").selectAll("svg").data(afterLinksSelected, function (d) {
        return d.id;
      }).attr('x', function (d) {
        return ((gridX + d.target.x) / 2) + 95;
      }).attr('y', function (d) {
        return ((gridY + d.target.y) / 2) + 10;
      });

      let nodesWithStatus = sift({
        $and: [
          {
            status: {
              $exists: true
            }
          }, {
            id: dragged.id
          }
        ]
      }, this.graph.nodes);

      this.status = this.svg.select("#stateLayer").selectAll("circle").data(nodesWithStatus, function (d) {
        return d.id;
      }).attr('cx', function (d) {
        return gridX + 105;
      }).attr('cy', function (d) {
        return gridY + 5;
      });

    }.bind(this);

    this.dragended = function (d) {

      if (d.x == d.xOrigin && d.y == d.yOrigin) {
        //console.log('CLICK'); let selectedNode = d; selectedNode.mainObjectId = d.id;
        if (this.modeConnectBefore || this.modeConnectAfter) {
          if (this.modeConnectBefore) {
            //console.log(d.component,this.selectedNodes[0].component);
            RiotControl.trigger('connect_components', d.component, this.selectedNodes[0].component);
          }
          if (this.modeConnectAfter) {
            //console.log(d.component, this.selectedNodes[0].component);
            RiotControl.trigger('connect_components', this.selectedNodes[0].component, d.component);
          }
        } else {
          //this.selectedLines = []; this.drawSelectedLines(); this.selectedNodes = [d];
          RiotControl.trigger('component_current_set', d.component);
          this.tooltip.classed("tooltipHide", true);
          //this.drawSelected(); this.update();
        }
        //RiotControl.trigger('component_current_show'); RiotControl.trigger('component_current_select', d.component);
      } else {
        console.log('dragended');
        // RiotControl.trigger('item_updateField', {   id: d.id,   field: "graphPositionX",   data: d.x }); RiotControl.trigger('item_updateField', {   id: d.id,   field: "graphPositionY",   data: d.y });
        d.component.graphPositionX = d.x;
        d.component.graphPositionY = d.y;
        RiotControl.trigger('item_persist', d.component);

        // this.updateBoundObject(d); this.drawSelected(); if (!d3.event.active) {   this.simulation.alphaTarget(0.1); }
      }
    }.bind(this);

    this.drawGraph = function (graph) {
      this.graph = graph;
      if(this.graph.startPosition.x ){
      
        if (this.svg == undefined) {
          this.svg = d3.select("svg");
        } 

        this.links = this.svg.select("#lineLayer").selectAll('line').data(graph.links, function (d) {
          return d.id;
        });
        this.links.exit().remove();

        this.links = this.links.enter().append('line').merge(this.links)
        .attr('x1', function (d) {
          //return d.source.x + 165;
          return d.source.x + 110;
        }).attr('y1', function (d) {
          //return d.source.y + 35;
          return d.source.y + 35;
        }).attr('x2', function (d) {
          // return d.target.x + 55;
          return d.target.x + 110;
        }).attr('y2', function (d) {
          //return d.target.y + 35;
          return d.target.y + 35;
        })
        .on("click", function (d) {
          //console.log('click line |', d); this.selectedNodes = []; this.drawSelected(); this.selectedLines = [d]; this.drawSelectedLines(); this.update();
          RiotControl.trigger('connection_current_set', d.source.component, d.target.component);
        }.bind(this));

        this.nodes = this.svg.select("#shapeLayer").selectAll("image").data(graph.nodes, function (d) {
          return d.id;
        });
        this.nodes.exit().remove();
        this.nodes = this.nodes.enter().append("image").merge(this.nodes).attr("xlink:href", function (d) {
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
        }).on('mouseover', (d) => {
          //console.log("mouseover",d);
          if (!d.selected == true && d.component.name!=undefined) {
            this.tooltip.classed("tooltipHide", false);
            this.tooltip.attr('x', d.x).attr('y', d.y + 100).select('text').html(d.component.name);
          }
        }).on('mouseout', (d) => {
          this.tooltip.classed("tooltipHide", true);
        }).call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));

        let nodesWithStatus = sift({
          status: {
            $exists: true
          }
        }, graph.nodes);
        this.status = this.svg.select("#stateLayer").selectAll("circle").data(nodesWithStatus, function (d) {
          return d.id;
        });
        this.status.exit().remove();
        this.status = this.status.enter().append("circle").merge(this.status).attr("r", function (d) {
          return 40;
        }).attr('cx', function (d) {
          return d.x + 105;
        }).attr('class', function (d) {
          return d.status;
        }).attr('cy', function (d) {
          return d.y + 5;
        }).attr('data-id', function (d) {
          return d.id;
        }).call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));

        this.drawSelected();
        this.tooltip = this.svg.select("#textLayer").classed("tooltipHide", true);
        if(!this.initGraphDone){
          this.initGraph();
        }
      }
    }.bind(this)

    this.initGraph = function() {
        this.initGraphDone = true
        let svg = d3.select('svg');
        let view = d3.select('#main-container');
        let containerStyle = document.querySelector('#main-container').getBoundingClientRect();
        let width = containerStyle.width;
        let height = containerStyle.height;

        //// AXES /////
        let xScale = d3.scaleLinear()
            .domain([-width * 2 , width *2 ])
            .range([0, width]);

        let yScale = d3.scaleLinear()
            .domain([-height * 2, height * 2 ])
            .range([height, 0]);

        let xAxis = d3.axisBottom(xScale)
            .ticks(this.cubeResolution*2)
            .tickSize(height)
            .tickPadding(8 - height)
            .tickFormat("");

        let yAxis = d3.axisRight(yScale)
            .ticks(this.cubeResolution*2.5)
            .tickSize(width)
            .tickPadding(8 - width)
            .tickFormat("");
    
        gX = d3.select(".axis--x")
            .call(xAxis);
        gY = d3.select(".axis--y")
            .call(yAxis);
      
        /// ZOOOM ////
        var zoom = d3.zoom()
          .scaleExtent([0.5, 5])
          .translateExtent([
              [-width * 2, -height * 2],
              [width * 2, height * 2]
          ])
          .on("zoom", zoomed);

        function zoomed() {
          currentTransform = d3.event.transform;
          if(currentTransform && !isNaN(currentTransform.k)){
            
            view.attr("transform", currentTransform);
            gX.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
            gY.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));
          }
        }
        
    
          svg.transition().duration(1000).call(zoom.scaleBy, 0.5);
          svg.transition().duration(1000).call(zoom.translateBy, this.graph.startPosition.x,    this.graph.startPosition.y);
        
        svg.call(zoom)
    }.bind(this)

    this.on('mount', function () { // mount du composant riot
      RiotControl.on('workspace_graph_selection_changed', this.drawSelected);
      RiotControl.on('workspace_graph_compute_done', this.drawGraph);
      console.log("canvas", this.refs.graphSvgCanvas)
      RiotControl.trigger('workspace_graph_compute', this.refs.graphSvgCanvas);
    }); // fin mount

    this.on('unmount', function () {
      RiotControl.off('workspace_graph_selection_changed', this.drawSelected);
      RiotControl.off('workspace_graph_compute_done', this.drawGraph);
    });

  </script>

  <style scoped>
    
    svg {
      box-sizing: border-box;
      background:rgb(238,242,249);
      border: 1px solid rgb(212, 212, 212);
    }


    line {
      stroke: rgb(202, 202, 202);
    }

    #shapeLayer image {
      cursor: pointer;
    }

    #stateLayer circle.resolved {
      fill: green;
    }

    #stateLayer circle.waiting {
      fill: orange;
    }

    #stateLayer circle.error {
      fill: red;
    }

    #lineLayer line {
      stroke: #555;
      stroke-width: 3;
      cursor: pointer;
      animation: dash 1s linear;
      stroke-dasharray: 500 2;
      animation-iteration-count: infinite;
    }
    @keyframes dash {
      to {
        stroke-dashoffset: -502;
      }
    }

    #shapeSelector rect {
      /*filter:url(#dropshadow);*/
      fill-opacity: 0.1;
    }

    #lineSelector line {
      stroke-width: 36;
      stroke: #649DF9;
      stroke-opacity: 0.2;
    }

    .background {
      fill: none;
      fill-opacity: 1;
      stroke: #000;
      stroke-width: 0;
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
    .tooltip {
      fill: grey;
      fill-opacity: 0.5;
      padding:20px;
    }

    .tooltipHide {
      display: inline ;
    }

    .axis path {
    display: none;
    }

    .axis line {
        stroke-opacity: 0.3;
    }
    input[type="range"] {
        right: 0;
        top: 0;
        position: absolute;
    }

  </style>
</graph>
