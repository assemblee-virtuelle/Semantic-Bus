<graph class="containerV">
  <!--
  <div class="commandBar containerH">
    <div class="containerH commandGroup" if={selectedNodes.length>0}>
      <div id="editButton" onclick={editClick} class="commandButton" }>
        edit
      </div>
      <div id="connectBeforeButton" onclick={connectBeforeClick} class="{commandButton:true,activConnection:modeConnectBefore}">
        connect Before
      </div>
      <div id="connectAfterButton" onclick={connectAfterClick} class="{commandButton:true,activConnection:modeConnectAfter}" }>
        connect After
      </div>
      <div onclick={removeClick} class="commandButton" }>
        remove
      </div>
      <div id="workButton" onclick={workComponentClick} class="commandButton" }>
        run this component
      </div>
    </div>
    <div class="containerH commandGroup" if={selectedLines.length>0}>
      <div id="removeLinkButton" onclick={removeLinkClick} class="commandButton" }>
        remove
      </div>
    </div>
    <div></div>
    <div class="containerH commandGroup">
      <div id="addComponent" onclick={addComponentClick} class="commandButtonImage">
        <img src="./image/Super-Mono-png/PNG/basic/blue/toggle-expand-alt.png" height="40px">
      </div>
    </div>
  </div>
-->
  <div id="graphContainer" style="background-color: rgb(238,242,249); flex-grow:1;" class="containerH">
    <svg viewBox="0 0 1500 900" ref="graphSvgCanvas" style="flex-grow:1;">
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
      <g id="background">
        <rect width="1500" height="900" class="background"></rect>
      </g>
      <g id="lineSelector"></g>
      <g id="lineLayer"></g>
      <g id="stateLayer"></g>
      <g id="shapeSelector"></g>
      <g id="shapeLayer"></g>
      <g id="textLayer"></g>
      <g id="lineCommandLayer"></g>
      <g id="shapeCommandLayer"></g>
      <!--<image id="addComponentGraph" xlink:href="./image/ajout_composant.svg" class="commandButtonImage" x="1400" y="20" width="60" height="60" onclick={addComponentClick}></image>
      <image  x="1290" y="20" id="addComponentGraph" xlink:href="./image/fullscreen-button.svg" class="commandButtonImage" if={fullscreen == true} x="1400" y="20" width="60" height="60" onclick={graphClick}></image>
      <image  x="50" y="20" id="addComponentGraph" xlink:href="./image/fleche.svg" class="commandButtonImage" if={fullscreen == false} x="1400" y="20" width="40" height="40" onclick={back}></image>-->
    </svg>

  </div>
  <!--graphContainer-->
  <script>
    this.selectedNodes = [];
    this.selectorsNodes = [];
    this.selectedLines = [];
    this.selectorsLines = [];
    this.modeConnectAfter = false;
    this.modeConnectBefore = false;
    this.fullscreen = true

    // addComponentClick(e) {   //RiotControl.trigger('workspace_current_add_component_show', e);   route('workspace/'+this.graph.workspace._id+'/addComponent'); } back(e) {   RiotControl.trigger('back'); } graphClick(e) {   //console.log('EDIT');
    // RiotControl.trigger('workspace_current_graph');   this.update() }

    editClick(e) {
      //console.log('graph edit Component | ', this.selectedNodes[0].component);
      route('component/' + this.selectedNodes[0].component._id);
      //RiotControl.trigger('component_current_show'); RiotControl.trigger('component_current_select', this.selectedNodes[0].component);
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

    workComponentClick(e) {
      RiotControl.trigger('item_current_work');
    }

    removeLinkClick(e) {
      //console.log('removeLink |', this.selectedLines[0].source.component, this.selectedLines[0].target.component);
      RiotControl.trigger('disconnect_components', this.selectedLines[0].source.component, this.selectedLines[0].target.component);
    }

    //this.selectedNodes={}; source urile : https://bl.ocks.org/mbostock/1095795 Constants for the SVG var width = 1500,   height = 900; // utilisé dans le script en bas

    /*
    Fonctions
  */
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
          route('component/' + d.component._id);
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
          console.log(d);
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

    this.dragged = function (dragged) {
      dragged.x = d3.event.x;
      dragged.y = d3.event.y;
      RiotControl.trigger('workspace_current_move_component', dragged);
      //d3.select(this).attr("x", dragged.x).attr("y", dragged.y); //this représente le DOM
      this.nodes = this.svg.select("#shapeLayer").selectAll("image").data([dragged], function (d) {
        return d.id;
      }).attr("x", dragged.x).attr("y", dragged.y);
      this.selectorsNodes = this.svg.select("#shapeSelector").selectAll("rect").data([dragged], function (d) {
        return d.id;
      }).attr("x", dragged.x - 30).attr("y", dragged.y - 30);

      this.selectorsShapeCommandeBar = this.svg.select("#shapeCommandLayer").selectAll("svg").data([dragged], function (d) {
        return d.id;
      }).attr("x", dragged.x - 30).attr("y", dragged.y - 30);

      let beforeLinks = sift({
        "target.id": dragged.id
      }, this.graph.links);
      //console.log('beforeLinks', beforeLinks);
      this.links = this.svg.select("#lineLayer").selectAll("line").data(beforeLinks, function (d) {
        return d.id;
      }).attr("x2", dragged.x + 110).attr("y2", dragged.y + 35);
      let beforeLinksSelected = sift({
        "target.id": dragged.id
      }, this.selectedLines);
      this.selectorsLines = this.svg.select("#lineSelector").selectAll("line").data(beforeLinksSelected, function (d) {
        return d.id;
      }).attr("x2", dragged.x + 110).attr("y2", dragged.y + 35);
      this.selectorsLineCommandeBar = this.svg.select("#lineCommandLayer").selectAll("svg").data(beforeLinksSelected, function (d) {
        return d.id;
      }).attr('x', function (d) {
        return ((d.source.x + dragged.x) / 2) + 95;
      }).attr('y', function (d) {
        return ((d.source.y + dragged.y) / 2) + 10;
      });

      let afterLinks = sift({
        "source.id": dragged.id
      }, this.graph.links);
      //console.log('afterLinks', afterLinks);
      this.links = this.svg.select("#lineLayer").selectAll("line").data(afterLinks, function (d) {
        return d.id;
      }).attr("x1", dragged.x + 110).attr("y1", dragged.y + 35);
      let afterLinksSelected = sift({
        "source.id": dragged.id
      }, this.selectedLines);
      this.selectorsLines = this.svg.select("#lineSelector").selectAll("line").data(afterLinksSelected, function (d) {
        return d.id;
      }).attr("x1", dragged.x + 110).attr("y1", dragged.y + 35);
      this.selectorsLineCommandeBar = this.svg.select("#lineCommandLayer").selectAll("svg").data(afterLinksSelected, function (d) {
        return d.id;
      }).attr('x', function (d) {
        return ((dragged.x + d.target.x) / 2) + 95;
      }).attr('y', function (d) {
        return ((dragged.y + d.target.y) / 2) + 10;
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
      console.log('status',nodesWithStatus);
      this.status = this.svg.select("#stateLayer").selectAll("circle").data(nodesWithStatus, function (d) {
        return d.id;
      }).attr('cx', function (d) {
        return dragged.x + 105;
      }).attr('cy', function (d) {
        return dragged.y + 5;
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
      if (this.svg == undefined) {
        this.svg = d3.select("svg");

        d3.select("#background").on("click", function (d) {
          //console.log('CLICK ON main',d3.select(this)); RiotControl.trigger('connection_current_set');
          RiotControl.trigger('selection_reset');

          // this.selectedNodes = []; this.selectedLines = []; //RiotControl.trigger('component_current_set', undefined); this.drawSelected(); this.drawSelectedLines(); this.update();
        }.bind(this));
      }

      // if (this.simulation == undefined) {   /*   this.simulation = d3.forceSimulation(this.graph.nodes).force("charge", d3.forceManyBody().strength(-1000)).force("link", d3.forceLink([]).id(function (d) {     return d.id // cela semble désigner l'id des
      // noeud (comment les liens retrouvent la propriété id des noeud) ne pas toujours chercher a comprendre comment d3 marche, mais c est necessaire )   }).distance(200)).force("x", d3.forceX()).force("y", d3.forceY()).alphaTarget(1).on("tick",
      // this.ticked);   */
      //
      //   this.simulation = d3.forceSimulation(this.graph.nodes).velocityDecay(0.9).force('link', d3.forceLink(this.graph.links).id(function (d) {     return d.id // ( ne pas toujours chercher a comprendre comment d3 marche, mais c est necessaire )
      // })).force("collide", d3.forceCollide().radius(30).iterations(2)).on("tick", this.ticked);
      //
      // }

      this.links = this.svg.select("#lineLayer").selectAll('line').data(graph.links, function (d) {
        return d.id;
      });
      this.links.exit().remove();
      this.links = this.links.enter().append('line').merge(this.links).attr('x1', function (d) {
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
      }).on("click", function (d) {
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

    }.bind(this)

    // this.refreshGraph = function (data) {
    //
    //   //this.svg.selectAll("*").remove();   console.log('GRAPH | workspace_current_changed ', data);   var graph = {};   graph.nodes = [];   graph.links = [];
    //
    //   var inputs = 0;   var outputs = 0;   var middles = 0;
    //
    //   // determine le nombre d inputs et d outputs   console.log(data.components);   for (record of data.components) {     if (record.connectionsBefore.length == 0 && record.graphPositionX == undefined && record.graphPositionY == undefined) {
    // inputs++;     } else if (record.connectionsAfter.length == 0 && record.graphPositionX == undefined && record.graphPositionY == undefined) {       outputs++;     } else if (record.graphPositionX == undefined && record.graphPositionY == undefined) {
    //       middles++;     }   }
    //
    //   // console.log(inputs, outputs); calcule une distance type pour positionner les inputs et outputs du graphe   var inputsOffset = height / (inputs + 1);   var outputsOffset = height / (outputs + 1);   var middlesOffset = height / (middles + 1);
    //
    //   var inputCurrentOffset = inputsOffset;   var outputCurrentOffset = outputsOffset;   var middleCurrentOffset = middlesOffset;
    //
    //   console.log("automatic repartition", inputs, inputsOffset, middles, middlesOffset, outputs, outputsOffset);
    //
    //   //console.log(inputsOffset, outputsOffset);
    //
    //   for (record of data.components) {     var node = {};     if (record.connectionsBefore.length == 0 && record.graphPositionX == undefined && record.graphPositionY == undefined) { // si rien n est connecte avant       node = {         text:
    // record.type, //-         id: record._id,         graphIcon: record.graphIcon,         // fx: record.graphPositionX || 10, //positionne l'élémént sur le bord gauche fy: record.graphPositionY || inputCurrentOffset,         x: 10, //positionne
    // l'élémént sur le bord gauche         y: inputCurrentOffset,         component: record       }       inputCurrentOffset += inputsOffset;     } else if (record.connectionsAfter.length == 0 && record.graphPositionX == undefined &&
    // record.graphPositionY == undefined) {       node = {         text: record.type,         id: record._id,         graphIcon: record.graphIcon,         // fx: record.graphPositionX || width - 10 - record.type.length * 10, // positionne l'element en
    // largeur par rapport au bord droit du graphe fy: record.graphPositionY || outputCurrentOffset,         x: width - 230, // positionne l'element en largeur par rapport au bord droit du graphe         y: outputCurrentOffset,         component: record
    // }       outputCurrentOffset += outputsOffset;     } else { // tous ceux du milieu       node = {         text: record.type,         id: record._id,         graphIcon: record.graphIcon,         x: record.graphPositionX || width / 2,         y:
    // record.graphPositionY || middleCurrentOffset,         component: record       }       if (record.graphPositionY == undefined) {         middleCurrentOffset += middlesOffset;       }
    //
    //     }     graph.nodes.push(node);   }
    //
    //   for (record of data.components) {     for (connection of record.connectionsAfter) {       graph.links.push({         source: sift({           id: record._id         }, graph.nodes)[0],         target: sift({           id: connection._id },
    // graph.nodes)[0],         id: record._id + '-' + connection._id       }) // creation de tous les links     }   }
    //
    //   console.log(graph);
    //
    //   this.drawGraph(graph);   // if (this.selectedNodes.length > 0) {   this.selectedNodes = sift({     id: {       $in: this.selectedNodes.map(s => s.id)     }   }, this.graph.nodes);   this.drawSelected(); }   //   // if (this.selectedLines.length
    // > 0) {   this.selectedLines = sift({     id: {       $in: this.selectedLines.map(s => s.id)     }   }, this.graph.links);   this.drawSelectedLines(); } this.simulation.nodes(this.graph.nodes);   //
    // this.simulation.force("link").links(this.graph.links); this.simulation.alpha(1).restart();
    //
    // }.bind(this); this.refreshSelection = function (selectedNodes, selectedLines) {   //console.log('refreshSelection',selectedNodes, selectedLines);   this.drawSelected(selectedNodes);   this.drawSelectedLines(selectedLines);   this.update();   //
    // this.selectedNodes = selectedNodes;   //   // if (this.selectedNodes.length > 0) {   this.selectedNodes = sift({     id: {       $in: this.selectedNodes.map(s => s.id)     }   }, this.graph.nodes);   this.drawSelected(); }   //   //
    // this.selectedLines = selectedLines;   //   // if (this.selectedLines.length > 0) {   this.selectedLines = sift({     id: {       $in: this.selectedLines.map(s => s.id)     }   }, this.graph.links);   this.drawSelectedLines(); }
    //
    // }.bind(this); this.on('unmount', function () {   //this.simulation.stop();   RiotControl.off('workspace_current_changed', this.refreshGraph); }); this.ticked = function () {   console.log("ticked");   this.links.attr('x1', function (d) { return
    // d.source.x + 165;   }).attr('y1', function (d) {     return d.source.y + 35;   }).attr('x2', function (d) {     return d.target.x + 55; }).attr('y2', function (d) {     return d.target.y + 35;   });
    //
    //   this.nodes.attr('x', function (d) {     return d.x - 5;   }).attr('y', function (d) {     return d.y - 5;   });   if (this.selectorsNodes.length > 0) {     this.selectorsNodes.attr('x', function (d) {       return d.x - 5;     }).attr('y',
    // function (d) {     return d.y - 5;     });   }
    //
    //   // this.texts.attr('x', function (d) {   return d.x; }).attr('y', function (d) {   return d.y + d.height; }); tickCount++; if (tickCount>10) {   simulation.stop(); }
    //
    // }.bind(this); // jusque la on est dans le workspace changed RiotControl.on('item_curent_connect_show_changed', function (modes) {   console.log('item_curent_connect_show_changed', modes);   this.modeConnectAfter = modes.after;
    // this.modeConnectBefore = modes.before;   this.update(); }.bind(this)); evenement appele par riot
    this.on('mount', function () { // mount du composant riot
      //RiotControl.on('workspace_current_changed', this.refreshGraph);
      if (this.parent != undefined && this.parent.title == "Workspace") {
        this.fullscreen = true
      } else {
        this.fullscreen = false
      }
      RiotControl.on('workspace_graph_selection_changed', this.drawSelected);
      RiotControl.on('workspace_graph_compute_done', this.drawGraph);
      //RiotControl.trigger('workspace_current_refresh'); console.log(this.refs.graphSvgCanvas.viewBox.baseVal);
      RiotControl.trigger('workspace_graph_compute', this.refs.graphSvgCanvas.viewBox.baseVal);

    }); // fin mount

    this.on('unmount', function () {
      //RiotControl.off('workspace_current_changed', this.refreshGraph);
      RiotControl.off('workspace_graph_selection_changed', this.drawSelected);
      RiotControl.off('workspace_graph_compute_done', this.drawGraph);
    });
  </script>

  <style scoped>
    svg {
      /*background-color: rgb(238,242,249);*/
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
      stroke-width: 6;
      cursor: pointer;
      stroke-dasharray: 500 2;
      animation: dash 1s linear;
      animation-iteration-count: infinite;
    }
    @keyframes dash {
      to {
        stroke-dashoffset: -502;
      }
    }

    #shapeSelector rect {
      /*filter:url(#dropshadow);*/
      fill: #649DF9;
      fill-opacity: 0.2;
    }

    #lineSelector line {
      stroke-width: 36;
      stroke: #649DF9;
      stroke-opacity: 0.2;
    }

    .background {
      fill: rgb(238,242,249);
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

  </style>
</graph>
