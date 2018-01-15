'use strict';

//const https = require('https');

//const url = require('url');
//doc to promises : http://stackoverflow.com/questions/35182752/promises-with-http-get-node-js




var proto = {
  technicalComponentDirectory: require('./technicalComponentDirectory.js'),
  //restGetJson: require('./workSpaceComponentDirectory/restGetJson.js'),
  //mLabPromise: require('./mLabPromise'),
  workspaceComponentPromise: require('./workspaceComponentPromise'),
  sift: require('sift'),
  config_component: require('../configuration'),
  objectSizeOf: require('object-sizeof'),
  mLabPromise: require('./mLabPromise'),
  workspace_component_lib: require('../lib/core/lib/workspace_component_lib'),
  workspace_lib: require('../lib/core/lib/workspace_lib'),
  user_lib: require('../lib/core/lib/user_lib'),
  config: require('../configuration.js'),
  fackCounter: 0,
  resolveComponentPull(component, notMainNode, pullParams) {
    //console.log(pullParams);
    return this._makeRequest(component, notMainNode, pullParams);
  },
  resolveComponent(component, requestDirection, pushData) {
    //buildPathResolution component, requestDirection
    //console.log("---- push data 1",pushData)
    //console.log(" ---------- resolveComponent -----------", component)
    if (this.config.quietLog != true) {
      console.log(" ---------- resolveComponent -----------")
    }

    return new Promise((resolve, reject) => {
      this.workspace_component_lib.get_all_withConsomation({
        workspaceId: component.workspaceId
      }).then(components => {
        // GOOD ==> console.log(" ---------- resolveComponentInner -----------" , components)
        this.componentsResolving = components;
        this.componentsResolving.forEach(component => {
          component.status = 'waiting';
          //empty object are not persist by mongoose
          component.specificData = component.specificData || {};
        });
        // console.log('components | ', components.map(component => {
        //   return ({
        //     id: component._id.$oid,
        //     type: component.type,
        //     name: component.name
        //   })
        // }));
        let originComponent = this.sift({
          '_id': component._id
        }, this.componentsResolving)[0];
        this.pathResolution = this.buildPathResolution(originComponent, requestDirection, 0, this.componentsResolving);
        this.pathResolution.forEach(link => {
          //console.log("link", link)
          link.status = 'waiting';
        });
        // this.linksProcessingInputs = [];
        // this.linksProcessed = [];
        this.RequestOrigine = originComponent;
        this.RequestOrigineResolveMethode = resolve;
        this.RequestOrigineRejectMethode = reject;
        this.RequestOrigineResponse = undefined;

        /// -------------- push case  -----------------------
        var traitement_id = Date.now()
        if (requestDirection == 'push') {
          //console.log("push data",pushData)
          // affecter le flux à tous les link dont la source est le composant
          // console.log(" function : resolveComponent | variable : in push ")
          // this.sift({
          //   '_id': component._id
          // }, this.componentsResolving)[0].dataResolution = pushData;

          originComponent.dataResolution = pushData;
          // GOOD ==> console.log("----- PUSH -----", pushData)
          // GOOD ==> console.log("----- PUSH Component--=---", pushData)
          this.sift({
            "source._id": component._id
          }, this.pathResolution).forEach(link => {
            link.status = 'processing'
          });
          //console.log('compare',this.RequestOrigine._id);
          this.processNextBuildPath(traitement_id, component.workspaceId, global_flow);
          resolve(pushData)
        }

        /// -------------- pull case  -----------------------


        //if (requestDirection == 'pull') {

        var tableSift = []
        this.componentsResolving.forEach(componentToInspect => {
          //console.log('init pathResolution', componentToInspect._id, componentToInspect.status, componentToInspect.pullSource);
          if (componentToInspect.pullSource == true) {
            tableSift.push(componentToInspect)
          }
        })
        // this.sift({
        //   pullSource: "true",
        //   // dataResolution: {
        //   //   $exists: false
        //   // }
        // }, this.componentsResolving)
        var global_flow = 0
        tableSift.forEach(componentProcessing => {
          let module = this.technicalComponentDirectory[componentProcessing.module];
          console.log("FOR EACH COMPONET ------///// ------",componentProcessing.module )
          //let componentProcessing = processingLink.source;
          //console.log('PULL start | ', componentProcessing._id);
          module.pull(componentProcessing, undefined, undefined).then(componentFlow => {
              if (this.config.quietLog != true) {
                //console.log('PULL END | ', componentProcessing._id,componentFlow);
              }
              componentProcessing.dataResolution = componentFlow;
              componentProcessing.status = 'resolved';
              //console.log("componentFlow ----------", componentFlow)
              ///update first component her
              // componentProcessing.consumption_history.push({
              //   traitement_id: traitement_id,
              //   flow_size: this.objectSizeOf(componentFlow) / 1000000,
              //   price: (this.objectSizeOf(componentFlow) / 400000000),
              //   dates: {
              //     created_at: new Date()
              //   }
              // })
              // this.workspace_component_lib.update(
              //  componentProcessing
              // ).then(function(res){
              //TODO reactivate global_flow computing
              //global_flow += this.objectSizeOf(componentFlow)
              // console.log("traitement_update =====>", res.consumption_history)
              this.sift({
                "source._id": componentProcessing._id
              }, this.pathResolution).forEach(link => {
                link.status = 'processing'
              });

              // console.log('compare',this.RequestOrigine._id, componentProcessing._id);
              if (componentProcessing._id == this.RequestOrigine._id) {
                this.RequestOrigineResolveMethode(componentProcessing.dataResolution)
              }

              this.processNextBuildPath(traitement_id, component.workspaceId, global_flow);
              // }.bind(this))
            })
            .catch(e => {
              // console.log('WORK ERROR',e);
              reject(e);
            });
        });
        //}

      })
    });

  },
  processNextBuildPath(traitement_id, component_workspaceId, global_flow) {
    this.fackCounter++;
    if (this.config.quietLog != true) {
      console.log(" ---------- processNextBuildPath -----------", this.fackCounter)
      //console.log("--------- global flow ------------" , global_flow)
      console.log(this.pathResolution.map(link => {
        return (link.source._id + ' -> ' + link.destination._id + ' : ' + link.status);
      }));
    }
    let linkNotResolved = this.sift({
      status: 'processing'
    }, this.pathResolution);
    if (linkNotResolved.length > 0) {
      //if (linkNotResolved.length > 0 && this.fackCounter < 10) {
      // console.log(" --------- processingLinks ------------- ")
      // console.log(linkNotResolved.map(link => {
      //   return (link.source._id + ' -> ' + link.destination._id + ' : ' + link.status);
      // }));

      for (var processingLinkCandidate of linkNotResolved) {
        let linksNotReady = this.sift({
          'destination._id': processingLinkCandidate.destination._id,
          status: {
            $ne: 'processing'
          } // ==  dataResolution: { $exists: false }
        }, this.pathResolution);
        if (linksNotReady.length == 0) {
          var processingLink = processingLinkCandidate;
          break;
        }
      }

      //-------------- Component processing --------------
      if (processingLink != undefined) {
        let linksProcessingInputs = this.sift({
          'destination._id': processingLink.destination._id,
          status: 'processing'
        }, this.pathResolution);

        //console.log('linksProcessingInputs | ',linksProcessingInputs);
        let module = this.technicalComponentDirectory[processingLink.destination.module];
        let dataFlow = linksProcessingInputs.map(sourceLink => {
          let d = sourceLink.source.dataResolution;
          d.componentId = sourceLink.source._id;
          //console.log("in dataflow constitution", d)
          return d;
        });

        /// Update procecing link
        //console.log("DATA FLOWWWW==>", this.objectSizeOf(dataFlow))
        module.getPriceState().then((res)=>{
          if(res.state == true){
            this.config_component.components_information.forEach((component)=>{
              console.log(component, processingLink.destination.module)
              console.log(component[processingLink.destination.module])
              // console.log(parseInt(component[processingLink.destination.module].price) * this.objectSizeOf(dataFlow) / 1000000)
            })
          }
        })
        if(processingLink.destination.consumption_history){
          processingLink.destination.consumption_history.push({
            traitement_id: traitement_id,
            flow_size: this.objectSizeOf(dataFlow) / 1000000,
            price: (this.objectSizeOf(dataFlow) / 1000000) * 0.04,
            dates: {
              created_at: new Date()
            }
          })
        }else{
          processingLink.destination.consumption_history = []
          processingLink.destination.consumption_history.push({
            traitement_id: traitement_id,
            flow_size: this.objectSizeOf(dataFlow) / 1000000,
            price: (this.objectSizeOf(dataFlow) / 1000000) * 0.04,
            dates: {
              created_at: new Date()
            }
          })
        }
        console.log(processingLink.destination)
        if (this.config.quietLog != true) {
          //console.log('BEFORE lib Update');
        }
        this.workspace_component_lib.update(
          processingLink.destination
        ).then(function(res) {
          if (this.config.quietLog != true) {
            //console.log('AFTER lib Update');
          }
          //console.log("res update =======>",res)
          // global_flow += this.objectSizeOf(dataFlow)
          var primaryflow;
          if (module.getPrimaryFlow != undefined) {
            //console.log("DATA ----FLOW --------------", processingLink.destination)
            primaryflow = module.getPrimaryFlow(processingLink.destination, dataFlow);
          } else {
            primaryflow = dataFlow[0];
          }

          var secondaryFlow = [];
          secondaryFlow = secondaryFlow.concat(dataFlow);
          secondaryFlow.splice(secondaryFlow.indexOf(primaryflow), 1);
          //console.log('secondaryFlow |' , secondaryFlow);
          if (primaryflow.dfob != undefined) {
            //console.log("after ---- primary flow")
            //console.log('DFOB |',primaryflow.dfob);
            var dfobTab = primaryflow.dfob[0].split(".");

            //var currentInspectObject = primaryflow.data;
            //console.log('primaryflow | ', primaryflow);

            var dfobFinalFlow = this.buildDfobFlow(primaryflow.data, dfobTab);
            if (this.config.quietLog != true) {
              //console.log('dfobFinalFlow | ', dfobFinalFlow);
            }
            var testPromises = dfobFinalFlow.map(finalItem => {

              var recomposedFlow = [];
              recomposedFlow = recomposedFlow.concat([{
                data: finalItem.objectToProcess[finalItem.key],
                componentId: primaryflow.componentId
              }]);
              recomposedFlow = recomposedFlow.concat(secondaryFlow);
              return module.pull(processingLink.destination, recomposedFlow, undefined);
            })

            Promise.all(testPromises).then(componentFlowDfob => {
              //console.log('PULL DFOB END | ', processingLink.destination._id);
              //console.log('AllDfobResult |', dataTestTab);
              for (var componentFlowDfobKey in componentFlowDfob) {
                dfobFinalFlow[componentFlowDfobKey].objectToProcess[dfobFinalFlow[componentFlowDfobKey].key] = componentFlowDfob[componentFlowDfobKey].data;
                //currentInspectObject[dataTestTabKey][currentDfob] = dataTestTab[dataTestTabKey].data;
              }
              // resolve({
              //   componentId: component._id.$oid,
              //   data: primaryflow.data
              // });
              processingLink.destination.dataResolution = {
                componentId: processingLink.destination._id,
                data: primaryflow.data
              };
              processingLink.destination.status = 'resolved';
              this.sift({
                "source._id": processingLink.destination._id
              }, this.pathResolution).forEach(link => {
                //console.log(link)
                link.status = 'processing'
              });

              linksProcessingInputs.forEach(link => {
                link.status = 'resolved';
              })

              if (processingLink.destination._id == this.RequestOrigine._id) {
                this.RequestOrigineResolveMethode(processingLink.destination.dataResolution)
              }
              this.processNextBuildPath(traitement_id, component_workspaceId, global_flow);

            }).catch(e => {
              //console.log(e);
              this.RequestOrigineRejectMethode(e);
            });
          } else {

            module.pull(processingLink.destination, dataFlow, undefined).then(componentFlow => {
              console.log("componentFlow", this.objectSizeOf(componentFlow))
              //console.log('PULL END | ', processingLink.destination._id);
              processingLink.destination.dataResolution = componentFlow;
              processingLink.destination.status = 'resolved';
              //console.log('componentProcessing resolved ||', componentProcessing.status)
              this.sift({
                "source._id": processingLink.destination._id
              }, this.pathResolution).forEach(link => {
                //console.log(link)
                link.status = 'processing'
              });

              linksProcessingInputs.forEach(link => {
                link.status = 'resolved';
              })

              if (processingLink.destination._id == this.RequestOrigine._id) {
                this.RequestOrigineResolveMethode(processingLink.destination.dataResolution)
              }
              this.processNextBuildPath(traitement_id, component_workspaceId, global_flow);
            }).catch(e => {
              this.RequestOrigineRejectMethode(e);
              //reject(e);
            })
          }
        }.bind(this))
      }

    } else {
      if (this.config.quietLog != true) {
        // console.log('--------------  End of Worksapce processing --------------', global_flow);
      }
        this.workspace_lib.getWorkspace(component_workspaceId).then(function(res) {
          if(res.consumption_history){
            res.consumption_history.push({
              traitement_id: traitement_id,
              flow_size: global_flow / 1000000,
              price: (global_flow / 1000000) * 0.04,
              dates: {
                created_at: new Date()
              }
            })
          }else{
            res.consumption_history = []
            res.consumption_history.push({
              traitement_id: traitement_id,
              flow_size: global_flow / 1000000,
              price: (global_flow / 1000000) * 0.04,
              dates: {
                created_at: new Date()
              }
            })
          }
          //console.log('--------------  Before save workspace -------------- ')
          //console.log(res.components.length);
          //console.log('length before',res.components.length);
          //console.log('components_id',res.components.map(m=>m._id));

          this.workspace_lib.updateSimple(res).then(function(res) {
            if (this.config.quietLog != true) {
              //console.log('length after', res.components.length)
              console.log('--------------  End of Worksapce processing -------------- ', res._id)
            }
        }.bind(this))
      }.bind(this))
    }
  },
  //TODO don't work if flow is array at fisrt depth
  buildDfobFlow(currentFlow, dfobPathTab) {


    //console.log('buildDfobFlow | ',dfobPathTab.length,currentDfob,currentInspectFlow);
    var currentDfob = dfobPathTab.shift();
    if (dfobPathTab.length > 0) {

      if (Array.isArray(currentFlow)) {
        var deepArray = currentFlow.map(currentInspectObject => this.buildDfobFlow(currentInspectObject[currentDfob], dfobPathTab.slice(0)));
        return [].concat.apply([], deepArray); // flatten array
      } else {
        return this.buildDfobFlow(currentFlow[currentDfob], dfobPathTab.slice(0));
      }
    } else {

      var out = [];
      if (Array.isArray(currentFlow)) {
        out = out.concat(currentFlow.map(o => {
          return {
            objectToProcess: o,
            key: currentDfob
          }
        }))
      } else {
        out = out.concat({
          objectToProcess: currentFlow,
          key: currentDfob
        });
      }

      return out;

      // if (Array.isArray(currentInspectFlow)) {
      //   return currentInspectFlow.map(currentInspectObject => {
      //     return {
      //       objectToProcess: currentInspectObject,
      //       key: currentDfob
      //     }
      //   });
      // } else {
      //   return [{
      //     ObjectToProcess: currentInspectFlow,
      //     key: currentDfob
      //   }];
      // }
    }
  },
  buildPathResolution(component, requestDirection, depth, usableComponents, buildPath) {

    buildPath = buildPath || [];
    //infinite depth protection. Could be remove if process is safe
    if (depth < 100) {
      //var pathResolution = currentPathResolution || [];
      var incConsole = "";
      for (var i = 0; i < depth; i++) {
        incConsole += "-";
      }

      let module = this.technicalComponentDirectory[component.module];
      // console.log(incConsole, "buildPathResolution", component._id, requestDirection, module.type);
      var out = [];
      //if (requestDirection == "pull") {
      if (requestDirection != 'push') {
        if (component.connectionsBefore != undefined && component.connectionsBefore.length > 0 && !(requestDirection == 'pull' && module.stepNode == true)) {
          for (var beforeComponent of component.connectionsBefore) {
            //console.log(beforeComponent);
            var beforeComponentObject = this.sift({
              "_id": beforeComponent
            }, usableComponents)[0];
            //protection against dead link
            if (beforeComponentObject) {
              var linkToProcess = {
                source: beforeComponentObject,
                destination: component,
                requestDirection: "pull"
              };
              var existingLink = this.sift({
                "source._id": linkToProcess.source._id,
                "destination._id": linkToProcess.destination._id,
              }, buildPath);
              if (existingLink.length == 0) {
                //linkToProcess.status='waiting';
                out.push(linkToProcess);
                //console.log(linkToProcess);
                buildPath.push(linkToProcess);
                out = out.concat(this.buildPathResolution(beforeComponentObject, "pull", depth + 1, usableComponents, buildPath));
              }
            }

          }
        } else {
          //console.log("add pullSource", component._id)
          component.pullSource = true;
        }
      }
      if (requestDirection != 'pull') {
        if (component.connectionsAfter != undefined && component.connectionsAfter.length > 0 && !(requestDirection == 'push' && module.stepNode == true)) {
          for (var afterComponentId of component.connectionsAfter) {
            var afterComponentObject = this.sift({
              "_id": afterComponentId
            }, usableComponents)[0];
            //protection against dead link
            if (afterComponentObject) {
              var linkToProcess = {
                source: component,
                destination: afterComponentObject,
                requestDirection: "push"
              };
              var existingLink = this.sift({
                "source._id": linkToProcess.source._id,
                "destination._id": linkToProcess.destination._id,
              }, buildPath);
              if (existingLink.length == 0) {
                out.push(linkToProcess);
                //console.log(linkToProcess);
                buildPath.push(linkToProcess);
                out = out.concat(this.buildPathResolution(afterComponentObject, "push", depth + 1, usableComponents, buildPath));
              }
            }
          }
        }
      }
      //console.log("function : buildPathResolution | RETURN")
      return out;
    }
  },


  //   _makeRequest(component, notMainNode, pullParams) {
  //
  //     // create a new Promise
  //     return new Promise((resolve, reject) => {
  //       // console.log('recursivPullResolvePromise | ',component,' | connectionsBefore |',component.connectionsBefore);
  //       var module = this.technicalComponentDirectory[component.module];
  //       //console.log('recursivPullResolvePromise | technicalComponentDirectory | ',this.technicalComponentDirectory,this.workspaceComponentPromise);
  //       console.log('recursivPullResolvePromise | module | ', module.type, module.name);
  //       //console.log('recursivPullResolvePromise | before | ',component.connectionsBefore.length,' | stepNode |',module.stepNode,' | notMainNode |',notMainNode);
  //       if (component.connectionsBefore.length > 0 && (module.stepNode != true || notMainNode != true)) {
  //         console.log('resolveWebComponentPull | beforeId | ', component.connectionsBefore[0]);
  //
  //         Promise.all(
  //           component.connectionsBefore.map(connectionBeforeId => {
  //             //console.log(connectionBeforeId);
  //             return this.workspaceComponentPromise.getReadPromiseById(connectionBeforeId)
  //           })
  //         ).then(workspaceComponents =>
  //           Promise.all(
  //             workspaceComponents.map(workspaceComponent => {
  //               if (workspaceComponent.message == 'Document not found') {
  //                 return new Promise((resolve, reject) => {
  //                   resolve({
  //                     data: []
  //                   })
  //                 });
  //               } else {
  //                 //console.log(workspaceComponent);
  //                 return this.resolveComponentPull(workspaceComponent, true, pullParams)
  //               }
  //             })
  //           )
  //         ).then(connectionsBeforeData => {
  //           //connectionsBeforeData=connectionsBeforeData.map(connectionBeforeData=>{data:connectionBeforeData})
  //           if (module.pull) {
  //             //console.log('connectionsBeforeData | ', connectionsBeforeData);
  //             var primaryflow;
  //             if (module.getPrimaryFlow != undefined) {
  //               primaryflow = module.getPrimaryFlow(component, connectionsBeforeData);
  //             } else {
  //               primaryflow = connectionsBeforeData[0];
  //             }
  //
  //             //primary flow extraction
  //             var secondaryFlow = [];
  //             secondaryFlow = secondaryFlow.concat(connectionsBeforeData);
  //             secondaryFlow.splice(secondaryFlow.indexOf(primaryflow), 1);
  //             //console.log('secondaryFlow |' , secondaryFlow);
  //             if (primaryflow.dfob != undefined) {
  //
  //
  //               var dfobTab = primaryflow.dfob[0].split(".");
  //               //var currentInspectObject = primaryflow.data;
  //
  //               var dfobFinalFlow = this.buildDfobFlow(primaryflow.data, dfobTab)
  //
  //               //console.log('dfobFinalFlow | ', dfobFinalFlow);
  //               var testPromises = dfobFinalFlow.map(finalItem => {
  //                 var recomposedFlow = [];
  //                 recomposedFlow = recomposedFlow.concat([{
  //                   data: finalItem.objectToProcess[finalItem.key],
  //                   componentId: primaryflow.componentId
  //                 }]);
  //                 recomposedFlow = recomposedFlow.concat(secondaryFlow);
  //                 return module.pull(component, recomposedFlow, pullParams);
  //               })
  //
  //               Promise.all(testPromises).then(dataTestTab => {
  //                 //console.log('AllDfobResult |', dataTestTab);
  //                 for (var dataTestTabKey in dataTestTab) {
  //                   dfobFinalFlow[dataTestTabKey].objectToProcess[dfobFinalFlow[dataTestTabKey].key] = dataTestTab[dataTestTabKey].data;
  //                   //currentInspectObject[dataTestTabKey][currentDfob] = dataTestTab[dataTestTabKey].data;
  //                 }
  //                 resolve({
  //                   componentId: component._id.$oid,
  //                   data: primaryflow.data
  //                 });
  //               }).catch(e => {
  //                 this.RequestOrigineRejectMethode(e);
  //                 //console.log(e);
  //               });
  //
  //
  //
  //             } else {
  //               console.log('recursivPullResolvePromise | module start pull | ', module.type);
  //               //console.log('recursivPullResolvePromise |connectionsBeforeData | ', connectionsBeforeData);
  //
  //               module.pull(component, connectionsBeforeData, pullParams).then(function (dataTest) {
  //                 console.log('recursivPullResolvePromise | module end | ', module.type);
  //                 //console.log('recursivPullResolvePromise | dataTest | ',dataTest);
  //                 resolve({
  //                   componentId: component._id.$oid,
  //                   data: dataTest.data,
  //                   dfob: dataTest.dfob
  //                 });
  //               });
  //             }
  //           } else {
  //             console.log('NO MODULE');
  //             resolve(null);
  //           }
  //         });
  //
  //       } else {
  //         //console.log('resolveWebComponentPull | Last| ', component);
  //         if (module.pull) {
  //           module.pull(component, undefined, pullParams).then(function (dataTest) {
  //             console.log('recursivPullResolvePromise | module end | ', module.type);
  //             //console.log('recursivPullResolvePromise | module end | dataTest', dataTest);
  //             resolve({
  //               componentId: component._id.$oid,
  //               data: dataTest.data
  //             });
  //           });
  //         } else {
  //           console.log('NO MODULE');
  //           resolve(null);
  //         }
  //       }
  //     });
  //   }
};

module.exports = {
  getNewInstance() {
    return Object.create(proto)
  }
}
