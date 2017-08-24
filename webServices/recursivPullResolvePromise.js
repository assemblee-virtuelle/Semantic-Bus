'use strict';

//const https = require('https');

//const url = require('url');
//doc to promises : http://stackoverflow.com/questions/35182752/promises-with-http-get-node-js

var workspace_component_lib = require('../lib/core/lib/workspace_component_lib');


module.exports = {
  technicalComponentDirectory: require('./technicalComponentDirectory.js'),
  //restGetJson: require('./workSpaceComponentDirectory/restGetJson.js'),
  //mLabPromise: require('./mLabPromise'),
  workspaceComponentPromise: require('./workspaceComponentPromise'),
  sift: require('sift'),
  mLabPromise: require('./mLabPromise'),
  resolveComponentPull(component, notMainNode, pullParams) {
    //console.log(pullParams);
    return this._makeRequest(component, notMainNode, pullParams);
  },
  resolveComponent(component, requestDirection, pushData) {
    //buildPathResolution component, requestDirection

    console.log(" ---------- resolveComponent -----------")

    return new Promise((resolve, reject) => {
      workspace_component_lib.get_all({
        workspaceId: component.workspaceId
      }).then(components => {
        this.componentsResolving = components;
        this.componentsResolving.forEach(component => {
          component.status = 'waiting';
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
          link.status = 'waiting';
        });
        // this.linksProcessing = [];
        // this.linksProcessed = [];
        this.RequestOrigine = originComponent;
        this.RequestOrigineResolveMethode = resolve;
        this.RequestOrigineRejectMethode = reject;
        this.RequestOrigineResponse = undefined;

        /// -------------- push case  -----------------------

        if (requestDirection == 'push') {
          // affecter le flux à tous les link dont la source est le composant
          // console.log(" function : resolveComponent | variable : in push ")
          // this.sift({
          //   '_id': component._id
          // }, this.componentsResolving)[0].dataResolution = pushData;
          originComponent.dataResolution = pushData;

          this.sift({
            "source._id": component._id
          }, this.pathResolution).forEach(link => {
            link.status = 'processing'
          });
          this.processNextBuildPath();
        }

        /// -------------- pull case  -----------------------


        if (requestDirection == 'pull') {

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

          tableSift.forEach(componentProcessing => {
            let module = this.technicalComponentDirectory[componentProcessing.module];
            //let componentProcessing = processingLink.source;
            //console.log('PULL start | ', componentProcessing._id);
            module.pull(componentProcessing, undefined, undefined).then(componentFlow => {
              console.log('PULL END | ', componentProcessing._id);
              componentProcessing.dataResolution = componentFlow;
              componentProcessing.status = 'resolved';
              this.sift({
                "source._id": componentProcessing._id
              }, this.pathResolution).forEach(link => {
                link.status = 'processing'
              });
              if (componentProcessing._id == this.RequestOrigine._id) {
                this.RequestOrigineResolveMethode(componentProcessing.dataResolution)
              }
              this.processNextBuildPath();
            })
          });
        }

      })
    });

  },
  processNextBuildPath() {
    console.log(" ---------- processNextBuildPath -----------")

    console.log('pathResolution | ', this.pathResolution.map(link => {
      return (link.source._id + ' -> ' + link.destination._id + ' : ' + link.status);
    }));
    let linkNotResolved = this.sift({
      status: 'processing'
    }, this.pathResolution);
    if (linkNotResolved.length > 0) {
      for (var processingLink of linkNotResolved) {

        //-------------- Source --------------

        //console.log(" --------- processingLink ------------- ")

        let sourcesToResolve = this.sift({
          '_id': processingLink.source._id,
          dataResolution: {
            $exists: false
          },
          //status: {$ne:'resolved'} // ==  dataResolution: { $exists: false }
        }, this.componentsResolving);

        //console.log("source to resolve ||", sourcesToResolve)

        //-------------- Component processing --------------
        // source of link have to be Resolved (dataResolution :false) before processing
        if (sourcesToResolve.length == 0) {
          //console.log("string |", processingLink.destination)
          var componentProcessing = this.sift({
            "_id": processingLink.destination._id
          }, this.componentsResolving)[0];

          //console.log("componentProcessingDestination", componentProcessing)

          //console.log("componentProcessing processing ||", componentProcessing.status)

          //-------------- Data flow --------------

          let dataFlow = this.sift({
            'destination._id': componentProcessing._id
          }, this.pathResolution).map(sourceLink => {
            //sourceLink.status = 'resolved';
            //TODO vérifier que on y a pas directement acces par le link.source
            var sourceFlow = this.sift({
                "_id": sourceLink.source._id
              },
              this.componentsResolving
            );
            //console.log(sourceFlow);
            return sourceFlow[0].dataResolution;
          });
          //console.log("dataflow ||", dataFlow.length);

          //-------------- Pull méthode --------------

          let module = this.technicalComponentDirectory[componentProcessing.module];
          //let componentProcessing = processingLink.source;

          module.pull(componentProcessing, dataFlow, undefined).then(componentFlow => {
            console.log('PULL END | ', componentProcessing._id);
            componentProcessing.dataResolution = componentFlow;
            componentProcessing.status = 'resolved';
            //console.log('componentProcessing resolved ||', componentProcessing.status)
            this.sift({
              "source._id": componentProcessing._id
            }, this.pathResolution).forEach(link => {
              //console.log(link)
              link.status = 'processing'
            });
            this.sift({
              "destination._id": componentProcessing._id
            }, this.pathResolution).forEach(link => {
              link.status = 'resolved'
            });
            if (componentProcessing._id == this.RequestOrigine._id) {
              this.RequestOrigineResolveMethode(componentProcessing.dataResolution)
            }
            this.processNextBuildPath();
          })

        }
      }
    } else {
      console.log('--------------  End of Worksapce processing -------------- ')
    }
  },
  buildDfobFlow(currentFlow, dfobPathTab) {
    let currentDfob = dfobPathTab.shift();
    let currentInspectFlow = currentFlow[currentDfob];
    //console.log('buildDfobFlow | ',dfobPathTab.length,currentDfob,currentInspectFlow);
    if (dfobPathTab.length > 1) {
      if (Array.isArray(currentInspectFlow)) {
        var deepArray = currentInspectFlow.map(currentInspectObject => this.buildDfobFlow(currentInspectObject, dfobPathTab.slice(0)));
        return [].concat.apply([], deepArray); // flatten array
      } else {
        return this.buildDfobFlow(currentInspectFlow, dfobPathTab.slice(0));
      }
    } else {
      if (Array.isArray(currentInspectFlow)) {
        return currentInspectFlow.map(currentInspectObject => {
          return {
            objectToProcess: currentInspectObject,
            key: dfobPathTab[0]
          }
        });
      } else {
        return [{
          ObjectToProcess: currentInspectFlow,
          key: dfobPathTab[0]
        }];
      }
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
      console.log(incConsole, "buildPathResolution", component._id, requestDirection);
      let module = this.technicalComponentDirectory[component.module];

      var out = [];
      //if (requestDirection == "pull") {
      if (component.connectionsBefore != undefined && component.connectionsBefore.length > 0 && !(requestDirection == 'pull' && module.stepNode == true)) {
        for (var beforeComponent of component.connectionsBefore) {
          //console.log(beforeComponent);
          var beforeComponentObject = this.sift({
            "_id": beforeComponent
          }, usableComponents)[0];
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
            buildPath.push(linkToProcess);
            out = out.concat(this.buildPathResolution(beforeComponentObject, "pull", depth + 1, usableComponents, buildPath));
          }

        }
      } else {
        //console.log("add pullSource", component._id)
        component.pullSource = true;
      }
      if (component.connectionsAfter != undefined && component.connectionsAfter.length > 0 && !(requestDirection == 'push' && module.stepNode == true)) {
        for (var afterComponent of component.connectionsAfter) {
          var afterComponentObject = this.sift({
            "_id": afterComponent
          }, usableComponents)[0];
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
            buildPath.push(linkToProcess);
            out = out.concat(this.buildPathResolution(afterComponentObject, "push", depth + 1, usableComponents, buildPath));
          }
        }
      }
      //console.log("function : buildPathResolution | RETURN")
      return out;
    }
  },
  _makeRequest(component, notMainNode, pullParams) {

    // create a new Promise
    return new Promise((resolve, reject) => {
      //console.log('recursivPullResolvePromise | ',component,' | connectionsBefore |',component.connectionsBefore);
      var module = this.technicalComponentDirectory[component.module];
      //console.log('recursivPullResolvePromise | technicalComponentDirectory | ',this.technicalComponentDirectory,this.workspaceComponentPromise);
      console.log('recursivPullResolvePromise | module | ', module.type, module.name);
      //console.log('recursivPullResolvePromise | before | ',component.connectionsBefore.length,' | stepNode |',module.stepNode,' | notMainNode |',notMainNode);
      if (component.connectionsBefore.length > 0 && (module.stepNode != true || notMainNode != true)) {
        console.log('resolveWebComponentPull | beforeId | ', component.connectionsBefore[0]);

        Promise.all(
          component.connectionsBefore.map(connectionBeforeId => {
            //console.log(connectionBeforeId);
            return this.workspaceComponentPromise.getReadPromiseById(connectionBeforeId)
          })
        ).then(workspaceComponents =>
          Promise.all(
            workspaceComponents.map(workspaceComponent => {
              if (workspaceComponent.message == 'Document not found') {
                return new Promise((resolve, reject) => {
                  resolve({
                    data: []
                  })
                });
              } else {
                //console.log(workspaceComponent);
                return this.resolveComponentPull(workspaceComponent, true, pullParams)
              }
            })
          )
        ).then(connectionsBeforeData => {
          //connectionsBeforeData=connectionsBeforeData.map(connectionBeforeData=>{data:connectionBeforeData})
          if (module.pull) {
            //console.log('connectionsBeforeData | ', connectionsBeforeData);
            var primaryflow;
            if (module.getPrimaryFlow != undefined) {
              primaryflow = module.getPrimaryFlow(component, connectionsBeforeData);
            } else {
              primaryflow = connectionsBeforeData[0];
            }

            //primary flow extraction
            var secondaryFlow = [];
            secondaryFlow = secondaryFlow.concat(connectionsBeforeData);
            secondaryFlow.splice(secondaryFlow.indexOf(primaryflow), 1);
            //console.log('secondaryFlow |' , secondaryFlow);
            if (primaryflow.dfob != undefined) {


              var dfobTab = primaryflow.dfob[0].split(".");
              //var currentInspectObject = primaryflow.data;

              var dfobFinalFlow = this.buildDfobFlow(primaryflow.data, dfobTab)

              //console.log('dfobFinalFlow | ', dfobFinalFlow);
              var testPromises = dfobFinalFlow.map(finalItem => {
                var recomposedFlow = [];
                recomposedFlow = recomposedFlow.concat([{
                  data: finalItem.objectToProcess[finalItem.key],
                  componentId: primaryflow.componentId
                }]);
                recomposedFlow = recomposedFlow.concat(secondaryFlow);
                return module.pull(component, recomposedFlow, pullParams);
              })

              Promise.all(testPromises).then(dataTestTab => {
                //console.log('AllDfobResult |', dataTestTab);
                for (var dataTestTabKey in dataTestTab) {
                  dfobFinalFlow[dataTestTabKey].objectToProcess[dfobFinalFlow[dataTestTabKey].key] = dataTestTab[dataTestTabKey].data;
                  //currentInspectObject[dataTestTabKey][currentDfob] = dataTestTab[dataTestTabKey].data;
                }
                resolve({
                  componentId: component._id.$oid,
                  data: primaryflow.data
                });
              }).catch(e => {
                console.log(e);
              });



            } else {
              console.log('recursivPullResolvePromise | module start pull | ', module.type);
              //console.log('recursivPullResolvePromise |connectionsBeforeData | ', connectionsBeforeData);

              module.pull(component, connectionsBeforeData, pullParams).then(function(dataTest) {
                console.log('recursivPullResolvePromise | module end | ', module.type);
                //console.log('recursivPullResolvePromise | dataTest | ',dataTest);
                resolve({
                  componentId: component._id.$oid,
                  data: dataTest.data,
                  dfob: dataTest.dfob
                });
              });
            }
          } else {
            console.log('NO MODULE');
            resolve(null);
          }
        });

      } else {
        //console.log('resolveWebComponentPull | Last| ', component);
        if (module.pull) {
          module.pull(component, undefined, pullParams).then(function(dataTest) {
            console.log('recursivPullResolvePromise | module end | ', module.type);
            //console.log('recursivPullResolvePromise | module end | dataTest', dataTest);
            resolve({
              componentId: component._id.$oid,
              data: dataTest.data
            });
          });
        } else {
          console.log('NO MODULE');
          resolve(null);
        }
      }
    });
  }
};
