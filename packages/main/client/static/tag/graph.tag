<graph class="containerV containerGrid">
  <!-- page graph -->
  <div id="graphContainer" style="flex-grow:1;" class="containerH contentrGrid">
    <svg ref="graphSvgCanvas" style="flex-grow:1; position: relative" ondrop={drag_drop} ondragover={drag_over_prevent}>
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
        <g id="backgroundImg"></g>
        <g id="roundLayer"></g>
        <g id="shapeSelector"></g>
        <g id="shapeLayer"></g>
        <g id="nodeTitleLayer"></g>
        <svg id="textLayer">
          <text class="tooltip" x="20" y="30" width="200" height="20"></text>
        </svg>
        <g id="lineCommandLayer"></g>
        <g id="shapeCommandLayer"></g>
        <g id="selectionRectLayer" style="pointer-events: none;"></g>
      </g>
      <div class="tableRowStatus" style={showComponent? "right: 30%": "right: 5%"}>
        <div class={innerData &&  innerData.status} onClick={stopFlow}>
          <img if={innerData && innerData.status && innerData.status === "running"} src="./image/loading.svg" class="img-status loaderImg" />
          <div class="status-div">
            {innerData && innerData.status && innerData.status !== "running" ? innerData.status : "Stop"}
          </div>
        </div>
      </div>
    </svg>
    <div onClick={toggleList} style={showComponent? "right: 25%": "right: 0%"} class="btnShow">
      <img src="./image/vertical-dot.svg" class="ingShow"/>
    </div>
    <div show={showComponent} class="containerListComponents">
      <technical-component-table ></technical-component-table>
    </div>
  </div>
    <!-- Bouton ajouter un composant -->

  <!--graphContainer-->
  <script>
    this.selectedNodes = [];
    this.selectorsNodes = [];
    this.selectedLines = [];
    this.selectorsLines = [];
    this.modeConnectAfter = false;
    this.modeConnectBefore = false;
    this.modeConnectBeforeSecond = false;
    this.selectedElement;
    this.initGraphDone = false;
    this.showComponent = true;
    this.init = true;
    toggleList(){
      this.showComponent = !this.showComponent;
      this.update()
    }

    showAddComponentClick(e) {
      route('workspace/' + this.graph.workspace._id + '/addComponent');
    }

    stopFlow(e) {
      RiotControl.trigger('stop_current_process')
    }

    function snapToGrid(p, r) {
      return Math.round(p / r) * r;
    }

    // draw selected element around select element
    this.drawSelected = function (graph) {
      //console.log(graph);
      this.graph=graph;
      this.selectedNodes = sift({
        'selected': true
      }, this.graph.nodes);
      this.modeConnectAfter = sift({
        'connectAfterMode': true
      }, this.graph.nodes).length > 0;
      this.modeConnectBefore = sift({
        'connectBeforeMode': true
      }, this.graph.nodes).length > 0;

      this.modeConnectBeforeSecond = sift({
        'connectBeforeSecondMode': true
      }, this.graph.nodes).length > 0;
      //console.log(this.modeConnectAfter,this.modeConnectBefore,this.modeConnectBeforeSecond)

      // node
      this.selectorsNodes = this.svg
        .select("#shapeSelector")
        .selectAll("rect")
        .data(this.selectedNodes, function (d) {return d.id + '-selected'})

      this.selectorsNodes
        .exit()
        .remove()

      this.selectorsNodes = this.selectorsNodes
        .enter()
        .append("rect")
        .merge(this.selectorsNodes)
        .attr("width", function (d) {return 141})
        .attr("height", function (d) {return 150})
        .attr("rx", function (d) {return 10})
        .attr("ry", function (d) {return 10})
        .attr('x', function (d) {return d.x - 37})
        .attr('y', function (d) {return d.y - 50})
        //.style("stroke", "rgb(26,145,194)")  // colour the line
        //.style("stroke-width", 2)  // colour the line
        .attr("class", function (d) {return 'connectBeforeButtonGraph'})
        .attr("data-id", function (d) {return d.id})
        .call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));
      this.selectorsShapeCommandeBar = this.svg
        .select("#shapeCommandLayer")
        .selectAll("svg")
        .data(this.selectedNodes, function (d) {return d.id + '-shapeCommandBarComponent'})

      this.selectorsShapeCommandeBar
        .exit()
        .remove()

      this.selectorsShapeCommandeBar = this.selectorsShapeCommandeBar
        .enter()
        .append("svg")
        .merge(this.selectorsShapeCommandeBar)
        .attr('x', function (d) {return d.x - 30})
        .attr('y', function (d) {return d.y - 50})
        .each(function (d) {
          d3
            .select(this)
            .selectAll("image")
            .remove();
          d3
            .select(this)
            .append("image")
            .attr("xlink:href", function (d) {
              let image = "";
              if (d.connectBeforeMode == true) {
                // image = "./image/Super-Mono-png/PNG/basic/green/toggle-expand.png";
                image = "./image/Super-Mono-svg/plus-select.svg";
              } else {
                // image = "./image/Super-Mono-png/PNG/basic/green/toggle-expand-alt.png";
                image = "./image/Super-Mono-svg/plus.svg";
              }
              return image;
            })
            .attr("width", function (d) {return 25})
            .attr("height", function (d) {return 25})
            .attr("x", function (d) {return 1})
            .attr("y", function (d) {return 70})
            .on("click", function (d) {RiotControl.trigger('item_current_connect_before_show')});
          d3
            .select(this)
            .append("image")
            .attr("xlink:href", function (d) {
              let image = "";
              if (d.connectAfterMode == true) {
                //image = "./image/Super-Mono-png/PNG/basic/green/toggle-expand.png";
                image = "./image/Super-Mono-svg/plus-select.svg";
              } else {
                //image = "./image/Super-Mono-png/PNG/basic/green/toggle-expand-alt.png";
                image = "./image/Super-Mono-svg/plus.svg";
              }
            return image
            })
            .attr("width", function (d) {return 25})
            .attr("height", function (d) {return 25})
            .attr("x", function (d) {return 102})
            .attr("y", function (d) {return 70})
            .attr("class", function (d) {return 'connectAfterButtonGraph'})
            .attr("data-id", function (d) {return d.id})
            .on("click", function (d) {RiotControl.trigger('item_current_connect_after_show')})
          if(d.secondFlowConnector){
            d3
              .select(this)
              .append("image")
              .attr("xlink:href", function (d) {

                let image = "";
                if (d.connectBeforeSecondMode == true) {
                  // image = "./image/Super-Mono-png/PNG/basic/green/toggle-expand.png";
                  image = "./image/Super-Mono-svg/plus-select.svg";
                } else {
                  // image = "./image/Super-Mono-png/PNG/basic/green/toggle-expand-alt.png";
                  image = "./image/Super-Mono-svg/plus-second.svg";
                }
                return image;
              })
              .attr("width", function (d) {return 25})
              .attr("height", function (d) {return 25})
              .attr("x", function (d) {return 15})
              .attr("y", function (d) {return 35})
              .on("click", function (d) {RiotControl.trigger('item_current_connect_before_second_show')});

          }

          d3
            .select(this)
            .append("image")
            .attr("xlink:href", function (d) {return "./image/Super-Mono-svg/edit.svg"})
            .attr("width", function (d) {return 25})
            .attr("height", function (d) {return 25})
            .attr("x", function (d) {return 15})
            .attr("y", function (d) {return 123})
            .attr("class", function (d) {return 'editButtonGraph'})
            .attr("data-id", function (d) {return d.id})
            .on("click", function (d) {route(`workspace/${d.component.workspaceId}/component/${d.component._id}/edit-component`)})

          if (graph.status !== 'running' || !graph.status ) {
          d3
            .select(this)
            .append("image")
            .attr("xlink:href", function (d) {return "./image/Super-Mono-svg/play.svg"})
            .attr("width", function (d) {return 25})
            .attr("height", function (d) {return 25})
            .attr("x", function (d) {return 51})
            .attr("y", function (d) {return 123})
            .attr("class", function (d) {return 'workButtonGraph'})
            .attr("data-id", function (d) {return d.id})
            .on("click", function (d) {RiotControl.trigger('item_current_work')})
          } else {
            d3
            .select(this)
            .append("image")
            .attr("xlink:href", function (d) {return "./image/Super-Mono-svg/play.svg"})
            .attr("width", function (d) {return 25})
            .attr("height", function (d) {return 25})
            .attr("x", function (d) {return 51})
            .attr("y", function (d) {return 123})
            .attr("class", 'workButtonGraph flash')
            .attr("data-id", function (d) {return d.id})

          }
          if (d.status && d.status !== 'waiting') {
            d3
              .select(this)
              .append("image")
              .attr("xlink:href", function (d) {return "./image/Super-Mono-svg/upload.svg"})
              .attr("width", function (d) {return 20})
              .attr("height", function (d) {return 20})
              .attr("x", function (d) {return 51})
              .attr("y", function (d) {return 3})
              .attr("class", function (d) {return 'workButtonGraph'})
              .attr("data-id", function (d) {return d.id})
              .on("click", function (d) {RiotControl.trigger('component_preview')})
          }

          d3
            .select(this)
            .append("image")
            .attr("xlink:href", function (d) {return "./image/Super-Mono-svg/trash.svg"})
            .attr("width", function (d) {return 25})
            .attr("height", function (d) {return 25})
            .attr("x", function (d) {return 85})
            .attr("y", function (d) {return 123})
            .attr("class", function (d) {return 'deleteButtonGraph'})
            .attr("data-id", function (d) {return d.id})
            .on("click", function (d) {RiotControl.trigger('workspace_current_delete_component', d.component)})


        })

      // line overlay
      this.selectedLines = sift({
        'selected': true
        }, this.graph.links);
      this.selectorsLines = this.svg
        .select("#lineSelector")
        .selectAll("line")
        .data(this.selectedLines, function (d) {return d.id + 'selected'})

      this.selectorsLines
        .exit()
        .remove()

      this.selectorsLines = this.selectorsLines
        .enter()
        .append("line")
        .merge(this.selectorsLines)
        .attr('x1', function (d) {return d.source.x + 75})
        .attr('y1', function (d) {return d.source.y + 35})
        .attr('x2', function (d) {return d.target.x - 10})
        .attr('y2', function (d) {return d.target.y + (d.targetInput=='second'?0:35)})

      // line commande bar
      this.selectorsLineCommandeBar = this.svg
        .select("#lineCommandLayer")
        .selectAll("svg")
        .data(this.selectedLines, function (d) {return d.id + '-lineCommandBarComponent'})

      this.selectorsLineCommandeBar
        .exit()
        .remove()

      this.selectorsLineCommandeBar = this.selectorsLineCommandeBar
        .enter()
        .append("svg")
        .merge(this.selectorsLineCommandeBar)
        .attr('x', function (d) {return ((d.source.x + d.target.x) / 2) + 35})
        .attr('y', function (d) {return ((d.source.y + d.target.y) / 2) + 10})
        .each(function (d) {
          d3
            .select(this)
            .append("image")
            .attr("xlink:href", function (d) {return "./image/Super-Mono-svg/trash.svg"})
            .attr("width", function (d) {return 25})
            .attr("height", function (d) {return 25})
            .attr("x", function (d) {return 0})
            .attr("y", function (d) {return 10})
            .on("click", function (d) {RiotControl.trigger('disconnect_components', d)})
        });
      this.update();
    }.bind(this);

    // --------------------------------------------------------------------------------
    // Elements of the graph that act as the background (pan / marquee / context menu)
    // --------------------------------------------------------------------------------
    function isGraphBackgroundTarget (el) {
      if (!el || !el.tagName) return false
      if (el.id === 'background') return true
      if (el.closest && el.closest('#shapeLayer, #shapeSelector, #shapeCommandLayer, #lineCommandLayer, #lineSelector, #lineLayer, #backgroundImg, #stateLayer, #roundLayer, #nodeTitleLayer')) {
        return false
      }
      if (el.closest && el.closest('.axis')) return true
      if (el.tagName.toLowerCase() === 'svg') return true
      return false
    }

    // track deplacement
    this.dragstarted = function (d) {
      let connectModeActive = this.modeConnectBefore || this.modeConnectAfter || this.modeConnectBeforeSecond
      // A selected node drags the whole selection; otherwise only the dragged node moves.
      if (connectModeActive || !d.selected) {
        this.movingNodes = [d]
      } else {
        this.movingNodes = sift({
          'selected': true
        }, this.graph.nodes);
        if (this.movingNodes.indexOf(d) === -1) {
          this.movingNodes = [d]
        }
      }
      this.movingNodes.forEach(function (node) {
        node.xOrigin = node.x;
        node.yOrigin = node.y;
      });
    }.bind(this);

    // Redraw one node and every line attached to it (used while dragging)
    this.redrawNodeAt = function (d) {
      let x = d.x;
      let y = d.y;

      this.svg
        .select("#shapeLayer")
        .selectAll("image")
        .data([d], function (n) {return n.id + '-node-component'})
        .attr("x", x)
        .attr("y", y)

      this.svg
        .select("#backgroundImg")
        .selectAll("circle")
        .data([d], function (n) {return n.id})
        .attr('cx', x + 34)
        .attr('cy', y + 34)

      this.svg
        .select("#shapeSelector")
        .selectAll("rect")
        .data([d], function (n) {return n.id + '-selected'})
        .attr("x", x - 37)
        .attr("y", y - 50)

      this.svg
        .select("#shapeCommandLayer")
        .selectAll("svg")
        .data([d], function (n) {return n.id + '-shapeCommandBarComponent'})
        .attr('x', x - 30)
        .attr('y', y - 50)

      this.svg
        .select("#roundLayer")
        .selectAll("svg")
        .data([d], function (n) {return n.id})
        .attr('x', x - 30)
        .attr('y', y - 30)

      this.svg
        .select("#nodeTitleLayer")
        .selectAll("text")
        .data([d], function (n) {return n.id + '-node-title'})
        .attr('x', x + 35)
        .attr('y', y - 15)

      this.svg
        .select("#stateLayer")
        .selectAll("circle")
        .data([d], function (n) {return n.id})
        .attr('cx', x + 34)
        .attr('cy', y + 34)

      // incoming lines
      let beforeLinks = sift({
        "target.id": d.id
      }, this.graph.links);
      this.svg
        .select("#lineLayer")
        .selectAll("line")
        .data(beforeLinks, function (l) {return l.id})
        .attr("x2", x - 5)
        .attr('y2', function (l) {return y + (l.targetInput == 'second' ? 0 : 35)})

      let beforeLinksSelected = sift({
        "target.id": d.id
      }, this.selectedLines || []);
      this.svg
        .select("#lineSelector")
        .selectAll("line")
        .data(beforeLinksSelected, function (l) {return l.id + 'selected'})
        .attr("x2", x - 5)
        .attr('y2', function (l) {return y + (l.targetInput == 'second' ? 0 : 35)})
      this.svg
        .select("#lineCommandLayer")
        .selectAll("svg")
        .data(beforeLinksSelected, function (l) {return l.id + '-lineCommandBarComponent'})
        .attr('x', function (l) {return ((l.source.x + x) / 2) + 35})
        .attr('y', function (l) {return ((l.source.y + y) / 2) + 10})

      // outgoing lines
      let afterLinks = sift({
        "source.id": d.id
      }, this.graph.links);
      this.svg
        .select("#lineLayer")
        .selectAll("line")
        .data(afterLinks, function (l) {return l.id})
        .attr("x1", x + 75)
        .attr("y1", y + 35)

      let afterLinksSelected = sift({
        "source.id": d.id
      }, this.selectedLines || []);
      this.svg
        .select("#lineSelector")
        .selectAll("line")
        .data(afterLinksSelected, function (l) {return l.id + 'selected'})
        .attr("x1", x + 75)
        .attr("y1", y + 35)
      this.svg
        .select("#lineCommandLayer")
        .selectAll("svg")
        .data(afterLinksSelected, function (l) {return l.id + '-lineCommandBarComponent'})
        .attr('x', function (l) {return ((x + l.target.x) / 2) + 95})
        .attr('y', function (l) {return ((y + l.target.y) / 2) + 10})
    }.bind(this);

    // drag compute for all selected elements (group move)
    this.dragged = function (dragged) {
      let gridX = snapToGrid(d3.event.x, 40);
      let gridY = snapToGrid(d3.event.y, 40);
      let dx = gridX - dragged.x;
      let dy = gridY - dragged.y;

      if (!this.movingNodes || this.movingNodes.indexOf(dragged) === -1) {
        this.movingNodes = [dragged]
      }
      if (dx === 0 && dy === 0) return;

      this.movingNodes.forEach(function (node) {
        node.x += dx;
        node.y += dy;
      });

      this.movingNodes.forEach(function (node) {
        this.redrawNodeAt(node);
        RiotControl.trigger('workspace_current_move_component', node);
      }, this);
    }.bind(this);

    // drag end, save current position or save connect before/after
    this.dragended = function (d) {
      let movedNodes = this.movingNodes && this.movingNodes.length ? this.movingNodes : [d]
      let hasMoved = movedNodes.some(function (node) {
        return node.x !== node.xOrigin || node.y !== node.yOrigin
      })

      if (!hasMoved) {
        if ((this.modeConnectBeforeSecond || this.modeConnectBefore || this.modeConnectAfter) && this.selectedNodes[0]) {
          if (this.modeConnectBefore) {
            RiotControl.trigger('connect_components', d.component, this.selectedNodes[0].component);
          }
          if (this.modeConnectAfter) {
            RiotControl.trigger('connect_components', this.selectedNodes[0].component, d.component);
          }
          if (this.modeConnectBeforeSecond) {
            RiotControl.trigger('connect_components', d.component, this.selectedNodes[0].component,'second');
          }
        } else {
          RiotControl.trigger('component_current_set', d.component);
          this.tooltip.classed("tooltipHide", true);
        }
      } else {
        movedNodes.forEach(function (node) {
          node.component.graphPositionX = node.x;
          node.component.graphPositionY = node.y;
        })
        RiotControl.trigger('items_persist', movedNodes.map(function (node) {return node.component}));
      }
      this.movingNodes = [];
    }.bind(this);

    drag_drop(event) {
      console.log('drag_drop',event)
      let source = JSON.parse(event.dataTransfer.getData('sourceData'));
      //console.log('source',source)

      let svgStyle = this.refs.graphSvgCanvas.getBoundingClientRect();
      let xSvgSclaed = (event.offsetX/this.position.k)-(this.position.x/this.position.k);
      let ySvgSclaed = (event.offsetY/this.position.k)-(this.position.y/this.position.k);
      xSvgSclaed = snapToGrid(xSvgSclaed, 40);
      ySvgSclaed = snapToGrid(ySvgSclaed , 40);

      RiotControl.trigger("workspace_current_add_components",{graphPositionX:xSvgSclaed,graphPositionY:ySvgSclaed}); 
    }

    drag_over_prevent(e) {
      event.preventDefault();
    }

    // init all element of content graph
    this.drawGraph = function (dataCompiled) {

      this.graph = dataCompiled.graph;
      console.log('graph',this.graph)
      // this.position = position;
      if (this.svg == undefined) {
        this.svg = d3.select(this.refs.graphSvgCanvas);
      }
      // Node
      this.nodes = this.svg
        .select("#shapeLayer")
        .selectAll("image")
        .data(this.graph.nodes, function (d) {return d.id + '-node-component'})

      this.nodes
        .exit()
        .remove();
      this.nodes = this.nodes
        .enter()
        .append("image")
        .attr('class', 'component')
        .merge(this.nodes)
        .attr("xlink:href", function (d) {return 'image/components/' + d.graphIcon})
        .attr("width", function (d) {return 68})
        .attr("height", function (d) {return 68})
        .attr('x', function (d) {return d.x})
        .attr('y', function (d) {return d.y})
        .attr('data-id', function (d) {return d.id})
        .on('mouseover', (d) => {
          if (!d.selected == true && d.component.name!=undefined) {
            this.tooltip.classed("tooltipHide", false);
            this.tooltip
              .attr('x', d.x)
              .attr('y', d.y + 68)
              .select('text')
              .style('fill', 'grey')
              .html(d.component.name);
          }
        })
        .on('mouseout', (d) => {
        this.tooltip.classed("tooltipHide", true);
        })
        .call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));


      // Node Title
      this.nodesTitle = this.svg
        .select("#nodeTitleLayer")
        .selectAll("text")
        .data(this.graph.nodes, function (d) {return d.id + '-node-title'})

      this.nodesTitle
        .exit()
        .remove();
      this.nodesTitle = this.nodesTitle
        .enter()
        .append("text")
        .attr("text-align", "center")
        .attr('class', 'title-component-graph')
        .attr('x', function (d) {return d.x +35})
        .attr('y', function (d) {return d.y -15})
        .attr("dy", ".35em")
        .style('fill', 'grey')
        .style('text-anchor', 'middle')
        .text(function(d) { return d.text; });
      // Link
      this.links = this.svg
        .select("#lineLayer")
        .selectAll('line')
        .data(this.graph.links, function (d) {return d.id})

      this.links
        .exit()
        .remove();

      this.links = this.links
        .enter()
        .append('line')
        .merge(this.links)
        .attr('x1', function (d) {return d.source.x + 75})
        .attr('y1', function (d) {return d.source.y + 35})
        .attr('x2', function (d) {return d.target.x - 5})
        .attr('y2', function (d) {return d.target.y + (d.targetInput=='second'?0:35)})
        .on("click", function (d) {RiotControl.trigger('connection_current_set', d.source.component, d.target.component, d.targetInput)}.bind(this));

      // Connect Before / After
      this.subNode = this.svg
        .select("#roundLayer")
        .selectAll("svg")
        .data(this.graph.nodes, function (d) {return d.id})

      this.subNode
        .exit()
        .remove()

      this.subNode = this.subNode
        .enter()
        .append("svg")
        .merge(this.subNode)
        .attr('x', function (d) {return d.x - 30})
        .attr('y', function (d) {return d.y - 30})
        .each(function (d) {
          d3
            .select(this)
            .selectAll("image")
            .remove();
          if(d.connectionsBefore){
            d3.select(this)
              .append("image")
              .attr("xlink:href", function (d) {return "./image/plus_disable.svg"})
              .attr("width", function (d) {return 15})
              .attr("height", function (d) {return 15})
              .attr("x", function (d) {return 17})
              .attr("y", function (d) {return 57})
              .attr("class", function (d) {return 'connectBeforeButtonGraph'})
              .attr("data-id", function (d) {return d.id})

          }
          if(d.connectionsAfter){
            d3
              .select(this)
              .append("image")
              .attr("xlink:href", function (d) {let image = "";return "./image/plus_disable.svg"})
              .attr("width", function (d) {return 15})
              .attr("height", function (d) {return 15})
              .attr("x", function (d) {return 97})
              .attr("y", function (d) {return 57})
              .attr("class", function (d) {return 'connectAfterButtonGraph'})
              .attr("data-id", function (d) {return d.id})
          }
          if(d.connectionsBeforeSecond){
            d3.select(this)
              .append("image")
              .attr("xlink:href", function (d) {return "./image/plus_disable.svg"})
              .attr("width", function (d) {return 15})
              .attr("height", function (d) {return 15})
              .attr("x", function (d) {return 17})
              .attr("y", function (d) {return 27})
              .attr("class", function (d) {return 'connectBeforeButtonGraph'})
              .attr("data-id", function (d) {return d.id})

          }
        })

      // backgroundImg
      this.backgroundImg = this.svg
        .select("#backgroundImg")
        .selectAll("circle")
        .data(this.graph.nodes, function (d) {return d.id})

      this.backgroundImg
        .exit()
        .remove()

      this.backgroundImg = this.backgroundImg
        .enter()
        .append("circle")
        .merge(this.backgroundImg)
        .attr("r", function (d) {return 34})
        .attr('cx', function (d) {return d.x + 34})
        .attr('cy', function (d) {return d.y + 34})
        .attr('data-ids', function (d) {return d.id})
        .style('fill', 'white')
        .call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));


      // Status
      let nodesWithStatus = sift({
        status: {
          $exists: true
        }
      }, this.graph.nodes);
      this.status = this.svg
        .select("#stateLayer")
        .selectAll("circle")
        .data(nodesWithStatus, function (d) {return d.id})

      this.status
        .exit()
        .remove()

      this.status = this.status
        .enter()
        .append("circle")
        .merge(this.status)
        .attr("r", function (d) {return 37})
        .attr('cx', function (d) {return d.x + 34})
        .attr('class', function (d) {return d.status})
        .attr('cy', function (d) {return d.y + 34})
        .attr('data-id', function (d) {return d.id})
        .call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));



      this.drawSelected(this.graph);

      this.tooltip = this.svg
        .select("#textLayer")
        .classed("tooltipHide", true)

      // if(!this.initGraphDone){
      //   this.initGraph();
      // }
    }.bind(this)

    // --------------------------------------------------------------------------------
    // Context menu (same look and feel as the other context menus of the app)
    // --------------------------------------------------------------------------------
    this.closeGraphContextMenu = function () {
      if (this.currentContextMenu && this.currentContextMenu.parentNode) {
        this.currentContextMenu.parentNode.removeChild(this.currentContextMenu)
      }
      this.currentContextMenu = null
    };

    this.showGraphContextMenu = function (event, items) {
      this.closeGraphContextMenu()
      let menu = document.createElement('div')
      menu.style.position = 'absolute'
      menu.style.top = event.pageY + 'px'
      menu.style.left = event.pageX + 'px'
      menu.style.backgroundColor = '#fff'
      menu.style.border = '1px solid #ccc'
      menu.style.padding = '5px'
      menu.style.zIndex = 1000
      items.forEach(function (item) {
        let menuItem = document.createElement('div')
        menuItem.className = 'graph-context-menu-item' + (item.disabled ? ' graph-context-menu-item-disabled' : '')
        menuItem.style.cursor = item.disabled ? 'default' : 'pointer'
        menuItem.style.padding = '5px'
        menuItem.style.border = '1px solid #ccc'
        menuItem.style.backgroundColor = '#f9f9f9'
        menuItem.style.whiteSpace = 'nowrap'
        if (item.disabled) {
          menuItem.style.color = '#aaa'
        }
        menuItem.innerHTML = item.label
        if (!item.disabled) {
          menuItem.addEventListener('click', function (e) {
            e.stopPropagation()
            this.closeGraphContextMenu()
            item.action()
          }.bind(this))
        }
        menu.appendChild(menuItem)
      }, this)
      document.body.appendChild(menu)
      this.currentContextMenu = menu
      let menuRect = menu.getBoundingClientRect()
      if (menuRect.right > window.innerWidth) {
        menu.style.left = Math.max(0, event.pageX - menuRect.width) + 'px'
      }
      if (menuRect.bottom > window.innerHeight) {
        menu.style.top = Math.max(0, event.pageY - menuRect.height) + 'px'
      }
    }.bind(this);

    this.openGraphContextMenu = function (event, graphPoint, targetElement) {
      if (!this.graph) return
      let node = null
      let element = targetElement
      while (element && element !== document.body) {
        let dataId = element.getAttribute ? (element.getAttribute('data-id') || element.getAttribute('data-ids')) : null
        if (dataId) {
          node = sift({ id: dataId }, this.graph.nodes)[0]
          if (node) break
        }
        element = element.parentElement
      }

      if (node) {
        if (!node.selected) {
          RiotControl.trigger('component_current_set', node.component)
        }
        this.showGraphContextMenu(event, [{
          label: 'Copier',
          action: function () {RiotControl.trigger('workspace_current_copy_selection')}
        }])
        return
      }

      let selectedCount = sift({ selected: true }, this.graph.nodes).length
      let items = []
      if (selectedCount > 0) {
        items.push({
          label: 'Copier la sélection (' + selectedCount + ')',
          action: function () {RiotControl.trigger('workspace_current_copy_selection')}
        })
      }
      if (this.hasClipboard) {
        items.push({
          label: 'Coller ici',
          action: function () {
            RiotControl.trigger('workspace_current_paste_selection', {
              graphPositionX: graphPoint[0],
              graphPositionY: graphPoint[1]
            })
          }
        })
      }
      if (!items.length) {
        items.push({ label: 'Aucune sélection', disabled: true })
      }
      this.showGraphContextMenu(event, items)
    }.bind(this);

    // Select every node intersecting the marquee rectangle
    this.selectNodesInRect = function (x1, y1, x2, y2, additive) {
      if (!this.graph) return
      let minX = Math.min(x1, x2)
      let maxX = Math.max(x1, x2)
      let minY = Math.min(y1, y2)
      let maxY = Math.max(y1, y2)
      let hits = this.graph.nodes.filter(function (node) {
        return node.x + 78 >= minX && node.x - 10 <= maxX && node.y + 78 >= minY && node.y - 22 <= maxY
      })

      if (!hits.length && !additive) {
        RiotControl.trigger('component_current_set', undefined)
        if (this.tooltip) this.tooltip.classed("tooltipHide", true)
        return
      }

      this.graph.nodes.forEach(function (node) {
        node.connectBeforeMode = false
        node.connectBeforeSecondMode = false
        node.connectAfterMode = false
        if (additive) {
          if (hits.indexOf(node) !== -1) node.selected = true
        } else {
          node.selected = hits.indexOf(node) !== -1
        }
      })
      this.graph.links.forEach(function (link) {
        link.selected = false
      })

      if (!additive && hits.length === 1) {
        RiotControl.trigger('component_current_set', hits[0].component)
      } else {
        RiotControl.trigger('workspace_graph_selection_changed', this.graph)
      }
    }.bind(this);

    // init grid and grid's function
    this.initGraph = function(position) {
      this.position = position || {};
      this.initGraphDone = true
      let svg = d3.select(this.refs.graphSvgCanvas);
      let view = d3.select('#main-container');
      let mainContainerNode = document.querySelector('#main-container');
      let containerStyle = mainContainerNode.getBoundingClientRect();
      let width = containerStyle.width;
      let height = containerStyle.height;
      let Square;
      document.querySelector('.component') ?  Square = document.querySelector('.component').getBoundingClientRect(): Square = {width:40};
      let widthSquare = Square.width;

      //// AXES /////
      let xScale = d3
          .scaleLinear()
          .domain([-width * 2 , width *2 ])
          .range([0, width]);

      let yScale = d3
          .scaleLinear()
          .domain([-height * 2, height * 2 ])
          .range([height, 0]);

      let xAxis = d3
          .axisBottom(xScale)
          .ticks(widthSquare/2)
          .tickSize(height)
          .tickPadding(8 - height)
          .tickFormat("");

      let yAxis = d3
          .axisRight(yScale)
          .ticks(widthSquare/4)
          .tickSize(width)
          .tickPadding(8 - width)
          .tickFormat("");

      gX = d3
          .select(".axis--x")
          .call(xAxis);
      gY = d3
          .select(".axis--y")
          .call(yAxis);

      /// ZOOOM ////
      // Pan with the right button only: the left button is used for selection
      // (marquee on the background, node/group move on nodes).
      var zoom = d3.zoom()
        .scaleExtent([0.3, 5])
        .translateExtent([
            [-width * 2, -height * 2],
            [width * 2, height * 2]
        ])
        .filter(function () {
          if (!d3.event) return false
          if (d3.event.type === 'wheel') return true
          if (d3.event.type === 'touchstart') return true
          if (d3.event.button !== 2) return false
          return isGraphBackgroundTarget(d3.event.target)
        })
        .on("zoom", zoomed.bind(this));

      function zoomed() {
        currentTransform = d3.event.transform;
        if(currentTransform && !isNaN(currentTransform.k)){
          this.position.x =  currentTransform.x
          this.position.y = currentTransform.y
          this.position.k = currentTransform.k
          RiotControl.trigger('update_graph_on_store', this.position)
          view.attr("transform", currentTransform);
          gX.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
          gY.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));
        }
      }

      svg.call(zoom.transform, d3.zoomIdentity.translate(this.position.x || 0 , this.position.y || 0).scale(this.position.k || 0.5))
      svg.call(zoom)

      // --------------------------------------------------------------------------------
      // Left button: marquee selection on the background. Right button: pan (zoom above).
      // --------------------------------------------------------------------------------
      this.marqueeState = null
      this.rightPress = null
      this.closeGraphContextMenu()

      svg.on('contextmenu.graphmenu', function () {
        d3.event.preventDefault();
      })

      svg.on('mousedown.graphmarquee', function () {
        if (d3.event.button !== 0) return;
        if (!isGraphBackgroundTarget(d3.event.target)) return;
        d3.event.preventDefault();
        let point = d3.mouse(mainContainerNode);
        this.marqueeState = {
          startX: point[0],
          startY: point[1],
          clientX: d3.event.clientX,
          clientY: d3.event.clientY,
          additive: d3.event.shiftKey || d3.event.ctrlKey || d3.event.metaKey,
          moved: false
        };
        d3.select('#selectionRectLayer').selectAll('*').remove();
        d3.select('#selectionRectLayer')
          .append('rect')
          .attr('class', 'graph-selection-rect')
          .attr('x', point[0])
          .attr('y', point[1])
          .attr('width', 0)
          .attr('height', 0);
      }.bind(this));

      d3.select(window).on('mousedown.graphright', function () {
        if (d3.event.button !== 2) return;
        if (!this.refs.graphSvgCanvas.contains(d3.event.target)) return;
        this.rightPress = {
          clientX: d3.event.clientX,
          clientY: d3.event.clientY,
          moved: false
        };
      }.bind(this), true);

      d3.select(window).on('mousemove.graphinteraction', function () {
        let event = d3.event;
        if (this.rightPress) {
          if (Math.abs(event.clientX - this.rightPress.clientX) > 4 || Math.abs(event.clientY - this.rightPress.clientY) > 4) {
            this.rightPress.moved = true;
          }
        }
        let marquee = this.marqueeState;
        if (marquee) {
          if (Math.abs(event.clientX - marquee.clientX) > 4 || Math.abs(event.clientY - marquee.clientY) > 4) {
            marquee.moved = true;
          }
          if (marquee.moved) {
            let point = d3.mouse(mainContainerNode);
            d3.select('#selectionRectLayer')
              .select('rect')
              .attr('x', Math.min(marquee.startX, point[0]))
              .attr('y', Math.min(marquee.startY, point[1]))
              .attr('width', Math.abs(point[0] - marquee.startX))
              .attr('height', Math.abs(point[1] - marquee.startY));
          }
        }
      }.bind(this), true);

      d3.select(window).on('mouseup.graphinteraction', function () {
        let event = d3.event;
        if (this.rightPress) {
          let press = this.rightPress;
          this.rightPress = null;
          if (!press.moved) {
            let point = d3.mouse(mainContainerNode);
            let targetElement = document.elementFromPoint(event.clientX, event.clientY);
            this.openGraphContextMenu(event, point, targetElement);
          }
        }
        let marquee = this.marqueeState;
        if (marquee) {
          this.marqueeState = null;
          let point = d3.mouse(mainContainerNode);
          d3.select('#selectionRectLayer').selectAll('*').remove();
          if (marquee.moved) {
            this.selectNodesInRect(marquee.startX, marquee.startY, point[0], point[1], marquee.additive);
          } else if (!marquee.additive) {
            RiotControl.trigger('component_current_set', undefined);
            if (this.tooltip) this.tooltip.classed("tooltipHide", true);
          }
        }
      }.bind(this), true);
    }.bind(this)

    this.updateData=(dataToUpdate)=>{
      this.innerData=dataToUpdate;
      if(this.graph)this.graph.status = dataToUpdate.status;
      this.drawSelected(this.graph)
      this.update();
    };

    this.clipboardChanged = function (payload) {
      this.hasClipboard = !!(payload && payload.count > 0)
    }.bind(this);

    this.documentClickListener = function () {
      this.closeGraphContextMenu()
    }.bind(this);

    this.documentKeydownListener = function (event) {
      if (event.key === 'Escape') this.closeGraphContextMenu()
    }.bind(this);

    this.on('mount', function () {
      this.hasClipboard = false
      RiotControl.on('graph_position_from_store', this.initGraph)
      RiotControl.on('workspace_graph_compute_done', this.drawGraph)
      RiotControl.on('workspace_current_changed', this.updateData);
      RiotControl.on('workspace_graph_selection_changed', this.drawSelected);
      RiotControl.on('workspace_clipboard_changed', this.clipboardChanged);
      document.addEventListener('click', this.documentClickListener);
      document.addEventListener('keydown', this.documentKeydownListener);
      RiotControl.trigger('workspace_graph_compute', this.refs.graphSvgCanvas);
      RiotControl.trigger('get_graph_position_on_store');
      RiotControl.trigger('workspace_clipboard_state_request');
    });

    this.on('unmount', function () {
      RiotControl.off('graph_position_from_store', this.initGraph)
      RiotControl.off('workspace_graph_compute_done', this.drawGraph)
      RiotControl.off('workspace_current_changed', this.updateData);
      RiotControl.off('workspace_graph_selection_changed', this.drawSelected);
      RiotControl.off('workspace_clipboard_changed', this.clipboardChanged);
      document.removeEventListener('click', this.documentClickListener);
      document.removeEventListener('keydown', this.documentKeydownListener);
      d3.select(this.refs.graphSvgCanvas)
        .on('contextmenu.graphmenu', null)
        .on('mousedown.graphmarquee', null);
      d3.select(window)
        .on('mousedown.graphright', null)
        .on('mousemove.graphinteraction', null)
        .on('mouseup.graphinteraction', null);
      this.closeGraphContextMenu();
    });

  </script>

  <style scoped>
      /* Flash class and keyframe animation */
    .flash{
      color:#f2f;
      -webkit-animation: flash linear 1s infinite;
      animation: flash linear 1s infinite;
    }
    @-webkit-keyframes flash {
      0% { opacity: 1; }
      50% { opacity: .1; }
      100% { opacity: 1; }
    }
    @keyframes flash {
      0% { opacity: 1; }
      50% { opacity: .1; }
      100% { opacity: 1; }
    }
    .loaderImg {
      -webkit-animation:spin 1s linear infinite;
      -moz-animation:spin 1s linear infinite;
      animation:spin 1s linear infinite;
    }
    @-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
    @-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
    @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
    .no-start {
      background-color: rgba(200,200,200,0.5);
      width: 7vw;
      font-size: 0.75em;
      border-radius: 5px;
      padding: 5px;
      color: white;
      justify-content: center;
      align-items: center;
      display: flex;
      text-transform: capitalize;
    }
    .stoped {
      background-color: rgba(255,111,105,0.5);
      border-radius: 5px;
      padding: 5px;
      width: 7vw;
      font-size: 0.75em;
      color: white;
      justify-content: center;
      align-items: center;
      display: flex;
      text-transform: capitalize;
    }
    .running {
      background-color: rgb(255,111,105);
      border-radius: 5px;
      padding: 5px;
      width: 7vw;
      font-size: 0.75em;
      color: white;
      justify-content: center;
      align-items: center;
      display: flex;
      text-transform: capitalize;
      cursor: pointer;
    }
    .error {
      background-color: rgba(255,111,105,0.5);
      border-radius: 5px;
      padding: 5px;
      width: 7vw;
      font-size: 0.75em;
      color: white;
      justify-content: center;
      align-items: center;
      display: flex;
      text-transform: capitalize;
    }
    .resolved {
      background-color: rgba(136,216,176,0.5);
      justify-content: space-around;
      border-radius: 5px;
      padding: 5px;
      width: 7vw;
      font-size: 0.75em;
      color: white;
      justify-content: center;
      align-items: center;
      display: flex;
      text-transform: capitalize;
    }
    .img-status {
      width:2vh;
      height:2vh;
    }
    .status-div {
      flex: 0.8;
      justify-content: center;
      align-items: center;
      display: flex;
      padding-left: 0.5vh;
      padding-right: 0.5vh;
    }
    .tableRowStatus {
      position: absolute;
      top: 1.5vh;
    }
    .btnShow {
      position: absolute;
      top: 50%;
      height: 10vh;
      display: flex;
      align-items: center;
      background-color: rgb(26, 145, 194);
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
    }
    .ingShow {
      width: 2vh;
      height: 3vh;
    }
    .containerListComponents {
      width: 25%;
      background-color: white;
    }
    .containerGrid {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
    }
    .contentrGrid {
      flex: 1;
      width: 100%;
      justify-content: center;
      position: relative;
    }
    .btnAdd {
      display: flex;
      justify-content: center;
      position: absolute;
      bottom: 0;
    }
    svg {
      box-sizing: border-box;
      background:rgb(238,242,249);
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
      stroke-width: 4;
      cursor: pointer;
      animation: dash 2s linear;
      stroke-dasharray: 500 15;
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
      stroke: rgb(26, 145, 194);
      stroke-width: 2;
      stroke-dasharray: 6 4;
    }

    .graph-selection-rect {
      fill: rgba(33, 150, 243, 0.12);
      stroke: rgb(33, 150, 243);
      stroke-width: 1.5;
      stroke-dasharray: 6 4;
      pointer-events: none;
    }

    .title-component-graph {
      font-weight: 400;
      font-family: sans-serif;
      text-transform: uppercase;
    }

    #lineSelector line {
      stroke-width: 15px;
      stroke: #649DF9;
      stroke-opacity: 0.1;

    }

    .background {
      fill: transparent;
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