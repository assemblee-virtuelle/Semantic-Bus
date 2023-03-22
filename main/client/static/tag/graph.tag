<graph class="containerV containerGrid">
  <!-- page graph -->
  <div id="graphContainer" style="flex-grow:1;" class="containerH contentrGrid">
    <svg ref="graphSvgCanvas" style="flex-grow:1; position: relative">
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

    // draw selected elemnt around select element
    this.drawSelected = function (graph) {
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
        .attr('y2', function (d) {return d.target.y + 35})

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
      console.log(start_x, start_y)
      let gridX = snapToGrid(d3.event.x, 40);
      let gridY = snapToGrid(d3.event.y, 40)
      dragged.x = gridX;
      dragged.y = gridY;

      RiotControl.trigger('workspace_current_move_component', dragged);

      this.nodes = this.svg
        .select("#shapeLayer")
        .selectAll("image")
        .data([dragged], function (d) {return d.id})
        .attr("x", gridX)
        .attr("y", gridY)

      this.backgroundImg = this.svg
        .select("#backgroundImg")
        .selectAll("circle")
        .data([dragged], function (d) {return d.id})
        .attr('cx', function (d) {return d.x + 34})
        .attr('cy', function (d) {return d.y + 34})

      this.selectorsNodes = this.svg
        .select("#shapeSelector")
        .selectAll("rect")
        .data([dragged], function (d) {return d.id + '-shapeSelector'})
        .attr("x", gridX - 30)
        .attr("y", gridY - 30)

      this.selectorsShapeCommandeBar = this.svg
        .select("#shapeCommandLayer")
        .selectAll("svg")
        .data([dragged], function (d) {return d.id + '-shapeCommandLayer'})
        .attr("x", gridX - 30)
        .attr("y", gridY - 50)

      let beforeLinks = sift({
        "target.id": dragged.id
      }, this.graph.links);
      this.links = this.svg
        .select("#lineLayer")
        .selectAll("line")
        .data(beforeLinks, function (d) {return d.id})
        .attr("x2", gridX -10)
        .attr("y2", gridY + 35)

      let beforeLinksSelected = sift({
        "target.id": dragged.id
      }, this.selectedLines)

      this.selectorsLines = this.svg
        .select("#lineSelector")
        .selectAll("line")
        .data(beforeLinksSelected, function (d) {return d.id})
        .attr("x2", gridX -10)
        .attr("y2", gridY + 35)

      this.selectorsLineCommandeBar = this.svg
        .select("#lineCommandLayer")
        .selectAll("svg")
        .data(beforeLinksSelected, function (d) {return d.id})
        .attr('x', function (d) {return ((d.source.x + dragged.x) / 2) + 35})
        .attr('y', function (d) {return ((d.source.y + gridY) / 2) + 10})

      // Connect Before / After
      this.subNode = this.svg
        .select("#roundLayer")
        .selectAll("svg")
        .data([dragged], function (d) {return d.id})
      this.subNode = this.subNode
        .attr('x', function (d) {return dragged.x - 30})
        .attr('y', function (d) {return dragged.y - 30})

      this.nodesTitle = this.svg
        .select("#nodeTitleLayer")
        .selectAll("text")
        .data([dragged], function (d) {return d.id})
        .attr('x', function (d) {return dragged.x +35})
        .attr('y', function (d) {return dragged.y -15})



      let afterLinks = sift({
        "source.id": dragged.id
      }, this.graph.links);

      this.links = this.svg
        .select("#lineLayer")
        .selectAll("line")
        .data(afterLinks, function (d) {return d.id})
        .attr("x1", gridX + 75)
        .attr("y1", gridY + 35)

      let afterLinksSelected = sift({
        "source.id": dragged.id
      }, this.selectedLines);

      this.selectorsLines = this.svg
        .select("#lineSelector")
        .selectAll("line")
        .data(afterLinksSelected, function (d) {return d.id})
        .attr("x1", gridX + 35).attr("y1", gridY + 35)

      this.selectorsLineCommandeBar = this.svg
        .select("#lineCommandLayer")
        .selectAll("svg")
        .data(afterLinksSelected, function (d) {return d.id})
        .attr('x', function (d) {return ((gridX + d.target.x) / 2) + 95})
        .attr('y', function (d) {return ((gridY + d.target.y) / 2) + 10})

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

      this.status = this.svg
        .select("#stateLayer")
        .selectAll("circle")
        .data(nodesWithStatus, function (d) {return d.id})
        .attr('cx', function (d) {return gridX + 34})
        .attr('cy', function (d) {return gridY + 34})
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
    this.drawGraph = function (dataCompiled) {
      this.graph = dataCompiled.graph;
      // this.position = position;
      if (this.svg == undefined) {
        this.svg = d3.select("svg");
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
        .attr('x2', function (d) {return d.target.x - 10})
        .attr('y2', function (d) {return d.target.y + 35})
        .on("click", function (d) {RiotControl.trigger('connection_current_set', d.source.component, d.target.component)}.bind(this));

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
              .attr("x", function (d) {return 10})
              .attr("y", function (d) {return 55})
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
              .attr("x", function (d) {return 102})
              .attr("y", function (d) {return 55})
              .attr("class", function (d) {return 'connectAfterButtonGraph'})
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

    // init grid and grid's function
    this.initGraph = function(position) {
      this.position=position;
      this.initGraphDone = true
      let svg = d3.select('svg');
      let view = d3.select('#main-container');
      let containerStyle = document.querySelector('#main-container').getBoundingClientRect();
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
    }.bind(this)

    this.updateData=(dataToUpdate)=>{
      this.innerData=dataToUpdate;
      if(this.graph)this.graph.status = dataToUpdate.status;
      this.drawSelected(this.graph)
      this.update();
    };

    this.on('mount', function () {
      RiotControl.on('graph_position_from_store', this.initGraph)
      RiotControl.on('workspace_graph_compute_done', this.drawGraph)
      RiotControl.on('workspace_current_changed', this.updateData);
      RiotControl.on('workspace_graph_selection_changed', this.drawSelected);
      RiotControl.trigger('workspace_graph_compute', this.refs.graphSvgCanvas);
      RiotControl.trigger('get_graph_position_on_store');
    });

    this.on('unmount', function () {
      RiotControl.off('graph_position_from_store', this.initGraph)
      RiotControl.off('workspace_graph_compute_done', this.drawGraph)
      RiotControl.off('workspace_current_changed', this.updateData);
      RiotControl.off('workspace_graph_selection_changed', this.drawSelected);
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
