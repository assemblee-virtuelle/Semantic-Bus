'use strict';

//const https = require('https');

//const url = require('url');
//doc to promises : http://stackoverflow.com/questions/35182752/promises-with-http-get-node-js

class Engine {
  constructor() {
    this.technicalComponentDirectory = require('./technicalComponentDirectory.js');
    // this.workspaceComponentPromise = require('./workspaceComponentPromise');
    this.sift = require('sift');
    this.config_component = require('../configuration');
    this.objectSizeOf = require('object-sizeof');
    // this.mLabPromise = require('./mLabPromise');
    this.workspace_component_lib = require('../lib/core/lib/workspace_component_lib');
    this.workspace_lib = require('../lib/core/lib/workspace_lib');
    this.user_lib = require('../lib/core/lib/user_lib');
    this.config = require('../configuration.js');
    this.fackCounter = 0;


  };

  resolveComponent(component, requestDirection, pushData) {
    if (this.config.quietLog != true) {
      console.log(" ---------- resolveComponent -----------")
    }

    return new Promise((resolve, reject) => {
      this.workspace_component_lib.get_all_withConsomation({
        workspaceId: component.workspaceId
      }).then(components => {
        this.componentsResolving = components;
        this.componentsResolving.forEach(component => {
          component.status = 'waiting';
          //empty object are not persist by mongoose
          component.specificData = component.specificData || {};
        });

        let originComponent = this.sift({
          '_id': component._id
        }, this.componentsResolving)[0];
        this.pathResolution = this.buildPathResolution(originComponent, requestDirection, 0, this.componentsResolving);
        this.pathResolution.forEach(link => {
          link.status = 'waiting';
        });

        this.RequestOrigine = originComponent;
        this.RequestOrigineResolveMethode = resolve;
        this.RequestOrigineRejectMethode = reject;
        this.RequestOrigineResponse = undefined;

        /// -------------- push case  -----------------------
        var traitement_id = Date.now()
        if (requestDirection == 'push') {

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
        let owner = null
        this.workspace_lib.getWorkspace(component.workspaceId).then(function (res) {
          res.users.forEach((user) => {
            if (user.role == "owner") {
              this.user_lib.get({
                'credentials.email': user.email
              }).then(function (user) {
                var global_flow = 0
                tableSift.forEach(componentProcessing => {
                  console.log("OWNER", user.credit)
                  if (user.credit >= 1000) {
                    let module = this.technicalComponentDirectory[componentProcessing.module];
                    // console.log("FOR EACH COMPONET ------///// ------", componentProcessing.module)
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

                        this.processNextBuildPath(traitement_id, component.workspaceId, global_flow, user);
                        // }.bind(this))
                      })
                      .catch(e => {
                        console.log('WORK ERROR', e);
                        reject(e);
                      });
                  } else {
                    let fullError = new Error();
                    fullError.message = "Vous n'avez pas assez de credit"
                    reject(fullError)
                  }
                });
              }.bind(this))
            }
          })
        }.bind(this))
        //}

      })

    });

  };
  processNextBuildPath(traitement_id, component_workspaceId, global_flow, owner) {
    if (owner.credit >= 100) {
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


        if(module.getPriceState!=undefined){
          this.config_component.components_information.forEach((component) => {
            owner.credit -= (res.price * dataFlow[0].data.length +  (this.objectSizeOf(dataFlow) / 1000000 * component[processingLink.destination.module].price))
            console.log(owner.credit, res.price * dataFlow[0].data.length, (this.objectSizeOf(dataFlow) / 1000000 * component[processingLink.destination.module].price))
            this.user_lib.update(owner).then(res=>{
              console.log("CREDIT UPDATE",res.credit)
            })
          })
        }

        if (processingLink.destination.consumption_history) {
          processingLink.destination.consumption_history.push({
            traitement_id: traitement_id,
            flow_size: this.objectSizeOf(dataFlow) / 1000000,
            price: (this.objectSizeOf(dataFlow) / 1000000) * 0.04,
            dates: {
              created_at: new Date()
            }
          })
        } else {
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
        //console.log(processingLink.destination)
        if (this.config.quietLog != true) {
          //console.log('BEFORE lib Update');
        }
        this.workspace_component_lib.update(
          processingLink.destination
        ).then(function (res) {
          if (this.config.quietLog != true) {
            //console.log('AFTER lib Update');
          }
          //console.log("res update =======>",res)
          global_flow += this.objectSizeOf(dataFlow)
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
              this.processNextBuildPath(traitement_id, component_workspaceId, global_flow, owner);

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
              this.processNextBuildPath(traitement_id, component_workspaceId, global_flow, owner);
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
      this.workspace_lib.getWorkspace(component_workspaceId).then(function (res) {
        if (res.consumption_history) {
          res.consumption_history.push({
            traitement_id: traitement_id,
            flow_size: global_flow / 1000000,
            price: (global_flow / 1000000) * 0.04,
            dates: {
              created_at: new Date()
            }
          })
        } else {
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

        this.workspace_lib.updateSimple(res).then(function (res) {
          if (this.config.quietLog != true) {
            //console.log('length after', res.components.length)
            console.log('--------------  End of Worksapce processing -------------- ', res._id)
          }
        }.bind(this))
      }.bind(this))
    }
  }else{
    let fullError = new Error();
    fullError.message = "Vous n'avez pas assez de credit"
    this.RequestOrigineRejectMethode(fullError);
  }
  };

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
  };
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
  };

}


module.exports = {
  threads: require('threads'),
  getNewInstance: function () {
    let out = new Engine();
    //console.log(out);
    return out;
  },
  executeInThread: function (component, requestDirection, pushData) {
    const thread = this.threads.spawn(function ([dirname, component, requestDirection, pushData]) {
      return new Promise((resolve, reject) => {
        let recursivPullResolvePromise = require(dirname + '/recursivPullResolvePromise.js');
        recursivPullResolvePromise.getNewInstance().resolveComponent(component, requestDirection, pushData).then(data => {
          resolve(data)
        }).catch(err => {
          reject(err)
        })
      });
    });

    return new Promise((resolve, reject) => {
      thread.send([__dirname, component, requestDirection, pushData])
        // The handlers come here: (none of them is mandatory)
        .on('message', function(response) {
          //console.log('THREAD RESPONSE', response);
          thread.kill();
          resolve(response);
        }).on('error', function (error) {
          reject(error)
        })
    });

    //console.log('1',Engine);
    //console.log(JSON.stringify(new Engine()));

  }
}