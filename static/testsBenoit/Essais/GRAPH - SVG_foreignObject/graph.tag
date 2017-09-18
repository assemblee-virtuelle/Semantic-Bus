<graph>
  <div id="graphContainer"></div>
  <div id="brut"></div>
  <script>
    //Constants for the SVG
    var width = 1000,
      height = 600;

    // var data = {
    //   "_id": {
    //     "$oid": "58593e9ec2ef160d17a85575"
    //   },
    //   "name": "candidature legislative 44",
    //   "description": "",
    //   "components": [
    //     {
    //       "_id": {
    //         "$oid": "58593e9ebd966f102739d3c3"
    //       },
    //       "module": "googleGetJson",
    //       "type": "GOOGLE calc Get JSON",
    //       "description": "intéroger une feuille de calcule GOOGLE calc qui fourni un flux JSON",
    //       "editor": "google-get-json-editor",
    //       "workspaceId": "58593e9ec2ef160d17a85575",
    //       "specificData": {
    //         "key": "1k9n2Xd6DWVRVZ2Vrpu3HZuPuTNR9IsNmXoyA058r0ec#gid=311990358",
    //         "select": "select D,E,F",
    //         "offset": "0"
    //       },
    //       "connectionsAfter": ["58593e9ec2ef160d17a85577"],
    //       "connectionsBefore": [],
    //       "connectionsBuilt": false
    //     }, {
    //       "_id": {
    //         "$oid": "58593e9ec2ef160d17a85577"
    //       },
    //       "module": "objectTransformer",
    //       "type": "Object Transformer",
    //       "description": "transformer un objet par mapping grâce à un objet transformation",
    //       "editor": "object-transformer",
    //       "workspaceId": "58593e9ec2ef160d17a85575",
    //       "specificData": {
    //         "transformObject": {
    //           "type": "FeatureCollection",
    //           "features": [
    //             "$..", {
    //               "properties": {
    //                 "name": "$.D"
    //               },
    //               "type": "Feature",
    //               "geometry": {
    //                 "type": "Point",
    //                 "coordinates": {
    //                   "0": "$.F:float",
    //                   "1": "$.E:float"
    //                 }
    //               }
    //             }
    //           ]
    //         }
    //       },
    //       "connectionsAfter": ["5859dfa3bd966f10273e3d10"],
    //       "connectionsBefore": ["58593e9ebd966f102739d3c3"],
    //       "connectionsBuilt": false
    //     }, {
    //       "_id": {
    //         "$oid": "5859dfa3bd966f10273e3d10"
    //       },
    //       "module": "restApiGet",
    //       "type": "REST API GET",
    //       "name": "api exposition pour umap",
    //       "description": "exposition du flux de donnée sur une API http uniquement en GET",
    //       "editor": "rest-api-get-editor",
    //       "workspaceId": "58593e9ec2ef160d17a85575",
    //       "specificData": {
    //         "url": "candidatsCitoyens44"
    //       },
    //       "connectionsAfter": [],
    //       "connectionsBefore": ["58593e9ec2ef160d17a85577"],
    //       "connectionsBuilt": false
    //     }
    //   ]
    // }
    //
    // // document.querySelector('#brut').appendChild(document.createTextNode(JSON.stringify(data)))
    //
    // this.graph = {};
    // this.graph.nodes = [];
    // this.graph.links = [];
    //
    // var inputs = 0;
    // var outputs = 0;
    //
    // for (record of data.components) {
    //   if (record.connectionsBefore.length == 0) {
    //     inputs++;
    //   }
    //   if (record.connectionsAfter.length == 0) {
    //     outputs++;
    //   }
    // }
    //
    // // console.log(inputs, outputs);
    //
    // var inputsOffset = height / (inputs + 1);
    // var outputsOffset = height / (outputs + 1);
    //
    // var inputCurrentOffset = inputsOffset;
    // var outputCurrentOffset = outputsOffset;
    //
    // console.log(inputsOffset, outputsOffset);
    //
    // for (record of data.components) {
    //   if (record.connectionsBefore.length == 0) {
    //     this.graph.nodes.push({text: record.type, id: record._id.$oid, fx: 10, fy: inputCurrentOffset});
    //     inputCurrentOffset += inputsOffset;
    //   } else if (record.connectionsAfter.length == 0) {
    //     this.graph.nodes.push({
    //       text: record.type,
    //       id: record._id.$oid,
    //       fx: width - 10 - record.type.length * 10,
    //       fy: outputCurrentOffset
    //     });
    //     outputCurrentOffset += outputsOffset;
    //   } else {
    //     this.graph.nodes.push({
    //       text: record.type,
    //       id: record._id.$oid,
    //       x: width / 2,
    //       y: height / 2
    //     });
    //   }
    //   for (connection of record.connectionsAfter) {
    //     this.graph.links.push({source: record._id.$oid, target: connection})
    //   }
    // }
    // console.log(graph); graph.nodes = [   {"id": "Alice"},   {"id": "Bob"},   {"id": "Carol"} ];
    //
    // graph.links = [   {"source": "Alice", "target": "Bob"},   {"source": "Bob", "target": "Carol"} ]; Append a SVG to the body of the html page. Assign this SVG as an object to svg var tickCount = 0;

    this.ticked = function () {
      console.log("ticked");
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
        return d.y - 17;
      });

      this.texts.attr('x', function (d) {
        return d.x;
      }).attr('y', function (d) {
        return d.y;
      });
      // tickCount++; if (tickCount>10) {   simulation.stop(); }

    }.bind(this);

    /*
    Fonctions
  */

    this.dragstarted = function (d) {
      if (!d3.event.active)
        this.simulation.alphaTarget(1.0).restart();
      d.fx = d.x;
      d.fy = d.y;
    }.bind(this)

    this.dragged = function (d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }.bind(this)

    this.dragended = function (d) {
      if (!d3.event.active) {
        this.simulation.alphaTarget(0.1);
      }
    }.bind(this)

    this.on('mount', function () {

      this.svg = d3.select("#graphContainer").append("svg").attr("width", width).attr("height", height);

      RiotControl.on('workspace_current_changed',function(data){
        console.log('GRAPH | workspace_current_changed ',data);
        this.graph = {};
        this.graph.nodes = [];
        this.graph.links = [];

        var inputs = 0;
        var outputs = 0;

        for (record of data.components) {
          if (record.connectionsBefore.length == 0) {
            inputs++;
          }
          if (record.connectionsAfter.length == 0) {
            outputs++;
          }
        }

        // console.log(inputs, outputs);

        var inputsOffset = height / (inputs + 1);
        var outputsOffset = height / (outputs + 1);

        var inputCurrentOffset = inputsOffset;
        var outputCurrentOffset = outputsOffset;

        //console.log(inputsOffset, outputsOffset);

        for (record of data.components) {
          if (record.connectionsBefore.length == 0) {
            this.graph.nodes.push({text: record.type, id: record._id.$oid, fx: 10, fy: inputCurrentOffset});
            inputCurrentOffset += inputsOffset;
          } else if (record.connectionsAfter.length == 0) {
            this.graph.nodes.push({
              text: record.type,
              id: record._id.$oid,
              fx: width - 10 - record.type.length * 10,
              fy: outputCurrentOffset
            });
            outputCurrentOffset += outputsOffset;
          } else {
            this.graph.nodes.push({
              text: record.type,
              id: record._id.$oid,
              x: width / 2,
              y: height / 2
            });
          }
          for (connection of record.connectionsAfter) {
            console.log('connection (After)',connection._id.$oid);
            this.graph.links.push({source: record._id.$oid, target: connection._id.$oid})
          }
        }

        this.simulation = d3.forceSimulation(this.graph.nodes).velocityDecay(0.9).force('link', d3.forceLink(this.graph.links).id(function (d) {
          return d.id
        }))
        //.force('center', d3.forceCenter(width / 2, height / 2)) .force("x", d3.forceX().strength(0.002)) .force("y", d3.forceY().strength(0.002))
          .force("collide", d3.forceCollide().radius(30).iterations(2));
        // .on("tick", ticked); var simulation = d3.forceSimulation(graph.nodes)     .force('charge', d3.forceManyBody()) //.distanceMax(500).strength(-0.8)) // .distanceMax(220))     .force('link', d3.forceLink(graph.links).strength(2))     //
        // .distance(20).strength(1)     .force('center', d3.forceCenter(width / 2, height / 2));

        this.links = this.svg.selectAll('line').data(this.graph.links);
        this.links.exit().remove();
        //this.links = this.links.enter().append('line').merge(this.links)
        this.links = this.links.enter().append('line')
        .attr('stroke', '#ccc').attr('stroke-width', 1);

        this.nodes = this.svg.selectAll("rect").data(this.graph.nodes);
        this.nodes.exit().remove();
        //this.nodes = this.nodes.enter().append("rect").merge(this.nodes). //  utiliser tspan ???
        this.nodes = this.nodes.enter().append("rect").
        attr("width", function (d) {
          return d.text.length * 10;
        }).attr("height", 25)
        //  .attr("x",function(d){return d.x;})  .attr("y",function(d){return d.y;})
          .attr("fill", "#e5e5ff") //.attr("opacity",0.5)
        // .text(function(d){return d.text;})
          .call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));

        this.texts = this.svg.selectAll("text").data(this.graph.nodes);
        this.texts.exit().remove();
        //this.texts = this.texts.enter().append("text").merge(this.texts) //  utiliser tspan ???
        this.texts = this.texts.enter().append("text")
        // .attr("r",20) .attr("cx",function(d){return d.x;}) .attr("cy",function(d){return d.y;})
          .attr("fill", "#000") //.attr("opacity",0.5)
        // .attr("width", "20") .attr("height","20")
          .text(function (d) {
          return d.text;
        }). //;
        call(d3.drag().on("start", this.dragstarted).on("drag", this.dragged).on("end", this.dragended));

        this.simulation.on('tick', this.ticked);
      }.bind(this));

      RiotControl.trigger('workspace_current_refresh');

    });
  </script>
  <style scoped>
    .link {
      stroke: #000;
      stroke-width: 1.5px;
      stroke-opacity: 0.6;
    }
    .node {
      cursor: move;
      fill: #fff;
      stroke: #000;
      stroke-width: 1.5px;
    }
    .node.fixed {
      fill: #f00;
    }

  </style>
</graph>
