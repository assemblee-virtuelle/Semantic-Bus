"use strict";

class Engine {
  constructor(component, requestDirection, amqpClient, callerId, pushData, queryParams) {
    this.technicalComponentDirectory = require("./technicalComponentDirectory.js");
    this.sift = require("sift");
    //this.config_component = require("../configuration");
    this.objectSizeOf = require("object-sizeof");
    this.workspace_component_lib = require("../lib/core/lib/workspace_component_lib");
    this.workspace_lib = require("../lib/core/lib/workspace_lib");
    this.user_lib = require("../lib/core/lib/user_lib");
    this.config = require("../configuration.js");
    let PromiseOrchestrator = require("./promiseOrchestrator.js")
    this.promiseOrchestrator = new PromiseOrchestrator();
    this.fackCounter = 0;
    this.amqpClient = amqpClient,
    this.callerId = callerId;
    this.originComponent = component;
    this.requestDirection = requestDirection;
    this.pushData = pushData;
    this.originQueryParams = queryParams;
  }

  resolveComponent() {

    if (this.config.quietLog != true) {
      console.log(" ---------- resolveComponent -----------" + this.originComponent._id);
    }
    return new Promise((resolve, reject) => {
      this.workspace_component_lib
        .get_all({
          workspaceId: this.originComponent.workspaceId
        })
        .then(components => {
          this.componentsResolving = components;
          this.workspace_lib
            .getWorkspace(this.originComponent.workspaceId)
            .then(workflow => {
              this.workflow = workflow;
              let ownerUserMail = this.sift({
                  role: "owner"
                },
                this.workflow.users
              )[0];


              //console.log(ownerUserMail)
              this.user_lib
                .get({
                  "credentials.email": ownerUserMail.email
                })
                .then(user => {

                  this.componentsResolving.forEach(component => {
                    component.status = "waiting";
                    //empty object are not persist by mongoose
                    component.specificData = component.specificData || {};
                  });

                  this.originComponent = this.sift({
                      _id: this.originComponent._id
                    },
                    this.componentsResolving
                  )[0];


                  this.pathResolution = this.buildPathResolution(
                    workflow,
                    this.originComponent,
                    this.requestDirection,
                    0,
                    this.componentsResolving,
                    undefined,
                    this.originQueryParams
                  );

                  // if (this.config.quietLog != true) {
                  //   console.log(" ---------- BuildPath -----------", this.fackCounter)
                  //   console.log(this.pathResolution.links.map(link => {
                  //     return (link.source._id + ' -> ' + link.destination._id);
                  //   }));
                  // }


                  this.owner = user;

                  this.workspace_lib.createProcess({
                    workflowId: this.originComponent.workspaceId,
                    ownerId: this.owner._id,
                    callerId: this.callerId,
                    originComponentId: this.originComponent._id,
                    steps: this.pathResolution.nodes.map(node => {
                      return ({
                        componentId: node._id
                      });
                    })
                  }).then((process) => {
                    this.processId = process._id;
                    this.keyStart = 'process-start.' + this.originComponent.workspaceId;
                    this.keyProgress = 'process-progress.' + this.originComponent.workspaceId;
                    this.keyError = 'process-error.' + this.originComponent.workspaceId;
                    this.keyEnd = 'process-end.' + this.originComponent.workspaceId;
                    this.keyProcessCleaned = 'workflow-processCleaned.' + this.originComponent.workspaceId;
                    this.amqpClient.publish('amq.topic', this.keyStart, new Buffer(JSON.stringify({
                      _id: this.processId,
                      callerId: this.callerId,
                      timeStamp: process.timeStamp,
                      steps: this.pathResolution.nodes.map(node => {
                        return ({
                          componentId: node._id,
                          status: node.status
                        });
                      })
                    })));

                    this.pathResolution.links.forEach(link => {
                      link.status = "waiting";
                    });
                    this.RequestOrigine = this.originComponent;
                    this.RequestOrigineResolveMethode = resolve;
                    this.RequestOrigineRejectMethode = reject;
                    this.RequestOrigineResponse = undefined;

                    /// -------------- push case  -----------------------
                    if (this.requestDirection == "push") {
                      this.originComponent.dataResolution = this.pushData;
                      this.originComponent = 'resolved';

                      this.sift({
                          "source._id": component._id
                        },
                        this.pathResolution.links
                      ).forEach(link => {
                        link.status = "processing";
                      });

                      this.processNextBuildPath();
                      resolve(pushData);
                    }

                    /// -------------- pull case  -----------------------

                    var tableSift = [];
                    this.componentsResolving.forEach(componentToInspect => {
                      if (componentToInspect.pullSource == true) {
                        tableSift.push(componentToInspect);
                      }
                    });

                    //console.log(tableSift);

                    tableSift.forEach(componentProcessing => {
                      if (user.credit >= 0) {
                        componentProcessing.status = 'processing';
                        let module = this.technicalComponentDirectory[
                          componentProcessing.module
                        ];
                        let startTime = new Date();
                        //historicEndAndCredit(processingLink,module,[]);
                        //console.log(componentProcessing.specificData);
                        module
                          .pull(componentProcessing, undefined, componentProcessing.queryParams)
                          .then(componentFlow => {
                            if (this.config.quietLog != true) {
                              //console.log('AFFECTATION',componentProcessing._id,componentFlow.data.length);
                            }

                            componentProcessing.dataResolution = componentFlow;
                            componentProcessing.status = 'resolved';

                            this.sift({
                                "source._id": componentProcessing._id
                              },
                              this.pathResolution.links
                            ).forEach(link => {
                              link.status = "processing";
                            });

                            this.historicEndAndCredit(componentProcessing, startTime, undefined)

                            if (
                              componentProcessing._id == this.RequestOrigine._id
                            ) {
                              this.RequestOrigineResolveMethode(
                                componentProcessing.dataResolution
                              );
                            }

                            this.processNextBuildPath();
                          })
                          .catch(e => {
                            // console.log(
                            //   "source component error",
                            //   e.message,
                            //   componentProcessing._id
                            // );
                            componentProcessing.dataResolution = {
                              error: e
                            };
                            this.historicEndAndCredit(componentProcessing, startTime, e)

                            this.sift({
                                "source._id": componentProcessing._id
                              },
                              this.pathResolution.links
                            ).forEach(link => {
                              link.status = "error";
                            });
                            componentProcessing.status = "error";

                            if (
                              componentProcessing._id == this.RequestOrigine._id
                            ) {
                              this.RequestOrigineRejectMethode(
                                e
                              );
                            }

                            this.processNextBuildPath();
                            //reject(e);
                          });
                      } else {
                        let fullError = new Error();
                        fullError.message = "Vous n'avez pas assez de credit";
                        reject(fullError);
                      }
                    });
                  })
                });
            });
        });
    });
  }

  processNextBuildPath() {
    if (this.owner.credit >= 0) {
      this.fackCounter++;
      if (this.config.quietLog != true) {
        // console.log(" ---------- processNextBuildPath -----------", this.fackCounter)
        // console.log(this.pathResolution.links.map(link => {
        //   return (link.source._id + ' -> ' + link.destination._id + ' : ' + link.status);
        // }));
      }
      let linkNotResolved = this.sift({
          status: "processing"
        },
        this.pathResolution.links
      );
      //console.log(linkNotResolved.length);

      if (linkNotResolved.length > 0) {
        let linksLockedNumber = 0;
        for (var processingLinkCandidate of linkNotResolved) {
          let linksNotReady = this.sift({
              "destination._id": processingLinkCandidate.destination._id,
              status: {
                $ne: "processing"
              } // ==  dataResolution: { $exists: false }
            },
            this.pathResolution.links
          );

          let linksWaiting = this.sift({
              "destination._id": processingLinkCandidate.destination._id,
              status: "waiting"
            },
            this.pathResolution.links
          );

          if (linksNotReady.length == 0) {
            var processingLink = processingLinkCandidate;
            break;
          } else {
            //console.log(linksWaiting.length);
            if (linksWaiting.length == 0) {
              linksLockedNumber++;
            }
          }
        }

        //-------------- Component processing --------------

        if (processingLink != undefined) {
          let startTime = new Date();
          processingLink.status = 'processing';
          let linksProcessingInputs = this.sift({
              "destination._id": processingLink.destination._id,
              status: "processing"
            },
            this.pathResolution.links
          );

          let module = this.technicalComponentDirectory[
            processingLink.destination.module
          ];
          let dataFlow = linksProcessingInputs.map(sourceLink => {
            let d = sourceLink.source.dataResolution;
            d.componentId = sourceLink.source._id;
            return d;
          });

          // historicEndAndCredit(processingLink,module,dataFlow);

          var primaryflow;
          if (module.getPrimaryFlow != undefined) {
            primaryflow = module.getPrimaryFlow(
              processingLink.destination,
              dataFlow
            );
          } else {
            primaryflow = dataFlow[0];
          }

          var secondaryFlow = [];
          secondaryFlow = secondaryFlow.concat(dataFlow);
          secondaryFlow.splice(secondaryFlow.indexOf(primaryflow), 1);

          if (primaryflow.dfob != undefined && primaryflow.dfob.length > 0) {
            var dfobTab = primaryflow.dfob[0].split(".");
            var dfobFinalFlow = this.buildDfobFlow(
              primaryflow.data,
              dfobTab
            );

            if (this.config.quietLog != true) {
              //console.log('dfobFinalFlow | ', dfobFinalFlow);
            }
            let paramArray = dfobFinalFlow.map(finalItem => {
              var recomposedFlow = [];
              recomposedFlow = recomposedFlow.concat([{
                data: finalItem.objectToProcess[finalItem.key],
                componentId: primaryflow.componentId
              }]);
              recomposedFlow = recomposedFlow.concat(secondaryFlow);
              return [
                processingLink.destination,
                recomposedFlow,
                undefined
              ];
            });
            //console.log('paramArray',paramArray);
            this.promiseOrchestrator.execute(module, module.pull, paramArray, {}).then((componentFlowDfob) => {

              for (var componentFlowDfobKey in componentFlowDfob) {
                dfobFinalFlow[componentFlowDfobKey].objectToProcess[
                    dfobFinalFlow[componentFlowDfobKey].key
                  ] =
                  componentFlowDfob[componentFlowDfobKey].data;
              }

              processingLink.destination.dataResolution = {
                componentId: processingLink.destination._id,
                data: dfobFinalFlow
              };
              processingLink.destination.status = "resolved";
              this.sift({
                  "source._id": processingLink.destination._id
                },
                this.pathResolution.links
              ).forEach(link => {
                link.status = "processing";
              });

              linksProcessingInputs.forEach(link => {
                link.status = "resolved";
              });

              this.historicEndAndCredit(processingLink.destination, startTime, undefined)

              if (
                processingLink.destination._id == this.RequestOrigine._id
              ) {
                this.RequestOrigineResolveMethode(
                  processingLink.destination.dataResolution
                );

              }

              this.processNextBuildPath();
            }).catch(e => {
              processingLink.destination.dataResolution = {
                error: e
              };
              this.historicEndAndCredit(processingLink.destination, startTime, e)

              this.sift({
                  "source._id": processingLink.destination._id
                },
                this.pathResolution.links
              ).forEach(link => {
                link.status = "error";
              });
              processingLink.destination.status = "error";

              if (
                processingLink.destination._id == this.RequestOrigine._id
              ) {
                this.RequestOrigineRejectMethode(
                  e
                );
              }

              this.processNextBuildPath();
            });

          } else {
            module
              .pull(processingLink.destination, dataFlow, processingLink.queryParams)
              .then(componentFlow => {
                processingLink.destination.dataResolution = componentFlow;
                processingLink.destination.status = "resolved";

                this.sift({
                    "source._id": processingLink.destination._id
                  },
                  this.pathResolution.links
                ).forEach(link => {
                  link.status = "processing";
                });

                linksProcessingInputs.forEach(link => {
                  link.status = "resolved";
                });
                this.historicEndAndCredit(processingLink.destination, startTime, undefined)

                if (
                  processingLink.destination._id == this.RequestOrigine._id
                ) {

                  this.RequestOrigineResolveMethode(
                    processingLink.destination.dataResolution
                  );

                }

                this.processNextBuildPath();
              })
              .catch(e => {
                processingLink.destination.dataResolution = {
                  error: e
                };
                this.historicEndAndCredit(processingLink.destination, startTime, e)

                this.sift({
                    "source._id": processingLink.destination._id
                  },
                  this.pathResolution.links
                ).forEach(link => {
                  link.status = "error";
                });
                processingLink.destination.status = "error";

                if (
                  processingLink.destination._id == this.RequestOrigine._id
                ) {
                  this.RequestOrigineRejectMethode(
                    e
                  );
                }

                this.processNextBuildPath();
              });
          }
        } else {
          //console.log('no process', linksLockedNumber, linkNotResolved.length);
          if (linksLockedNumber == linkNotResolved.length) {
            //console.log("END with errors");
            this.amqpClient.publish('amq.topic', this.keyError, new Buffer(JSON.stringify({
              processId: this.processId
            })));
          }
        }
      } else {
        // console.log(" ---------- no processing link -----------", this.fackCounter)
        // console.log(this.pathResolution.map(link => {
        //   return (link.source._id + ' -> ' + link.destination._id + ' : ' + link.source.status+'->' + link.status+'->'+ link.destination.status);
        // }));
        let linkOnError = this.sift({
            status: "error"
          },
          this.pathResolution.links
        );
        //console.log(linkOnError.length);
        let linkOnWaitingButNodeInProcessing = this.sift({
            status: "waiting",
            "source.status": "processing",
          },
          this.pathResolution.links
        );
        if (linkOnWaitingButNodeInProcessing.length == 0) {
          if (linkOnError.length > 0) {
            this.amqpClient.publish('amq.topic', this.keyError, new Buffer(JSON.stringify({
              _id: this.processId
            })));
          } else {
            this.amqpClient.publish('amq.topic', this.keyEnd, new Buffer(JSON.stringify({
              _id: this.processId
            })));
          }
          this.workspace_lib.cleanHoldProcess(this.workflow).then(processes=>{
            //console.log(processes);
            this.amqpClient.publish('amq.topic', this.keyProcessCleaned, new Buffer(JSON.stringify({cleanedProcesses:processes})));
          })
          if (this.config.quietLog != true) {
            console.log(
              "--------------  End of Worksapce processing --------------"
            );
          }
        }
      }
    } else {
      let fullError = new Error();
      fullError.message = "Vous n'avez pas assez de credit";
      this.RequestOrigineRejectMethode(fullError);
    }
  }

  historicEndAndCredit(component, startTime, error) {
    let dataFlow= component.dataResolution
    let module = component.module;
    let specificData = component.specificData;
    let historic_object = {};
    let current_component = this.config.components_information[module];
    let current_component_price;
    let roundDate = new Date();
    roundDate.setMinutes(0);
    roundDate.setSeconds(0);
    roundDate.setMilliseconds(0);
    roundDate.setHours(0);

    if (module.getPriceState != undefined) {
      current_component_price = module.getPriceState(specificData, current_component.price, current_component.record_price);
    } else {
      current_component_price = {
        moPrice: current_component.price,
        recordPrice: current_component.record_price
      }
    }
    current_component = this.config.components_information[module];

    historic_object.recordCount = dataFlow == undefined ? 0 : dataFlow.data.length || 1;
    historic_object.recordPrice = current_component_price.record_price || 0;
    historic_object.moCount = this.objectSizeOf(dataFlow) / 1000000;
    historic_object.componentPrice = current_component_price.moPrice;
    historic_object.totalPrice =
      (historic_object.recordCount * historic_object.recordPrice) / 1000 +
      (historic_object.moCount * historic_object.componentPrice) / 1000;
    historic_object.componentModule = module
    //TODO pas besoin de stoquer le name du component, on a l'id. ok si grosse perte de perf pour histogramme
    historic_object.componentName = component.name;
    historic_object.componentId = component._id;
    historic_object.processId = this.processId;
    historic_object.data = dataFlow.data;
    historic_object.error = error;
    historic_object.startTime=startTime;
    historic_object.roundDate=roundDate;
    historic_object.workflowId=this.originComponent.workspaceId;

    this.workspace_lib.createHistoriqueEnd(historic_object).then(historiqueEnd => {
      this.amqpClient.publish('amq.topic', this.keyProgress, new Buffer(JSON.stringify({
        componentId: historiqueEnd.componentId,
        processId: historiqueEnd.processId,
        error: historiqueEnd.error
      })));
    }).catch(e => {
      console.log(e);
      this.amqpClient.publish('amq.topic', this.keyProgress, new Buffer(JSON.stringify({
        componentId: component._id,
        processId: this.processId,
        error: 'error writing historic error'
      })));
    });

    if (this.config.quietLog != true) {
      //console.log("CONSUPTION_HISTORIQUE", consumption_historic_object);
    }

    this.owner.credit -= historic_object.totalPrice;

    this.user_lib.update(this.owner);
  }


  //TODO don't work if flow is array at fisrt depth
  buildDfobFlow(currentFlow, dfobPathTab) {
    var currentDfob = dfobPathTab.shift();
    if (dfobPathTab.length > 0) {
      if (Array.isArray(currentFlow)) {
        var deepArray = currentFlow.map(currentInspectObject =>
          this.buildDfobFlow(
            currentInspectObject[currentDfob],
            dfobPathTab.slice(0)
          )
        );
        return [].concat.apply([], deepArray); // flatten array
      } else {
        return this.buildDfobFlow(
          currentFlow[currentDfob],
          dfobPathTab.slice(0)
        );
      }
    } else {
      var out = [];
      if (Array.isArray(currentFlow)) {
        out = out.concat(
          currentFlow.map(o => {
            return {
              objectToProcess: o,
              key: currentDfob
            };
          })
        );
      } else {
        out = out.concat({
          objectToProcess: currentFlow,
          key: currentDfob
        });
      }

      return out;
    }
  }



  buildPathResolution(workspace,component, requestDirection, depth, usableComponents, buildPath, queryParams) {
    //buildPath = buildPath || [];
    //infinite depth protection. Could be remove if process is safe
    if (depth < 100) {
      //var pathResolution = currentPathResolution || [];
      var incConsole = "";
      for (var i = 0; i < depth; i++) {
        incConsole += "-";
      }
      if (buildPath == undefined) {
        buildPath = {};
        buildPath.links = [];
        buildPath.nodes = [];
      }
      // console.log(" ---------- buildPathResolution -----------")
      // console.log(buildPath.links.map(link => {
      //   return (link.source._id+':'+link.source.name + ' -> ' + link.destination._id+':'+link.destination.name);
      // }));

      let module = this.technicalComponentDirectory[component.module];
      // console.log(incConsole, "buildPathResolution", component._id, requestDirection, module.type);
      var existingNodes = this.sift({
          "_id": component._id,
        },
        buildPath.nodes
      );
      if (existingNodes.length == 0) {
        buildPath.nodes.push(component)
      }

      let currentQueryParam = queryParams;
      if (module.buildQueryParam != undefined) {
        currentQueryParam = module.buildQueryParam(queryParams, component.specificData);
      }
      let connectionsBefore=this.sift({target:component._id},workspace.links).map(r=>r.source);
      let connectionsAfter=this.sift({source:component._id},workspace.links).map(r=>r.target);
//console.log(connectionsBefore);
      //if (requestDirection == "pull") {
      if (requestDirection != "push") {
        if (
          connectionsBefore.length > 0 &&
          !(requestDirection == "pull" && module.stepNode == true)
        ) {
          for (var beforeComponent of connectionsBefore) {
            console.log(beforeComponent);
            var beforeComponentObject = this.sift({
                _id: beforeComponent
              },
              usableComponents
            )[0];
            //protection against dead link
            if (beforeComponentObject) {
              var linkToProcess = {
                source: beforeComponentObject,
                destination: component,
                requestDirection: "pull",
                queryParams: currentQueryParam
              };
              var existingLink = this.sift({
                  "source._id": linkToProcess.source._id,
                  "destination._id": linkToProcess.destination._id
                },
                buildPath.links
              );
              if (existingLink.length == 0) {
                //linkToProcess.status='waiting';
                buildPath.links.push(linkToProcess);
                //console.log(linkToProcess);
                //buildPath.push(out);
                this.buildPathResolution(
                  workspace,
                  beforeComponentObject,
                  "pull",
                  depth + 1,
                  usableComponents,
                  buildPath,
                  currentQueryParam
                )

                // out.links = out.concat(
                //   recursivOut.links
                // );
              }
            }
          }
        } else {
          //console.log("add pullSource", component._id)
          component.pullSource = true;
          component.queryParams = currentQueryParam;
        }
      }
      if (requestDirection != "pull") {
        if (
          connectionsAfter.length > 0 &&
          !(requestDirection == "push" && module.stepNode == true)
        ) {
          for (var afterComponentId of connectionsAfter) {
            var afterComponentObject = this.sift({
                _id: afterComponentId
              },
              usableComponents
            )[0];
            //protection against dead link
            if (afterComponentObject) {
              var linkToProcess = {
                source: component,
                destination: afterComponentObject,
                requestDirection: "push"
              };
              var existingLink = this.sift({
                  "source._id": linkToProcess.source._id,
                  "destination._id": linkToProcess.destination._id
                },
                buildPath.links
              );
              if (existingLink.length == 0) {

                //console.log(linkToProcess);
                buildPath.links.push(linkToProcess);

                this.buildPathResolution(
                  workspace,
                  afterComponentObject,
                  "push",
                  depth + 1,
                  usableComponents,
                  buildPath
                )

              }
            }
          }
        }
      }
      return buildPath;
    }
  }

}

module.exports = {
  // threads: require("threads"),
  execute: function(component, requestDirection, stompClient, callerId, pushData, queryParams) {
    let engine = new Engine(component, requestDirection, stompClient, callerId, pushData, queryParams);
    return engine.resolveComponent();
  }
  // getNewInstance: function() {
  //   let out = new Engine();
  //   return out;
  // },
  // executeInThread: function(component, requestDirection, pushData) {
  //   const thread = this.threads.spawn(function([
  //     dirname,
  //     component,
  //     requestDirection,
  //     pushData
  //   ]) {
  //     return new Promise((resolve, reject) => {
  //       let recursivPullResolvePromise = require(dirname +
  //         "/recursivPullResolvePromise.js");
  //       recursivPullResolvePromise
  //         .getNewInstance()
  //         .resolveComponent(component, requestDirection, pushData)
  //         .then(data => {
  //           resolve(data);
  //         })
  //         .catch(err => {
  //           reject(err);
  //         });
  //     });
  //   });
  //
  //   return new Promise((resolve, reject) => {
  //     thread
  //       .send([__dirname, component, requestDirection, pushData])
  //       // The handlers come here: (none of them is mandatory)
  //       .on("message", function(response) {
  //         thread.kill();
  //         resolve(response);
  //       })
  //       .on("error", function(error) {
  //         reject(error);
  //       });
  //   });
  // }
};
