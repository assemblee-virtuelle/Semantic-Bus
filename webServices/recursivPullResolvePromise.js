'use strict';

//const https = require('https');

//const url = require('url');
//doc to promises : http://stackoverflow.com/questions/35182752/promises-with-http-get-node-js


module.exports = {
  technicalComponentDirectory: require('./technicalComponentDirectory.js'),
  //restGetJson: require('./workSpaceComponentDirectory/restGetJson.js'),
  //mLabPromise: require('./mLabPromise'),
  workspaceComponentPromise: require('./workspaceComponentPromise'),
  resolveComponentPull(component, notMainNode, pullParams) {
    //console.log(pullParams);
    return this._makeRequest(component, notMainNode, pullParams);
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
          if (module.test) {
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
                return module.test(component, recomposedFlow, pullParams);
              })
              console.log('ALLO');

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



              // if (Array.isArray(currentInspectObject)) {
              //   var currentDfob = dfobTab.shift();
              //   if (dfobTab.length > 0) {
              //
              //   } else {
              //     //currentInspectObject = [currentInspectObject[0]];
              //     var testPromises = currentInspectObject.map(objectToProcess => {
              //       var recomposedFlow = [];
              //       recomposedFlow = recomposedFlow.concat([{
              //         data: objectToProcess[currentDfob],
              //         componentId: primaryflow.componentId
              //       }]);
              //
              //       recomposedFlow = recomposedFlow.concat(secondaryFlow);
              //       //console.log('recomposedFlow | ',recomposedFlow);
              //       return module.test(component, recomposedFlow, pullParams)
              //     });
              //     Promise.all(testPromises).then(dataTestTab => {
              //       for (var dataTestTabKey in dataTestTab) {
              //         currentInspectObject[dataTestTabKey][currentDfob] = dataTestTab[dataTestTabKey].data;
              //       }
              //       resolve({
              //         componentId: component._id.$oid,
              //         data: primaryflow.data
              //       });
              //     });
              //   }
              // } else {
              //   var recomposedFlow = [];
              //   //console.log(primaryflow.data['features']);
              //   var currentDfob = dfobTab.shift();
              //   recomposedFlow = recomposedFlow.concat([{
              //     data: primaryflow.data[currentDfob],
              //     componentId: primaryflow.componentId
              //   }]);
              //   module.test(component, recomposedFlow, pullParams).then(function(dataTest) {
              //     console.log('recursivPullResolvePromise | module end | ', module.type);
              //     //console.log('recursivPullResolvePromise | dataTest | ',dataTest);
              //     resolve({
              //       componentId: component._id.$oid,
              //       data: dataTest.data,
              //     });
              //   });
              // }


            } else {
              console.log('recursivPullResolvePromise | module start test | ', module.type);
              //console.log('recursivPullResolvePromise |connectionsBeforeData | ', connectionsBeforeData);

              module.test(component, connectionsBeforeData, pullParams).then(function(dataTest) {
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
        if (module.test) {
          module.test(component, undefined, pullParams).then(function(dataTest) {
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
