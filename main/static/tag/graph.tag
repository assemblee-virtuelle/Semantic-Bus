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
        <g id="roundLayer"></g>
        <g id="shapeSelector"></g>
        <g id="shapeLayer"></g>
        <g id="nodeTitleLayer"></g>
        <svg id="textLayer">
          <text class="tooltip" x="20" y="30" width="200" height="20"></text>
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
    this.currentX;
    this.currentY;
    this.selectedNodes = [];
    this.selectorsNodes = [];
    this.selectedLines = [];
    this.selectorsLines = [];
    this.modeConnectAfter = false;
    this.modeConnectBefore = false;
    this.selectedElement;
    this.initGraphDone = false;
    
    showAddComponentClick(e) {
      this.currentX;
      this.currentY;
      route('workspace/' + this.graph.workspace._id + '/addComponent');
    }

    function snapToGrid(p, r) {
      return Math.round(p / r) * r;
    }

    // draw selected elemnt around select element
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

      // node
      this.selectorsNodes = this.svg.select("#shapeSelector").selectAll("rect").data(this.selectedNodes, function (d) {
        return d.id + '-selected';
      });
      this.selectorsNodes.exit().remove();
      this.selectorsNodes = this.selectorsNodes.enter().append("rect").merge(this.selectorsNodes).attr("width", function (d) { // width et height definis plus haut par bbox
        return 130;
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
     

      // commande bar
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
          return 20;
        }).attr("height", function (d) {
          return 20;
        }).attr("x", function (d) {
          return 10;
        }).attr("y", function (d) {
          return 50;
        }).on("click", function (d) {
          RiotControl.trigger('item_current_connect_before_show');
        });

        d3.select(this).append("image").attr("xlink:href", function (d) {
          return "./image/Super-Mono-png/PNG/basic/blue/document-edit.png";
        }).attr("width", function (d) {
          return 20;
        }).attr("height", function (d) {
          return 20;
        }).attr("x", function (d) {
          return 30;
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
          return 20;
        }).attr("height", function (d) {
          return 20;
        }).attr("x", function (d) {
          return 60;
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
            return 20;
          }).attr("height", function (d) {
            return 20;
          }).attr("x", function (d) {
            return 60;
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
          return 20;
        }).attr("height", function (d) {
          return 20;
        }).attr("x", function (d) {
          return 90;
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
          return 20;
        }).attr("height", function (d) {
          return 20;
        }).attr("x", function (d) {
          return 100;
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

      // line overlay
      this.selectedLines = sift({
        'selected': true
      }, this.graph.links);
      this.selectorsLines = this.svg.select("#lineSelector").selectAll("line").data(this.selectedLines, function (d) {
        return d.id + 'selected';
      });
      this.selectorsLines.exit().remove();
      this.selectorsLines = this.selectorsLines.enter().append("line").merge(this.selectorsLines)
      .attr('x1', function (d) {
        //return d.source.x + 165;
        return d.source.x + 75;
      }).attr('y1', function (d) {
        //return d.source.y + 35;
        return d.source.y + 35;
      }).attr('x2', function (d) {
        // return d.target.x + 55;
        return d.target.x - 10;
      }).attr('y2', function (d) {
        //return d.target.y + 35;
        return d.target.y + 35;
      });

      // line commande bar
      this.selectorsLineCommandeBar = this.svg.select("#lineCommandLayer").selectAll("svg").data(this.selectedLines, function (d) {
        return d.id + '-lineCommandBarComponent';
      });
      this.selectorsLineCommandeBar.exit().remove();
      this.selectorsLineCommandeBar = this.selectorsLineCommandeBar.enter().append("svg").merge(this.selectorsLineCommandeBar).attr('x', function (d) {
        return ((d.source.x + d.target.x) / 2) + 35;
      }).attr('y', function (d) {
        return ((d.source.y + d.target.y) / 2) + 10;
      }).each(function (d) {
        d3.select(this).append("image").attr("xlink:href", function (d) {
          return "./image/Super-Mono-png/PNG/basic/red/bin.png";
        }).attr("width", function (d) {
          return 15;
        }).attr("height", function (d) {
          return 15;
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

    // track deplacement 
    this.dragstarted = function (d) {
      d.xOrigin = d.x;
      d.yOrigin = d.y;
    };

    // drag calcule for all elements of dragged node
    this.dragged = function (dragged) {
      let containerStyle = document.querySelector('#graphContainer').getBoundingClientRect();
      let width = containerStyle.width ;
      let height = containerStyle.height;

     //let containerStyle = document.querySelector('#graphContainer').getBoundingClientRect();

      var start_x = d3.event.x;
      var start_y = d3.event.y;

      let gridX = snapToGrid(d3.event.x, 40);
      let gridY = snapToGrid(d3.event.y, 40)
      dragged.x = gridX;
      dragged.y = gridY;
      
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
      this.links = this.svg.select("#lineLayer").selectAll("line").data(beforeLinks, function (d) {
        return d.id;
      })
      .attr("x2", gridX -10)
      .attr("y2", gridY + 35);
      let beforeLinksSelected = sift({
        "target.id": dragged.id
      }, this.selectedLines);
      this.selectorsLines = this.svg.select("#lineSelector").selectAll("line").data(beforeLinksSelected, function (d) {
        return d.id;
      }).attr("x2", gridX -10)
      .attr("y2", gridY + 35);

      this.selectorsLineCommandeBar = this.svg.select("#lineCommandLayer").selectAll("svg").data(beforeLinksSelected, function (d) {
        return d.id;
      }).attr('x', function (d) {
        return ((d.source.x + dragged.x) / 2) + 35;
      }).attr('y', function (d) {
        return ((d.source.y + gridY) / 2) + 10;
      });

      // Connect Before / After
      this.subNode = this.svg.select("#roundLayer").selectAll("svg").data([dragged], function (d) {
        return d.id;
      });
      this.subNode = this.subNode
        .attr('x', function (d) {
          return dragged.x - 30;  
        }).attr('y', function (d) {
          return dragged.y - 30;
        })

       this.nodesTitle = this.svg.select("#nodeTitleLayer").selectAll("text").data([dragged], function (d) {
          return d.id;
        });
        this.nodesTitle.attr('x', function (d) {
          return dragged.x - 20;  
        }).attr('y', function (d) {
          return dragged.y - 35;
        })

      let afterLinks = sift({
        "source.id": dragged.id
      }, this.graph.links);

      this.links = this.svg.select("#lineLayer").selectAll("line").data(afterLinks, function (d) {
        return d.id;
      })
      .attr("x1", gridX + 75)
      .attr("y1", gridY + 35)
      let afterLinksSelected = sift({
        "source.id": dragged.id
      }, this.selectedLines);
      this.selectorsLines = this.svg.select("#lineSelector").selectAll("line").data(afterLinksSelected, function (d) {
        return d.id;
      }).attr("x1", gridX + 35).attr("y1", gridY + 35);
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

      this.status = this.svg.select("#stateLayer").selectAll("circle")
      .data(nodesWithStatus, function (d) {
        return d.id;
      }).attr('cx', function (d) {
        return gridX + 35;
      }).attr('cy', function (d) {
        return gridY + 35;
      });

    }.bind(this);

    // drag end, save current position or save connect before/after
    this.dragended = function (d) {

      if (d.x == d.xOrigin && d.y == d.yOrigin) {
        if (this.modeConnectBefore || this.modeConnectAfter) {
          if (this.modeConnectBefore) {
            RiotControl.trigger('connect_components', d.component, this.selectedNodes[0].component);
          }
          if (this.modeConnectAfter) {
            RiotControl.trigger('connect_components', this.selectedNodes[0].component, d.component);
          }
        } else {
          RiotControl.trigger('component_current_set', d.component);
          this.tooltip.classed("tooltipHide", true);
        }
      } else {
        d.component.graphPositionX = d.x;
        d.component.graphPositionY = d.y;
        RiotControl.trigger('item_persist', d.component);
      }
    }.bind(this);

    // init all element of content graph
    this.drawGraph = function (graph) {
      this.graph = graph;
      if(this.graph.startPosition.x ){
      
        if (this.svg == undefined) {
          this.svg = d3.select("svg");
        } 

        // Node 
        this.nodes = this.svg.select("#shapeLayer").selectAll("image").data(graph.nodes, function (d) {
          return d.id + '-node-component';;
        });
        this.nodes.exit().remove();
        this.nodes = this.nodes.enter()
        .append("image").attr('class', 'component').merge(this.nodes).attr("xlink:href", function (d) {
          return 'image/components/' + 'sqlTest.svg';
        }).attr("width", function (d) {
          return 70;
        }).attr("height", function (d) {
          return 70;
        })
        .attr('x', function (d) {
          return d.x;
        }).attr('y', function (d) {
          return d.y;
        }).attr('data-id', function (d) {
          return d.id;
        }).on('mouseover', (d) => {
          if (!d.selected == true && d.component.name!=undefined) {
            this.tooltip.classed("tooltipHide", false);
            this.tooltip.attr('x', d.x).attr('y', d.y + 70).select('text').style('fill', 'grey').html(d.component.name);
          }
        }).on('mouseout', (d) => {
          this.tooltip.classed("tooltipHide", true);
        }).call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));

        
        // Node Title
        this.nodesTitle = this.svg.select("#nodeTitleLayer").selectAll("text").data(graph.nodes, function (d) {
          return d.id + '-node-title';
        });
        this.nodesTitle.exit().remove();
        this.nodesTitle = this.nodesTitle.enter()
        .append("text")
        .attr('class', 'title-component-graph')
        .attr('x', function (d) {
          return d.x - 20;
        }).attr('y', function (d) {
          return d.y - 35;
        }).attr("dy", ".35em")
        .style('fill', 'grey')
        .text(function(d) { return d.text; });


        // Link
        this.links = this.svg.select("#lineLayer").selectAll('line').data(graph.links, function (d) {
          return d.id;
        });
        this.links.exit().remove();
        this.links = this.links.enter()
        .append('line')
        .merge(this.links)
        .attr('x1', function (d) {
          return d.source.x + 75;
        }).attr('y1', function (d) {
          return d.source.y + 35;
        }).attr('x2', function (d) {
          // return d.target.x + 55;
          return d.target.x - 10;
        }).attr('y2', function (d) {
          //return d.target.y + 35;
          return d.target.y + 35;
        })
        .on("click", function (d) {
          RiotControl.trigger('connection_current_set', d.source.component, d.target.component);
        }.bind(this));

        // Connect Before / After
        this.subNode = this.svg.select("#roundLayer").selectAll("svg").data(graph.nodes, function (d) {
          return d.id;
        });
        this.subNode.exit().remove();
        this.subNode = this.subNode.enter().append("svg").merge(this.subNode).attr('x', function (d) {
          return d.x - 30;
          }).attr('y', function (d) {
            return d.y - 30;
          }).each(function (d) {
            d3.select(this).selectAll("image").remove();
            if(d.connectionsBefore){
              d3.select(this).append("image").attr("xlink:href", function (d) {
                return "./image/plus_disable.svg";
                }).attr("width", function (d) {
                  return 15;
                }).attr("height", function (d) {
                  return 15;
                }).attr("x", function (d) {
                  return 10;
                }).attr("y", function (d) {
                  return 55;
                }).attr("class", function (d) {
                  return 'connectBeforeButtonGraph';
                }).attr("data-id", function (d) {
                  return d.id;
                })
            }
            if(d.connectionsAfter){
              d3.select(this).append("image").attr("xlink:href", function (d) {
                let image = "";
                return "./image/plus_disable.svg";
                }).attr("width", function (d) {
                  return 15;
                }).attr("height", function (d) {
                  return 15;
                }).attr("x", function (d) {
                  return 100;
                }).attr("y", function (d) {
                  return 55;
                }).attr("class", function (d) {
                  return 'connectAfterButtonGraph';
                }).attr("data-id", function (d) {
                  return d.id;
                })
            }
          })




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
          return d.x + 35;
        }).attr('class', function (d) {
          return d.status;
        }).attr('cy', function (d) {
          return d.y + 35;
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
    
    // init grid and grid's function
    this.initGraph = function() {
      this.initGraphDone = true
      let svg = d3.select('svg');
      let view = d3.select('#main-container');
      let containerStyle = document.querySelector('#main-container').getBoundingClientRect();
      let width = containerStyle.width;
      let height = containerStyle.height;

      let Square = document.querySelector('.component').getBoundingClientRect();
      let widthSquare = Square.width;

      //// AXES /////
      let xScale = d3.scaleLinear()
          .domain([-width * 2 , width *2 ])
          .range([0, width]);

      let yScale = d3.scaleLinear()
          .domain([-height * 2, height * 2 ])
          .range([height, 0]);

      let xAxis = d3.axisBottom(xScale)
          .ticks(widthSquare/2)
          .tickSize(height)
          .tickPadding(8 - height)
          .tickFormat("");

      let yAxis = d3.axisRight(yScale)
          .ticks(widthSquare/4)
          .tickSize(width)
          .tickPadding(8 - width)
          .tickFormat("");
  
      gX = d3.select(".axis--x")
          .call(xAxis);
      gY = d3.select(".axis--y")
          .call(yAxis);
    
      /// ZOOOM ////
      var zoom = d3.zoom()
        .scaleExtent([0.3, 5])
        .translateExtent([
            [-width * 2, -height * 2],
            [width * 2, height * 2]
        ])
        .on("zoom", zoomed.bind(this));

      function zoomed() {
        currentTransform = d3.event.transform;
        if(currentTransform && !isNaN(currentTransform.k)){
      
          view.attr("transform", currentTransform);
          gX.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
          gY.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));
        }
      }
      
  
        
      
      svg.call(zoom)
    }.bind(this)

    this.on('mount', function () { // mount du composant riot
      RiotControl.on('workspace_graph_selection_changed', this.drawSelected);
      RiotControl.on('workspace_graph_compute_done', this.drawGraph);
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
      stroke: transparent;
    }

    #shapeLayer image {
      cursor: pointer;
    }

    #stateLayer circle.resolved {
      fill: #88d8b0;
    }

    #stateLayer circle.waiting {
      fill: #ffcc5c;
    }

    .circle-before {
      fill: red; 
      stroke-width: 2
    }


    .circle-after {
      fill: blue; 
      stroke-width: 2
    }

    #stateLayer circle.error {
      fill: #ff6f69;
    }

    #lineLayer line {
      stroke: rgb(26,145,194);
      stroke-width: 2;
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
      fill-opacity: 0;
    }

    .title-component-graph-graph {
      font-size: 1em;

    }

    #lineSelector line {
      stroke-width: 15px;
      stroke: #649DF9;
      stroke-opacity: 0.1;

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
    }
    .tooltipHide {
      display: none ;
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
