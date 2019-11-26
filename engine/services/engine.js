'use strict'

const ProcessNotifier = require('./ProcessNotifier')
const clone = require('clone');

class Engine {
  constructor(component, requestDirection, amqpClient, callerId, pushData, queryParams) {
    this.technicalComponentDirectory = require('./technicalComponentDirectory.js');
    this.sift = require('sift').default;
    this.objectSizeOf = require('object-sizeof');
    this.workspace_component_lib = require('../../core/lib/workspace_component_lib');
    this.workspace_lib = require('../../core/lib/workspace_lib');
    this.user_lib = require('../../core/lib/user_lib');
    this.config = require('../configuration.js');
    let PromiseOrchestrator = require('../../core/helpers/promiseOrchestrator.js');
    this.stringReplacer = require('../utils/stringReplacer.js')
    this.promiseOrchestrator = new PromiseOrchestrator();
    this.fackCounter = 0;
    this.amqpClient = amqpClient;
    this.callerId = callerId;
    this.processId = null;
    this.originComponent = component;
    this.requestDirection = requestDirection;
    this.pushData = pushData;
    this.originQueryParams = queryParams;
    this.owner = null;
  }

  resolveComponent() {
    return new Promise(async (resolve, reject) => {
      try {
        let components = await this.workspace_component_lib
          .get_all({
            workspaceId: this.originComponent.workspaceId
          });
        this.componentsResolving = components
        let workflow = await this.workspace_lib.getWorkspace(this.originComponent.workspaceId);
        this.workflow = workflow;
        console.log(' ---------- Start Engine-----------', this.workflow.name)
        this.workflow.status = 'running';
        await this.workspace_lib.updateSimple(this.workflow);
        let ownerUserMail = this.workflow.users.filter(
          this.sift({
            role: 'owner'
          })
        )[0]
        let user = await this.user_lib.get({
          'credentials.email': ownerUserMail.email
        });
        this.componentsResolving.forEach(component => {
          component.specificData = component.specificData || {}
        })

        this.originComponent = this.componentsResolving.filter(this.sift({
          _id: this.originComponent._id
        }))[0];

        let workAskModule = this.technicalComponentDirectory[this.originComponent.module]
        // console.log('workCallModule',workCallModule);
        if (workAskModule.workAsk != undefined) {
          await workAskModule.workAsk(this.originComponent);
        }

        // console.log(' ---------- Resolve Workflow -----------', this.workflow.name, this.originComponent._id)
        this.pathResolution = this.buildPathResolution(
          workflow,
          this.originComponent,
          this.requestDirection,
          0,
          this.componentsResolving,
          undefined,
          this.originQueryParams == undefined ? undefined : {
            origin: this.originComponent._id,
            queryParams: this.originQueryParams
          },
          undefined
        )

        if (this.config.quietLog != true) {
          console.log(' ---------- BuildPath Links-----------', this.fackCounter, this.workflow.name)
          console.log(this.pathResolution.links.map(link => {
            // return (link.source);
            return (link.source.component._id + ' -> ' + link.target.component._id)
          }))
          // console.log(' ---------- BuildPath Nodes-----------', this.fackCounter)
          // console.log(this.pathResolution.nodes.map(node => {
          //   //return (node.component._id + ':' + JSON.stringify(node.queryParams))
          //   return (node.component._id);
          // }))
        }

        this.owner = user
        let process = await (this.workspace_lib.createProcess({
          workflowId: this.originComponent.workspaceId,
          ownerId: this.owner._id,
          callerId: this.callerId,
          originComponentId: this.originComponent._id,
          steps: this.pathResolution.nodes.map(node => ({
            componentId: node.component._id
          }))
        }));
        this.processId = process._id
        this.processNotifier = new ProcessNotifier(this.amqpClient, this.originComponent.workspaceId)
        this.processNotifier.start({
          _id: this.processId,
          callerId: this.callerId,
          timeStamp: process.timeStamp,
          steps: this.pathResolution.nodes.map(node => ({
            componentId: node.component._id,
            status: node.status
          }))
        })

        this.pathResolution.links.forEach(link => {
          link.status = 'waiting'
        })
        this.RequestOrigineResolveMethode = resolve
        this.RequestOrigineRejectMethode = reject

        /// -------------- push case  -----------------------
        if (this.requestDirection == 'push') {
          let originNode = this.pathResolution.nodes.filter(this.sift({
            'component._id': this.originComponent._id
          }))[0];
          originNode.dataResolution = {
            data: this.pushData
          }
          originNode.status = 'resolved'
          this.historicEndAndCredit(originNode, new Date(), undefined, this.owner)

          resolve(this.pushData)
        }

        this.processNextBuildPath();

      } catch (e) {
        // console.log('EOORORRRR', e);
        reject(e)
      }
    })
  }

  processNextBuildPath() {
    setTimeout(this.processNextBuildPathDelayed.bind(this), 100)
  }

  processNextBuildPathDelayed(owner) {
    // console.log('privateScript',this.config.privateScript);
    this.workspace_lib.getCurrentProcess(this.processId).then((process) => {
      // console.log(' <---- current process state -----> ', process.state)
      if (process.state == 'stop') {
        this.processNotifier.information({
          _id: this.processId,
          information: 'Votre flow a été aretté avec succéss'
        })
        this.workflow.status = 'stoped';
        this.workspace_lib.updateSimple(this.workflow)
      } else {
        if (this.owner.credit >= 0 || (this.config.privateScript && this.config.privateScript.length == 0) || this.config.free == true) {

          this.fackCounter++
          if (this.config.quietLog != true) {
            console.log(' ---------- processNextBuildPath -----------', this.fackCounter)
            console.log(this.pathResolution.nodes.map(node => {
              return (node.component._id + ' : ' + node.status + ' ' + node.component.name)
            }))
          }
          let processingNode
          let nodeWithoutIncoming = this.pathResolution.nodes.filter(this.sift({
            $and: [{
                sources: {
                  $size: 0
                }
              },
              {
                status: 'waiting'
              }
            ]
          }));


          if (nodeWithoutIncoming.length > 0) {
            // console.log('source component', nodeWithoutIncoming[0]);
            processingNode = nodeWithoutIncoming[0]
          } else {

            let nodeWithAllIncomingResolved = this.pathResolution.nodes.filter(this.sift({
              status: 'waiting'
            }));

            nodeWithAllIncomingResolved.every(n => {
              let nbSourcesResolved = n.sources.filter(this.sift({
                'source.status': 'resolved'
              })).length;

              // console.log('source resolved size', nbSourcesResolved, n.sources.length);
              if (n.sources.length == nbSourcesResolved) {
                processingNode = n
                return false
              } else {
                return true
              }
            })
          }
          // console.log('processingNode', processingNode);
          if (processingNode != undefined) {
            let startTime = new Date()
            // processingLink.status = 'processing';
            let nodesProcessingInputs = this.pathResolution.nodes.filter(this.sift({
              'targets.target.component._id': processingNode.component._id
            }));

            let module = this.technicalComponentDirectory[processingNode.component.module]
            let dataFlow
            let primaryflow
            let secondaryFlow
            if (nodesProcessingInputs.length > 0) {
              // console.log('ALLO');
              dataFlow = nodesProcessingInputs.map(sourceNode => {
                let d = sourceNode.dataResolution
                d.componentId = sourceNode.component._id
                return d
              })
              //important to not produce side effect
              dataFlow = clone(dataFlow);
              if (module.getPrimaryFlow != undefined) {
                primaryflow = module.getPrimaryFlow(
                  processingNode.component,
                  dataFlow
                )
              } else {
                primaryflow = dataFlow[0]
              }

              secondaryFlow = []
              secondaryFlow = secondaryFlow.concat(dataFlow)
              secondaryFlow.splice(secondaryFlow.indexOf(primaryflow), 1)
            }

            // console.log("primaryflow", primaryflow);
            if (dataFlow != undefined && primaryflow == undefined) {
              let err = new Error('primary flow could not be identified')
              processingNode.status = 'error'
              processingNode.dataResolution = {
                error: err
              }
              this.historicEndAndCredit(processingNode, startTime, err, owner)
              this.processNextBuildPath('flow ko')
            } else {
              if (dataFlow != undefined && primaryflow.dfob != undefined) {
                try {
                  // console.log("DFOB", primaryflow.dfob);
                  let dfobPathNormalized = this.stringReplacer.execute(primaryflow.dfob[0].path, processingNode.queryParams == undefined ? undefined : processingNode.queryParams.queryParams, primaryflow.data);
                  // console.log('dfobPathNormalized',dfobPathNormalized);
                  var dfobTab = dfobPathNormalized.length > 0 ? dfobPathNormalized.split('.') : []
                  // console.log('dfob',dfobTab,primaryflow.dfob[0].keepArray);
                  var dfobFinalFlow = this.buildDfobFlow(
                    primaryflow.data,
                    dfobTab,
                    undefined,
                    primaryflow.dfob[0].keepArray
                  )


                  if (this.config.quietLog != true) {
                    // console.log('dfobFinalFlow | ', dfobFinalFlow);
                  }

                  if (dfobFinalFlow.length == 0) {
                    processingNode.dataResolution = {
                      data: primaryflow.data
                    }
                    processingNode.status = 'resolved'
                    this.historicEndAndCredit(processingNode, startTime, undefined)
                    if (
                      processingNode.component._id == this.originComponent._id
                    ) {
                      this.RequestOrigineResolveMethode(
                        processingNode.dataResolution
                      )
                    }
                    this.processNextBuildPath('dfob empty')
                  } else {
                    let paramArray = dfobFinalFlow.map(finalItem => {
                      var recomposedFlow = []
                      // console.log(finalItem.objectToProcess,finalItem.key);
                      recomposedFlow = recomposedFlow.concat([{
                        data: finalItem.objectToProcess[finalItem.key],
                        componentId: primaryflow.componentId
                      }])
                      recomposedFlow = recomposedFlow.concat(secondaryFlow)
                      // console.log('recomposedFlow',recomposedFlow);
                      return [
                        processingNode.component,
                        recomposedFlow,
                        processingNode.queryParams == undefined ? undefined : processingNode.queryParams.queryParams
                      ]
                    })

                    // console.log('paramArray',JSON.stringify(paramArray));

                    this.promiseOrchestrator.execute(module, module.pull, paramArray, {
                      beamNb: primaryflow.dfob[0].pipeNb
                    }, this.config).then((componentFlowDfob) => {
                      // console.log('componentFlowDfob', JSON.stringify(componentFlowDfob));
                      // console.log('dfobFinalFlow', dfobFinalFlow);
                      for (var componentFlowDfobKey in componentFlowDfob) {
                        // console.log(componentFlowDfobKey);
                        if (componentFlowDfob[componentFlowDfobKey].data != undefined) {
                          dfobFinalFlow[componentFlowDfobKey].objectToProcess[dfobFinalFlow[componentFlowDfobKey].key] =
                            componentFlowDfob[componentFlowDfobKey].data
                        } else if (componentFlowDfob[componentFlowDfobKey].error != undefined) {
                          dfobFinalFlow[componentFlowDfobKey].objectToProcess[dfobFinalFlow[componentFlowDfobKey].key] =
                            componentFlowDfob[componentFlowDfobKey]
                        }

                      }
                      // console.log('dfobFinalFlow',dfobFinalFlow);
                      processingNode.dataResolution = {
                        // componentId: processingNode.component._id,
                        // data: dfobFinalFlow.map(FF=>FF.objectToProcess),
                        data: primaryflow.data
                      }
                      // console.log('primaryflow ', primaryflow);
                      processingNode.status = 'resolved'
                      this.historicEndAndCredit(processingNode, startTime, undefined)
                      if (
                        processingNode.component._id == this.originComponent._id
                      ) {
                        this.RequestOrigineResolveMethode(
                          processingNode.dataResolution
                        )
                      }

                      this.processNextBuildPath('dfob ok')
                    }).catch(e => {
                      console.error('REJECT dfob', e)
                      processingNode.dataResolution = {
                        error: e
                      }
                      this.historicEndAndCredit(processingNode, startTime, e)
                      processingNode.status = 'error'
                      this.processNextBuildPath('dfob reject')
                    })
                  }
                } catch (e) {
                  console.error('CATCH dfob', e)
                  processingNode.dataResolution = {
                    error: e
                  }
                  this.historicEndAndCredit(processingNode, startTime, e)
                  processingNode.status = 'error'
                  this.processNextBuildPath('dfob catch')
                }
              } else {
                try {
                  module.pull(processingNode.component, dataFlow, processingNode.queryParams == undefined ? undefined : processingNode.queryParams.queryParams).then(componentFlow => {
                    // console.log('commponentFlow',componentFlow);
                    processingNode.dataResolution = componentFlow
                    processingNode.status = 'resolved'
                    this.historicEndAndCredit(processingNode, startTime, undefined)
                    if (processingNode.component._id == this.originComponent._id) {
                      this.originComponentResult = processingNode.dataResolution;
                    }
                    // console.log(this.processNextBuildPath);
                    this.processNextBuildPath('normal ok')
                  }).catch(e => {
                    console.error('REJECT normal', processingNode.component._id, e)
                    processingNode.dataResolution = {
                      error: e
                    }
                    processingNode.status = 'error'
                    // console.log('HIST')
                    this.historicEndAndCredit(processingNode, startTime, e)
                    // console.log('NEXT');
                    this.processNextBuildPath('normal reject')
                  })
                } catch (e) {
                  console.error('CATCH normal', e)
                  processingNode.dataResolution = {
                    error: e
                  }
                  this.historicEndAndCredit(processingNode, startTime, e)
                  processingNode.status = 'error'
                  this.processNextBuildPath('normal catch')
                }
              }
            }
          } else {
            // console.log('END');

            let nodeOnError = this.pathResolution.nodes.filter(this.sift({
              status: 'error'
            }));

            if (nodeOnError.length > 0) {
              this.processNotifier.error({
                _id: this.processId
              })
              this.workflow.status = 'error';
              this.workspace_lib.updateSimple(this.workflow)
              let errors = []
              this.pathResolution.nodes.forEach(n => {
                if (n.dataResolution != undefined && n.dataResolution.error != undefined) {
                  errors.push(n.dataResolution.error)
                }
              })
              this.RequestOrigineRejectMethode(errors)
            } else {
              this.processNotifier.end({
                _id: this.processId
              });
              this.workflow.status = 'resolved';
              this.workspace_lib.updateSimple(this.workflow)
              this.RequestOrigineResolveMethode(this.originComponentResult);
            }
            this.workspace_lib.cleanOldProcess(this.workflow).then(processes => {
              // console.log(processes);
              this.processNotifier.processCleaned({
                cleanedProcesses: processes,
                workspaceId: this.workflow._id
              })
              console.log('--------------  End of Worksapce processing --------------', this.workflow.name,this.owner.credit)
              return this.user_lib.update(this.owner)
            })
          }
        } else {
          const fullError = new Error("Vous n'avez pas assez de credit");
          this.processNotifier.error({
            _id: this.processId,
            error: fullError.message
          })
          this.workflow.status = 'error';
          this.workspace_lib.updateSimple(this.workflow)
          this.RequestOrigineRejectMethode(fullError)
        }
      }
    })
  }

  historicEndAndCredit(processingNode, startTime, error) {
    // console.log('processingNode.dataResolution',processingNode.dataResolution);
    let dataFlow = processingNode.dataResolution
    let module = processingNode.component.module
    let specificData = processingNode.component.specificData
    let historic_object = {}
    let current_component = this.config.components_information[module]
    let current_component_price
    let roundDate = new Date()
    roundDate.setMinutes(0)
    roundDate.setSeconds(0)
    roundDate.setMilliseconds(0)
    roundDate.setHours(0)

    if (module.getPriceState != undefined) {
      current_component_price = module.getPriceState(specificData, current_component.price, current_component.record_price)
    } else {
      current_component_price = {
        moPrice: current_component.price,
        recordPrice: current_component.record_price
      }
    }

    historic_object.recordCount = dataFlow == undefined || dataFlow.data == undefined ? 0 : dataFlow.data.length || 1
    historic_object.recordPrice = current_component_price.record_price || 0
    historic_object.moCount = dataFlow == undefined || dataFlow.data == undefined ? 0 : this.objectSizeOf(dataFlow) / 1000000
    historic_object.componentPrice = current_component_price.moPrice
    historic_object.userId = this.owner._id
    historic_object.totalPrice =
      (historic_object.recordCount * historic_object.recordPrice) +
      (historic_object.moCount * historic_object.componentPrice)
    historic_object.componentModule = module
    // TODO pas besoin de stoquer le name du component, on a l'id. ok si grosse perte de perf pour histogramme
    historic_object.componentName = processingNode.component.name
    historic_object.componentId = processingNode.component._id
    historic_object.persistProcess = processingNode.component.persistProcess
    historic_object.processId = this.processId
    // historic_object.data = dataFlow.data;
    historic_object.error = error
    historic_object.startTime = startTime
    historic_object.roundDate = roundDate
    historic_object.workflowId = this.originComponent.workspaceId
    let persistFlow
    // if (processingNode.component.persistProcess == true && dataFlow.data != undefined) {
    //   persistFlow = JSON.parse(JSON.stringify(dataFlow.data))
    // }

    this.workspace_lib.createHistoriqueEnd(historic_object).then(historiqueEnd => {
      this.processNotifier.progress({
        componentId: historiqueEnd.componentId,
        processId: historiqueEnd.processId,
        error: historiqueEnd.error
      })
      if (processingNode.component.persistProcess == true) {
        // console.log('addDataHistoriqueEnd',dataFlow.data);
        this.workspace_lib.addDataHistoriqueEnd(historiqueEnd._id, error == undefined ? dataFlow.data : error).then(frag => {
          this.processNotifier.persist({
            componentId: historiqueEnd.componentId,
            processId: historiqueEnd.processId,
            data: frag.data
          })
        }).catch(e => {
          this.processNotifier.persist({
            componentId: historiqueEnd.componentId,
            processId: historiqueEnd.processId,
            error: 'error persisting historic data'
          })
        })
      }
    }).catch(e => {
      this.processNotifier.progress({
        componentId: processingNode.component._id,
        processId: this.processId,
        error: 'error writing historic'
      })
    })
    // console.log("--------------  End of component processing --------------",  this.owner.credit);
    this.owner.credit -= historic_object.totalPrice
  }

  buildDfobFlowArray(currentFlow, dfobPathTab, key, keepArray) {
    if (Array.isArray(currentFlow)) {
      let flatOut = []
      currentFlow.forEach((f, i) => {
        flatOut = flatOut.concat(this.buildDfobFlowArray(f, dfobPathTab, key, keepArray))
      })
      return flatOut
    } else {
      return (this.buildDfobFlow(currentFlow, dfobPathTab, key, keepArray))
    }
  }

  buildDfobFlow(currentFlow, dfobPathTab, key, keepArray) {
    if (dfobPathTab.length > 0) {
      if (Array.isArray(currentFlow)) {
        let currentdFob = dfobPathTab[0]
        let flatOut = []
        currentFlow.forEach((f, i) => {
          flatOut = flatOut.concat(this.buildDfobFlowArray(f, dfobPathTab, currentdFob, keepArray))
        })
        return flatOut
      } else {
        let newDfobPathTab = JSON.parse(JSON.stringify(dfobPathTab))
        let currentdFob = newDfobPathTab.shift()
        let flowOfKey = currentFlow[currentdFob]

        // TODO complex algorythm, To improve
        if (newDfobPathTab.length > 0) {
          return (this.buildDfobFlow(flowOfKey, newDfobPathTab, currentdFob, keepArray))
        } else {
          if (Array.isArray(flowOfKey) && keepArray != true) {
            return (this.buildDfobFlow(flowOfKey, newDfobPathTab, currentdFob, keepArray))
          } else {
            return (this.buildDfobFlow(currentFlow, newDfobPathTab, currentdFob, keepArray))
          }
        }
      }
    } else {
      let out
      if (Array.isArray(currentFlow) && keepArray != true) {
        out = currentFlow.map((r, i) => {
          return {
            objectToProcess: currentFlow,
            key: i
          }
        })
      } else {
        out = [{
          objectToProcess: currentFlow,
          key: key
        }]
      }
      return out
    }
  }

  buildPathResolution(workspace, component, requestDirection, depth, usableComponents, buildPath, queryParams, buildPathCauseLink) {
    if (depth < 100) {
      if (buildPath == undefined) {
        buildPath = {}
        buildPath.links = []
        buildPath.nodes = []
      }

      let module = this.technicalComponentDirectory[component.module]

      if (module.buildQueryParam != undefined) {
        queryParams = {
          origin: component._id,
          queryParams: module.buildQueryParam(queryParams.queryParams, component.specificData)
        }
      }

      let existingNodesFilter = {
        'component._id': component._id
      }

      if (queryParams != undefined) {
        existingNodesFilter['queryParams.origin'] = queryParams.origin
      } else {
        existingNodesFilter['queryParams'] = {
          $eq: undefined
        }
      }

      let existingNodes = buildPath.nodes.filter(this.sift(existingNodesFilter));

      let buildPathNode
      if (existingNodes.length == 0) {
        buildPathNode = {
          component: component,
          queryParams: queryParams,
          status: 'waiting',
          targets: [],
          sources: []
        }
        buildPath.nodes.push(buildPathNode)
      } else {
        buildPathNode = existingNodes[0]
      }

      if (buildPathCauseLink != undefined) {
        if (requestDirection == 'pull') {
          buildPathNode.targets.push(buildPathCauseLink)
          buildPathCauseLink.source = buildPathNode
        } else if (requestDirection == 'push') {
          buildPathNode.sources.push(buildPathCauseLink)
          buildPathCauseLink.target = buildPathNode
        }
      }

      let connectionsBefore = workspace.links.filter(this.sift({
        target: component._id
      }));

      let connectionsAfter = workspace.links.filter(this.sift({
        source: component._id
      }));

      if (requestDirection != 'push') {
        if (
          connectionsBefore.length > 0 &&
          !(requestDirection == 'pull' && module.stepNode == true)
        ) {
          for (var beforelink of connectionsBefore) {
            // console.log(beforeComponent);
            var beforeComponentObject = usableComponents.filter(this.sift({
              _id: beforelink.source
            }))[0];

            if (beforeComponentObject) {
              let existingLinkFilter = {
                'linkId': beforelink._id
              }
              if (queryParams != undefined) {
                existingLinkFilter['queryParams.origin'] = queryParams.origin
              } else {
                existingLinkFilter['queryParams'] = {
                  $eq: undefined
                }
              }

              var existingLink = buildPath.links.filter(this.sift(existingLinkFilter));
              if (existingLink.length == 0) {
                var linkToProcess = {
                  // sourceComponentId: beforeComponentObject._id,
                  target: buildPathNode,
                  requestDirection: 'pull',
                  queryParams: queryParams,
                  linkId: beforelink._id
                }
                // linkToProcess.status='waiting';
                buildPath.links.push(linkToProcess)
                buildPathNode.sources.push(linkToProcess)
                // console.log(linkToProcess);
                // buildPath.push(out);
                this.buildPathResolution(
                  workspace,
                  beforeComponentObject,
                  'pull',
                  depth + 1,
                  usableComponents,
                  buildPath,
                  queryParams,
                  linkToProcess
                )
              }
            }
          }
        }
      }
      if (requestDirection != 'pull') {
        if (
          connectionsAfter.length > 0 &&
          !(requestDirection == 'push' && module.stepNode == true)
        ) {
          for (var afterlink of connectionsAfter) {
            // console.log(beforeComponent);
            var afterComponentObject = usableComponents.filter(this.sift({
              _id: afterlink.target
            }))[0];

            // console.log("beforeComponentObject",beforeComponentObject);
            // protection against dead link
            if (afterComponentObject) {
              let existingLinkFilter = {
                'linkId': afterlink._id
              }
              if (queryParams != undefined) {
                existingLinkFilter['queryParams.origin'] = queryParams.origin
              } else {
                existingLinkFilter['queryParams'] = {
                  $eq: undefined
                }
              }
              var existingLink = buildPath.links.filter(this.sift(existingLinkFilter));

              if (existingLink.length == 0) {
                var linkToProcess = {
                  // sourceComponentId: beforeComponentObject._id,
                  source: buildPathNode,
                  requestDirection: 'push',
                  queryParams: queryParams,
                  linkId: afterlink._id
                }
                // linkToProcess.status='waiting';
                buildPath.links.push(linkToProcess)
                buildPathNode.targets.push(linkToProcess)
                // console.log(linkToProcess);
                // buildPath.push(out);
                this.buildPathResolution(
                  workspace,
                  afterComponentObject,
                  'push',
                  depth + 1,
                  usableComponents,
                  buildPath,
                  queryParams,
                  linkToProcess
                )
              }
            }
          }
        }
      }

      return buildPath
    }
  }
}

module.exports = {
  execute: function(component, requestDirection, stompClient, callerId, pushData, queryParams) {
    let engine = new Engine(component, requestDirection, stompClient, callerId, pushData, queryParams);
    return engine.resolveComponent()
  }
}
