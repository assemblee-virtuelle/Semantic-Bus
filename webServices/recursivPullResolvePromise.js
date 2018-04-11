"use strict";

class Engine {
  constructor(component, requestDirection, stompClient, callerId, pushData, queryParams) {
    this.technicalComponentDirectory = require("./technicalComponentDirectory.js");
    this.sift = require("sift");
    this.config_component = require("../configuration");
    this.objectSizeOf = require("object-sizeof");
    this.workspace_component_lib = require("../lib/core/lib/workspace_component_lib");
    this.workspace_lib = require("../lib/core/lib/workspace_lib");
    this.user_lib = require("../lib/core/lib/user_lib");
    this.config = require("../configuration.js");
    let PromiseOrchestrator = require("./promiseOrchestrator.js")
    this.promiseOrchestrator = new PromiseOrchestrator();
    this.fackCounter = 0;
    this.stompClient = stompClient,
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
                  this.owner = user;
                  let roundDate = new Date();
                  roundDate.setMinutes(0);
                  roundDate.setSeconds(0);
                  roundDate.setMilliseconds(0);
                  roundDate.setHours(0);
                  this.workspace_lib.createProcess({
                    workflowId: this.originComponent.workspaceId,
                    roundDate: roundDate,
                    ownerId: this.owner._id,
                    callerId: this.callerId,
                    originComponentId: this.originComponent._id
                  }).then((process) => {
                    this.processId = process._id;
                    this.stompClient.send('/topic/process-start.' + this.originComponent.workspaceId, JSON.stringify({
                      processId: this.processId
                    }));

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
                      this.originComponent,
                      this.requestDirection,
                      0,
                      this.componentsResolving,
                      undefined,
                      this.originQueryParams
                    );

                    this.pathResolution.forEach(link => {
                      link.status = "waiting";
                    });
                    this.RequestOrigine = this.originComponent;
                    this.RequestOrigineResolveMethode = resolve;
                    this.RequestOrigineRejectMethode = reject;
                    this.RequestOrigineResponse = undefined;

                    /// -------------- push case  -----------------------
                    if (this.requestDirection == "push") {
                      this.originComponent.dataResolution = this.pushData;

                      this.sift({
                          "source._id": component._id
                        },
                        this.pathResolution
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
                        let module = this.technicalComponentDirectory[
                          componentProcessing.module
                        ];
                        //console.log(componentProcessing.specificData);
                        module
                          .pull(componentProcessing, undefined, componentProcessing.queryParams)
                          .then(componentFlow => {
                            if (this.config.quietLog != true) {
                              //console.log('AFFECTATION',componentProcessing._id,componentFlow.data.length);
                            }

                            componentProcessing.dataResolution = componentFlow;
                            componentProcessing.status = "resolved";

                            this.sift({
                                "source._id": componentProcessing._id
                              },
                              this.pathResolution
                            ).forEach(link => {
                              link.status = "processing";
                            });

                            this.workspace_lib.createHistoriqueEnd({
                              data: componentProcessing.dataResolution.data,
                              processId: this.processId,
                              componentId: componentProcessing._id,
                              componentName: componentProcessing.name,
                              componentModule: module.type
                            }).then(historiqueEnd => {
                              this.stompClient.send('/topic/process-progress.' + this.token, JSON.stringify({
                                processId: this.processId
                              }));
                            }).catch(e => {
                              console.log(e);
                              this.stompClient.send('/topic/process-progress.' + this.callerId, JSON.stringify({
                                error: {
                                  "code": e.code,
                                  "errmsg": e.errmsg
                                }
                              }));
                            });

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
                            console.log(
                              "WORK ERROR",
                              e.message,
                              componentProcessing._id
                            );
                            reject(e);
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
        // console.log(this.pathResolution.map(link => {
        //   return (link.source._id + ' -> ' + link.destination._id + ' : ' + link.status);
        // }));
      }
      let linkNotResolved = this.sift({
          status: "processing"
        },
        this.pathResolution
      );
      if (linkNotResolved.length > 0) {
        for (var processingLinkCandidate of linkNotResolved) {
          let linksNotReady = this.sift({
              "destination._id": processingLinkCandidate.destination._id,
              status: {
                $ne: "processing"
              } // ==  dataResolution: { $exists: false }
            },
            this.pathResolution
          );

          if (linksNotReady.length == 0) {
            var processingLink = processingLinkCandidate;
            break;
          }
        }

        //-------------- Component processing --------------

        if (processingLink != undefined) {
          let linksProcessingInputs = this.sift({
              "destination._id": processingLink.destination._id,
              status: "processing"
            },
            this.pathResolution
          );

          let module = this.technicalComponentDirectory[
            processingLink.destination.module
          ];
          let dataFlow = linksProcessingInputs.map(sourceLink => {
            let d = sourceLink.source.dataResolution;
            d.componentId = sourceLink.source._id;
            return d;
          });

          let current_cost = null;
          let consumption_history_object = {};
          let current_component = this.config_component.components_information[processingLink.destination.module];
          let current_component_price;

          if (module.getPriceState != undefined) {
            current_component_price = module.getPriceState(processingLink.destination.specificData, current_component.price, current_component.record_price);
          } else {
            current_component_price = {
              moPrice: current_component.price,
              recordPrice: current_component.record_price
            }
          }
          current_component = this.config_component.components_information[processingLink.destination.module];
          //console.log(dataFlow[0].data);
          consumption_history_object.recordCount = dataFlow == undefined ? 0 : dataFlow[0].data.length || 1;
          consumption_history_object.recordPrice = current_component_price.record_price || 0;
          consumption_history_object.moCount = this.objectSizeOf(dataFlow) / 1000000;
          consumption_history_object.componentPrice = current_component_price.moPrice;
          consumption_history_object.totalPrice =
            (consumption_history_object.recordCount * consumption_history_object.recordPrice) / 1000 +
            (consumption_history_object.moCount * consumption_history_object.componentPrice) / 1000;
          consumption_history_object.componentModule = processingLink.destination.module
          //TODO pas besoin de stoquer le name du component, on a l'id. ok si grosse perte de perf pour histogramme
          consumption_history_object.componentName = processingLink.destination.name;
          consumption_history_object.componentId = processingLink.destination._id;
          consumption_history_object.processId = this.processId;

          if (this.config.quietLog != true) {
            //console.log("CONSUPTION_HISTORIQUE", consumption_history_object);
          }

          // TODO L'historique devrait avoir sa lib indépendante de workspace_lib
          // TODO L'enregistrement de l'historique devait avoir lieu apres la résolution du work. on ne facture pas si le composant plante
          this.workspace_lib.createHistoriqueStart(consumption_history_object);

          //UPDATE USER CREDIT
          this.owner.credit -= consumption_history_object.totalPrice;

          this.user_lib.update(this.owner);

          if (this.config.quietLog != true) {
            //console.log('AFTER consumption Update', consumption_history_res);
          }
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
                data: primaryflow.data
              };
              processingLink.destination.status = "resolved";
              this.sift({
                  "source._id": processingLink.destination._id
                },
                this.pathResolution
              ).forEach(link => {
                link.status = "processing";
              });

              linksProcessingInputs.forEach(link => {
                link.status = "resolved";
              });

              this.workspace_lib.createHistoriqueEnd({
                data: processingLink.destination.dataResolution.data,
                processId: this.processId,
                componentId: processingLink.destination._id,
                componentName: processingLink.destination.name,
                componentModule: module.type
              }).then(historiqueEnd => {
                this.stompClient.send('/topic/process-progress.' + this.callerId, JSON.stringify({
                  processId: this.processId
                }));
              }).catch(e => {
                //console.log("process creation Error",e,this.callerId);
                this.stompClient.send('/topic/process-progress.' + this.callerId, JSON.stringify({
                  error: {
                    "code": e.code,
                    "errmsg": e.errmsg
                  }
                }));
              });

              if (
                processingLink.destination._id == this.RequestOrigine._id
              ) {
                this.RequestOrigineResolveMethode(
                  processingLink.destination.dataResolution
                );

              }

              this.processNextBuildPath();
            }).catch(e => {
              this.RequestOrigineRejectMethode(e);
            });

            // var testPromises = dfobFinalFlow.map(finalItem => {
            //   var recomposedFlow = [];
            //   recomposedFlow = recomposedFlow.concat([{
            //     data: finalItem.objectToProcess[finalItem.key],
            //     componentId: primaryflow.componentId
            //   }]);
            //   recomposedFlow = recomposedFlow.concat(secondaryFlow);
            //   return module.pull(
            //     processingLink.destination,
            //     recomposedFlow,
            //     undefined
            //   );
            // });



            // Promise.all(testPromises)
            //   .then(componentFlowDfob => {
            //     for (var componentFlowDfobKey in componentFlowDfob) {
            //       dfobFinalFlow[componentFlowDfobKey].objectToProcess[
            //           dfobFinalFlow[componentFlowDfobKey].key
            //         ] =
            //         componentFlowDfob[componentFlowDfobKey].data;
            //     }
            //
            //     processingLink.destination.dataResolution = {
            //       componentId: processingLink.destination._id,
            //       data: primaryflow.data
            //     };
            //     processingLink.destination.status = "resolved";
            //     this.sift({
            //         "source._id": processingLink.destination._id
            //       },
            //       this.pathResolution
            //     ).forEach(link => {
            //       link.status = "processing";
            //     });
            //
            //     linksProcessingInputs.forEach(link => {
            //       link.status = "resolved";
            //     });
            //
            //     if (
            //       processingLink.destination._id == this.RequestOrigine._id
            //     ) {
            //       this.RequestOrigineResolveMethode(
            //         processingLink.destination.dataResolution
            //       );
            //     }
            //     this.processNextBuildPath(
            //       traitement_id,
            //       component_workspaceId,
            //       owner,
            //       name
            //     );
            //   })
            // .catch(e => {
            //   this.RequestOrigineRejectMethode(e);
            // });
          } else {
            module
              .pull(processingLink.destination, dataFlow, processingLink.queryParams)
              .then(componentFlow => {
                processingLink.destination.dataResolution = componentFlow;
                processingLink.destination.status = "resolved";

                this.sift({
                    "source._id": processingLink.destination._id
                  },
                  this.pathResolution
                ).forEach(link => {
                  link.status = "processing";
                });

                linksProcessingInputs.forEach(link => {
                  link.status = "resolved";
                });

                this.workspace_lib.createHistoriqueEnd({
                  data: processingLink.destination.dataResolution.data,
                  processId: this.processId,
                  componentId: processingLink.destination._id,
                  componentName: processingLink.destination.name,
                  componentModule: module.type
                }).then(historiqueEnd => {
                  //console.log('PROCESS CREATED',process);
                  //console.log('SEND'+this.callerId);
                  this.stompClient.send('/topic/process-progress.' + this.callerId, JSON.stringify({
                    processId: this.processId
                  }));
                }).catch(e => {
                  //console.log("process creation Error", e, this.callerId);
                  this.stompClient.send('/topic/process-progress.' + this.callerId, JSON.stringify({
                    error: {
                      "code": e.code,
                      "errmsg": e.errmsg
                    }
                  }));
                });

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
                this.RequestOrigineRejectMethode(e);
              });
          }
        }
      } else {
        if (this.config.quietLog != true) {
          this.stompClient.send('/topic/process-end.' + this.originComponent.workspaceId, JSON.stringify({
            processId: this.processId
          }));

          console.log(
            "--------------  End of Worksapce processing --------------"
          );
        }
      }
    } else {
      let fullError = new Error();
      fullError.message = "Vous n'avez pas assez de credit";
      this.RequestOrigineRejectMethode(fullError);
    }
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



  buildPathResolution(component, requestDirection, depth, usableComponents, buildPath, queryParams) {
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
      let currentQueryParam = queryParams;
      if (module.buildQueryParam != undefined) {
        currentQueryParam = module.buildQueryParam(queryParams, component.specificData);
      }
      //if (requestDirection == "pull") {
      if (requestDirection != "push") {
        if (
          component.connectionsBefore != undefined &&
          component.connectionsBefore.length > 0 &&
          !(requestDirection == "pull" && module.stepNode == true)
        ) {
          for (var beforeComponent of component.connectionsBefore) {
            //console.log(beforeComponent);
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
                buildPath
              );
              if (existingLink.length == 0) {
                //linkToProcess.status='waiting';
                out.push(linkToProcess);
                //console.log(linkToProcess);
                buildPath.push(linkToProcess);
                out = out.concat(
                  this.buildPathResolution(
                    beforeComponentObject,
                    "pull",
                    depth + 1,
                    usableComponents,
                    buildPath,
                    currentQueryParam
                  )
                );
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
          component.connectionsAfter != undefined &&
          component.connectionsAfter.length > 0 &&
          !(requestDirection == "push" && module.stepNode == true)
        ) {
          for (var afterComponentId of component.connectionsAfter) {
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
                buildPath
              );
              if (existingLink.length == 0) {
                out.push(linkToProcess);
                //console.log(linkToProcess);
                buildPath.push(linkToProcess);
                out = out.concat(
                  this.buildPathResolution(
                    afterComponentObject,
                    "push",
                    depth + 1,
                    usableComponents,
                    buildPath
                  )
                );
              }
            }
          }
        }
      }
      return out;
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
