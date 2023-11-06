'use strict'

const ProcessNotifier = require('./ProcessNotifier')
const clone = require('clone');

class Engine {
  // requestDirection & pushData lagacy/obsolete
  constructor(component, requestDirection, amqpClient, callerId, pushData, queryParams,tracerId) {
    this.technicalComponentDirectory = require('./technicalComponentDirectory.js');
    this.sift = require('sift').default;
    this.objectSizeOf = require('object-sizeof');
    this.workspace_component_lib = require('../../core/lib/workspace_component_lib');
    this.fragment_lib = require('../../core/lib/fragment_lib');
    this.workspace_lib = require('../../core/lib/workspace_lib');
    this.user_lib = require('../../core/lib/user_lib');
    this.config = require('../configuration.js');
    let PromiseOrchestrator = require('../../core/helpers/promiseOrchestrator.js');
    this.stringReplacer = require('../utils/stringReplacer.js')
    this.promiseOrchestrator = new PromiseOrchestrator();
    this.fackCounter = 0;
    this.amqpClient = amqpClient;
    this.callerId = callerId;
    this.tracerId = tracerId;
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
        // console.log('workflow.users',workflow.users);
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
        resolve({processId:process._id});
        this.processId = process._id
        this.processNotifier = new ProcessNotifier(this.amqpClient, this.originComponent.workspaceId)
        // console.log('___________this.tracerId',this.tracerId)
        this.processNotifier.start({
          _id: this.processId,
          callerId: this.callerId,
          tracerId: this.tracerId,
          timeStamp: process.timeStamp,
          steps: this.pathResolution.nodes.map(node => ({
            componentId: node.component._id,
            status: node.status
          }))
        })

        this.pathResolution.links.forEach(link => {
          link.status = 'waiting'
        })
        // this.RequestOrigineResolveMethode = resolve
        // this.RequestOrigineRejectMethode = reject

        if (this.originComponent.specificData.responseComponentId != undefined && this.originComponent.specificData.responseComponentId != 'undefined') {
          this.responseComponentId = this.originComponent.specificData.responseComponentId
        } else {
          this.responseComponentId = this.originComponent._id;
        }

        if (this.responseComponentId != undefined && this.responseComponentId != 'undefined') {

          /// -------------- push case  -----------------------
          /// used before by upload and http provider component : now use pullParams/queryParams in those cases
          // if (this.requestDirection == 'push') {
          //   let originNode = this.pathResolution.nodes.filter(this.sift({
          //     'component._id': this.originComponent._id
          //   }))[0];
          //   originNode.dataResolution = {
          //     data: this.pushData
          //   }
          //   originNode.status = 'resolved'
          //   this.historicEndAndCredit(originNode, new Date(), undefined, this.owner)
          //   // console.log(originNode.component._id,this.responseComponentId);
          //   if (originNode.component._id == this.responseComponentId) {
          //     resolve(this.pushData)
          //     // this.originComponentResult = processingNode.dataResolution;
          //   }
          //   // resolve(this.pushData)
          // }


          this.processNextBuildPath();
        } else {
          reject(new Error('responseComponentId undefined'))
        }


      } catch (e) {
        // console.log('EOORORRRR', e);
        reject(e)
      }
    })
  }

  processNextBuildPath() {
    // console.trace();
    setTimeout(this.processNextBuildPathDelayed.bind(this), 100)
  }

  async processNextBuildPathDelayed(owner) {
    // console.log('privateScript',this.config.privateScript);
    try {
      let process =  await this.workspace_lib.getCurrentProcess(this.processId);
      if (process.state == 'stop') {
        this.processNotifier.information({
          _id: this.processId,
          tracerId: this.tracerId,
          information: 'Votre flow a été aretté avec succéss'
        })
        //status of workflow ever stoped by update process webservice
        // this.workflow.status = 'stoped';
        // this.workspace_lib.updateSimple(this.workflow)
      } else {
        if (this.owner.credit >= 0 || (this.config.privateScript && this.config.privateScript.length == 0) || this.config.free == true) {

          this.fackCounter++
          console.log(`---------- processNextBuildPath ----------- ${this.workflow.name} ${this.fackCounter}/${this.pathResolution.nodes.length}`)
          if (this.config.quietLog != true) {
            // console.log(this.pathResolution.nodes.map(node => {
            //   return (node.component._id + ' : ' + node.status + ' ' + node.component.name)
            // }))
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
            if (this.config.quietLog != true) {
              console.log(`           processingNode ----------- ${processingNode.component._id} type:'${processingNode.component.type}' name:'${processingNode.component.name}'`)
            }
            let startTime = new Date()
            // console.log('processingNode',processingNode);

            let nodesProcessingInputs = this.pathResolution.nodes.filter(npi =>
              npi.targets.map(t =>
                t.target.component._id
              ).includes(processingNode.component._id)
            );

            let module = this.technicalComponentDirectory[processingNode.component.module]

            let dataFlow
            let primaryflow
            let secondaryFlow
            let componentFlow={}
            if (nodesProcessingInputs.length > 0) {

              let persistedDataFlow = [];
              for (const sourceNode of nodesProcessingInputs) {
                // console.log('sourceNode',sourceNode);
                let persistedData;
                let persistedFragmentData;
                if (processingNode.component.module != 'deeperFocusOpeningBracket') {
                  let sourceComponentId;
                  // console.log('sourceNode.dataResolution',sourceNode.dataResolution);
                  if (sourceNode.dataResolution && sourceNode.dataResolution.dfobSourceComponentId) {
                    // console.log('sourceNode.dataResolution.dfobSourceComponentId',sourceNode.dataResolution.dfobSourceComponentId);
                    sourceComponentId = sourceNode.dataResolution.dfobSourceComponentId;
                  } else {
                    sourceComponentId = sourceNode.component._id
                  }

                  // get_component_result is get HistoricEnd
                  const persistedDataFlowCoponent = await this.workspace_component_lib.get_component_result(sourceComponentId, this.processId);
                  // console.log('persistedDataFlowCoponent.frag',persistedDataFlowCoponent,sourceNode);
                  const fragAvailable = persistedDataFlowCoponent.frag && persistedDataFlowCoponent.frag != null;

                  if (fragAvailable) {
                    persistedFragmentData = persistedDataFlowCoponent.frag;
                  }

                }
                const previousDfob = sourceNode.dataResolution ? sourceNode.dataResolution.dfob : undefined;
                persistedDataFlow.push({
                  // data: persistedData ? persistedData : undefined,
                  fragment : persistedFragmentData,
                  componentId: sourceNode.component._id,
                  dfob: previousDfob,
                })
              }
              
              componentFlow={
                dataFlow : persistedDataFlow,
                deeperFocusData : processingNode.component.deeperFocusData
              }

              if(componentFlow.dataFlow.length==1 && !componentFlow.deeperFocusData){
                componentFlow.deeperFocusData=componentFlow.dataFlow[0].dfob;
              }

              if(componentFlow?.deeperFocusData?.activateDf==undefined||componentFlow?.deeperFocusData?.activateDf==false){
                componentFlow.deeperFocusData={
                  dfobPath:'',
                  keepArray:true
                };
              }
              
              // properties harmonisation
              componentFlow.deeperFocusData={
                keepArray : componentFlow.deeperFocusData.keepArray|| componentFlow.deeperFocusData.dfobKeepArray,
                dfobPath : componentFlow.deeperFocusData.dfobPath,
                pipeNb : componentFlow.deeperFocusData.beanNb||  componentFlow.deeperFocusData.pipeNb||  componentFlow.deeperFocusData.dfobNbPipe 
              }

              if (module.getPrimaryFlow != undefined) {
                componentFlow.primaryflow = await module.getPrimaryFlow(
                  processingNode.component,
                  componentFlow.dataFlow
                )
              } else {
                componentFlow.primaryflow = componentFlow.dataFlow[0]
              }
              // console.log('componentFlow.primaryflow',componentFlow.primaryflow);

              secondaryFlow = []
              if (module.getSecondaryFlow != undefined) {
                componentFlow.secondaryFlow = await module.getSecondaryFlow(
                  processingNode.component,
                  componentFlow.dataFlow
                )
              } else {
                // console.log('COMPUTE secandary Flow',componentFlow.dataFlow)
                componentFlow.secondaryFlow = secondaryFlow.concat(componentFlow.dataFlow)
                componentFlow.secondaryFlow.splice(componentFlow.secondaryFlow.indexOf(componentFlow.primaryflow), 1)
              }
            }

            // console.log("componentFlow", componentFlow);
            if (componentFlow.dataFlow!=undefined && componentFlow.primaryflow == undefined) {
              let err = new Error('primary flow could not be identified')
              processingNode.status = 'error'
              processingNode.dataResolution = {
                error: err
              }
              await this.historicEndAndCredit(processingNode, startTime, undefined, err)
              this.processNextBuildPath('flow ko')
            } else {
              // console.log('primaryflow',primaryflow);
              if ( componentFlow.deeperFocusData) {
                try {

                  let {dfobPath,keepArray, pipeNb}=componentFlow.deeperFocusData;

                  if(dfobPath == undefined){
                    dfobPath = '';
                  }

                  let dfobPathNormalized = this.stringReplacer.execute(dfobPath, processingNode.queryParams?.queryParams, componentFlow.primaryflow?.data);
                  var dfobTab = dfobPathNormalized.length > 0 ? dfobPathNormalized.split('.') : []

                  let dfobFragmentFlow = await this.buildDfobFragmentFlow(
                    componentFlow.primaryflow.fragment,
                    dfobTab,
                    keepArray
                  )
                
                  const newFrag = dfobFragmentFlow.newFrag;
                  let dfobFragmentSelected = dfobFragmentFlow.dfobFragmentSelected;


                  
                  dfobFragmentSelected = Array.isArray(dfobFragmentSelected)?dfobFragmentSelected:[dfobFragmentSelected]

                  // console.log('________________ dfobFragmentSelected',dfobFragmentSelected);
                  // console.log('________________ dfobFragmentSelected data',dfobFragmentSelected.map(f=>f.frag.data));

                  if (this.config.quietLog != true) {
                    // console.log('dfobFragmentSelected ', dfobFragmentSelected)
                  }

                  if (dfobFragmentSelected.length == 0) {
                    processingNode.dataResolution = {
                      // data: primaryflow.data
                    }
                    processingNode.status = 'resolved'
                    // if (
                    //   processingNode.component._id == this.responseComponentId
                    // ) {
                    //   console.time("getWithResolutionByBranch for RequestOrigineResolveMethode");
                    //   this.RequestOrigineResolveMethode({
                    //     data: this.fragment_lib.getWithResolutionByBranch(newFrag)
                    //   })
                    //   console.timeEnd("getWithResolutionByBranch for RequestOrigineResolveMethode");
                    // }
                    await this.historicEndAndCredit(processingNode, startTime, componentFlow.primaryflow.data, undefined)
                    this.processNextBuildPath('dfob empty')
                  } else {

                    if (this.config.quietLog != true) console.time("secondary_getWithResolutionByBranch");
                    const secondaryFlowDefraged=[];
                    for (let sf of componentFlow.secondaryFlow){
                      secondaryFlowDefraged.push({
                        data : await this.fragment_lib.getWithResolutionByBranch(sf.fragment),
                        componentId : sf.componentId
                      })
                    }
                    if (this.config.quietLog != true) console.timeEnd("secondary_getWithResolutionByBranch");

                    try {
                      let paramArray = dfobFragmentSelected.map(item => {
                        // console.log('item',item)
                        return [
                          processingNode,
                          item.frag,
                          {dfobTable:item.relativHistoryTableSelected||[],pipeNb, keepArray},
                          componentFlow.primaryflow,
                          secondaryFlowDefraged
                        ]
                      })

                      try {
                        await this.promiseOrchestrator.execute(this, this.rebuildFrag_focus_work_persist, paramArray, {
                          pipeNb,
                          logIteration: true,
                          continueChekFunction: async () => {
                            // console.log('check',this.processId);
                            const process = await this.workspace_lib.getCurrentProcess(this.processId);
                            if (process.state == 'stop') {
                              return false
                            } else {
                              return true
                            }
                          }
                        },this.config);
                      } catch (error) {
                        console.error(error);
                      }
                      // console.log('rebuildFrag_focus_work_persist done')
    

                      processingNode.status = 'resolved'
                      // console.log('call historicEndAndCredit', newFrag)
                      await this.historicEndAndCredit(processingNode, startTime, newFrag, undefined)
                      // console.log('done historicEndAndCredit')
                      this.processNextBuildPath('flow ok')
                    } catch (error) {
                      console.error('REJECT dfob', error)
                      // legacy/obsolote  TODO remove
                      processingNode.dataResolution = {
                        // error: e
                      }
                      await this.historicEndAndCredit(processingNode, startTime, undefined, error)
                      processingNode.status = 'error'
                      this.processNextBuildPath('dfob reject')
                    }

                  }
                } catch (e) {
                  console.error('CATCH dfob', e)
                  processingNode.dataResolution = {
                    // error: e
                  }
                  await this.historicEndAndCredit(processingNode, startTime, undefined, e)
                  processingNode.status = 'error'
                  this.processNextBuildPath('dfob catch')
                }
                // console.log('DFOB END',processingNode.status );
              } else {
                // ONLY when no InputsNodes because componentFlow.deeperFocusData are always set in other case
                try {
                  // console.log("in dataFlow",dataFlow);
                  const componentFlow= await  module.pull(processingNode.component, dataFlow, processingNode.queryParams == undefined ? undefined : processingNode.queryParams.queryParams);


                  const {
                    data,
                    ...dataResolution
                  } = componentFlow;
                  processingNode.dataResolution = dataResolution;
                  processingNode.status = 'resolved';
                  // console.log('processingNode.dataResolution',processingNode.dataResolution);

                  // console.log(processingNode.component._id,this.responseComponentId);
                  // if (processingNode.component._id == this.responseComponentId) {
                  //   this.RequestOrigineResolveMethode({
                  //     data: data
                  //   })
                  //   // this.originComponentResult = processingNode.dataResolution;
                  // }
                  const frag = await this.fragment_lib.persist(data)
                  // console.log('call historicEndAndCredit', frag)
                  await this.historicEndAndCredit(processingNode, startTime, frag, undefined)

                  this.processNextBuildPath('normal ok')

                } catch (e) {
                  console.error('CATCH normal', e, typeof e)
                  processingNode.dataResolution = {
                    // error: e
                  }
                  await this.historicEndAndCredit(processingNode, startTime, undefined, e)
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
                _id: this.processId,
                tracerId: this.tracerId,
              })
              this.workflow.status = 'error';
              this.workspace_lib.updateSimple(this.workflow)
              let errors = []
              this.pathResolution.nodes.forEach(n => {
                if (n.dataResolution != undefined && n.dataResolution.error != undefined) {
                  errors.push(n.dataResolution.error)
                }
              })
              // this.RequestOrigineRejectMethode(errors)
            } else {
              this.processNotifier.end({
                _id: this.processId,
                tracerId: this.tracerId,
              });
              this.workflow.status = 'resolved';
              this.workspace_lib.updateSimple(this.workflow)
              // this.RequestOrigineResolveMethode(this.originComponentResult);
            }
            // console.log(`--------- start clean ${this.workflow.name}`)
            await this.workspace_lib.markProcessAsResolved(process);
            const processes =  await this.workspace_lib.cleanOldProcessByWorkflow(this.workflow);
            console.log('--------------  End of Worksapce processing --------------', this.workflow.name, this.owner.credit)
 
            // console.log(processes);
            // console.log(`------- egine end clean ${this.workflow.name}`)
            this.processNotifier.processCleaned({
              cleanedProcesses: processes,
              tracerId: this.tracerId,
              workspaceId: this.workflow._id
            })
            this.user_lib.update(this.owner)
          }
        } else {
          const fullError = new Error("Vous n'avez pas assez de credit");
          this.processNotifier.error({
            _id: this.processId,
            tracerId: this.tracerId,
            error: fullError.message
          })
          this.workflow.status = 'error';
          this.workspace_lib.updateSimple(this.workflow)
          // this.RequestOrigineRejectMethode(fullError)
        }
      }
    } catch (error) {
      console.trace();
      throw (error)
    }

  }

  async historicEndAndCredit(processingNode, startTime, frag, error) {
    if (this.config.quietLog != true) console.time('historicEndAndCredit')
    let historic_object = {};
    try {
      // if (!frag){
      //   throw new Error('frag have to be set');
      // }
      historic_object.componentId = processingNode.component._id;
      historic_object.persistProcess = processingNode.component.persistProcess;
      historic_object.processId = this.processId;
      // console.log('historic_object',historic_object)
      historic_object = await this.workspace_lib.createOrUpdateHistoriqueEnd(historic_object)
      let module = processingNode.component.module;

      if(frag){
        try {
          if (module != 'deeperFocusOpeningBracket' && !error) {
              historic_object = await this.workspace_lib.addFragHistoriqueEnd(historic_object._id, frag);
          }
          this.processNotifier.persist({
            componentId: historic_object.componentId,
            processId: historic_object.processId,
            tracerId: this.tracerId,
            frag : frag._id
          })
        } catch (e) {
          console.log('ERROR', e);
          this.processNotifier.persist({
            componentId: historic_object.componentId,
            processId: historic_object.processId,
            tracerId: this.tracerId,
            error: 'error persisting historic data'
          })
          await this.workspace_lib.addDataHistoriqueEnd(historic_object._id, {
            error: 'error persisting historic data'
          });
          throw new Error('error persisting historic data');
        }  
      }



      let specificData = processingNode.component.specificData;
      // historic_object = {};
      let current_component = this.config.components_information[module];
      let current_component_price;
      let roundDate = new Date();
      roundDate.setMinutes(0);
      roundDate.setSeconds(0);
      roundDate.setMilliseconds(0);
      roundDate.setHours(0);

      if (module.getPriceState != undefined) {
        current_component_price = module.getPriceState(specificData, current_component.price, current_component.record_price)
      } else {
        current_component_price = {
          moPrice: current_component.price,
          recordPrice: current_component.record_price
        }
      }

      // historic_object.recordCount = processingNode.dataResolution == undefined || data == undefined ? 0 : data.length || 1;
      historic_object.recordPrice = current_component_price.record_price || 0;
      // historic_object.moCount = processingNode.dataResolution == undefined || data == undefined ? 0 : this.objectSizeOf(data) / 1000000;
      historic_object.componentPrice = current_component_price.moPrice;
      historic_object.userId = this.owner._id;
      // historic_object.totalPrice =
      //   (historic_object.recordCount * historic_object.recordPrice) +
      //   (historic_object.moCount * historic_object.componentPrice);
      historic_object.componentModule = module;
      // TODO pas besoin de stoquer le name du component, on a l'id. ok si grosse perte de perf pour histogramme
      historic_object.componentName = processingNode.component.name;
      // historic_object.data = dataFlow.data;
      historic_object.error = error;
      historic_object.startTime = startTime;
      historic_object.roundDate = roundDate;
      historic_object.workflowId = this.originComponent.workspaceId;

      // console.log('historic_object',historic_object);

      historic_object = await this.workspace_lib.createOrUpdateHistoriqueEnd(historic_object);
      this.processNotifier.progress({
        componentId: historic_object.componentId,
        tracerId: this.tracerId,
        processId: historic_object.processId,
        error: historic_object.error
      })

    } catch (e) {
      console.log('ERROR', e);
      this.processNotifier.progress({
        componentId: processingNode.component._id,
        processId: this.processId,
        tracerId: this.tracerId,
        error: 'error writing historic'
      })
    }
    if (this.config.quietLog != true)  console.timeEnd('historicEndAndCredit')
    // console.log("--------------  End of component processing --------------",  this.owner.credit);
    if (historic_object != undefined) {
      this.owner.credit -= historic_object.totalPrice
    }

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
    // console.log('dfobPathTab',dfobPathTab)
    if (dfobPathTab.length > 0) {
      if (Array.isArray(currentFlow)) {
        let currentdFob = dfobPathTab[0]
        let flatOut = []
        currentFlow.forEach((f, i) => {
          flatOut = flatOut.concat(this.buildDfobFlowArray(f, dfobPathTab, currentdFob, keepArray))
        })
        return flatOut
      } else {
        // let newDfobPathTab = JSON.parse(JSON.stringify(dfobPathTab))
        let newDfobPathTab = [...dfobPathTab]
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

  async buildDfobFragmentFlow(fragment, dfobTable, keepArray) {
    if (this.config.quietLog != true)  console.time("buildDfobFragmentFlow");
    const out=  await this.fragment_lib.copyFragUntilPath(fragment, dfobTable,keepArray);
    if (this.config.quietLog != true)  console.timeEnd("buildDfobFragmentFlow");
    // throw new Error('tmp')
    return out;
  }

  async rebuildFrag_focus_work_persist(processingNode,fragment, dfob, primaryflow, secondaryFlow) {
    let module = this.technicalComponentDirectory[processingNode.component.module]
    const {dfobTable,pipeNb, keepArray}=dfob
    let rebuildData;
    // console.log('___________rebuildFrag_focus_work_persist',dfob,fragment)

    try {
      if (this.config.quietLog != true) console.time("primary_getWithResolutionByBranch");
      rebuildData = await this.fragment_lib.getWithResolutionByBranch(fragment._id);
      if (this.config.quietLog != true) console.timeEnd("primary_getWithResolutionByBranch");
      // console.log('_______rebuildData',rebuildData)

      // console.log('___fragment',fragment)
      const needDfob = dfobTable.length>0 || (Array.isArray(rebuildData)&&!keepArray&&!fragment.branchOriginFrag);
      if(needDfob){
        // console.log('WITH DFOB');
        if (this.config.quietLog != true) console.time("build-DfobFlow");
        const dfobFlow = this.buildDfobFlow(
          rebuildData,
          dfobTable,
          undefined,
          keepArray
        )
        // console.log('___________dfobFlow',JSON.stringify(dfobFlow))
        let paramArray = dfobFlow.map(item => {
          // console.log('__________ item :',item)
          var recomposedFlow = [];
          // console.log(finalItem.objectToProcess,finalItem.key);
    
          recomposedFlow = recomposedFlow.concat([{
            data: item.key != undefined ? item.objectToProcess[item.key] : item.objectToProcess,
            componentId: primaryflow.componentId
          }]);
          recomposedFlow = recomposedFlow.concat(secondaryFlow);
          // console.log('recomposedFlow',recomposedFlow);

          return [
            processingNode.component,
            recomposedFlow,
            processingNode.queryParams == undefined ? undefined : processingNode.queryParams.queryParams
          ]
        });
        if (this.config.quietLog != true) console.timeEnd("build-DfobFlow");

        // console.log('__________ paramArray :',paramArray[0][1])
        // console.log('__________module',module);
        if (this.config.quietLog != true) console.time("work");
        const componentFlowDfob = await this.promiseOrchestrator.execute(module, module.pull, paramArray, {
          pipeNb,
          logIteration: true,
          continueChekFunction: async () => {
            const process = await this.workspace_lib.getCurrentProcess(this.processId);
            if (process.state == 'stop') {
              return false
            } else {
              return true
            }
          }
        }, this.config);
        if (this.config.quietLog != true) console.timeEnd("work");
    
        // console.log('__________ componentFlowDfob :',componentFlowDfob)

        if (this.config.quietLog != true) console.time("recompose-DfobFlow");
        for (var componentFlowDfobKey in componentFlowDfob) {
          if (componentFlowDfob[componentFlowDfobKey].data != undefined) {
            if (dfobFlow[componentFlowDfobKey].key != undefined) {
              dfobFlow[componentFlowDfobKey].objectToProcess[dfobFlow[componentFlowDfobKey].key] =
                componentFlowDfob[componentFlowDfobKey].data
            } else {
              // all keys to replace because no key defined because root dfob
              for (let key of Object.keys(dfobFlow[componentFlowDfobKey].objectToProcess)) {
                dfobFlow[componentFlowDfobKey].objectToProcess[key] = undefined;
              }
              for (let key of Object.keys(componentFlowDfob[componentFlowDfobKey].data)) {
                dfobFlow[componentFlowDfobKey].objectToProcess[key] = componentFlowDfob[componentFlowDfobKey].data[key];
              }
              // dfobFinalFlow[componentFlowDfobKey].objectToProcess=componentFlowDfob[componentFlowDfobKey].data;
            }
          } else if (componentFlowDfob[componentFlowDfobKey].error != undefined) {
            dfobFlow[componentFlowDfobKey].objectToProcess[dfobFlow[componentFlowDfobKey].key] =
              componentFlowDfob[componentFlowDfobKey]
          }
        }
        if (this.config.quietLog != true) console.timeEnd("recompose-DfobFlow");
      } else {
        // console.log('WITHOUT DFOB');
        let workResult
        let recomposedFlow = [];
        // console.log(finalItem.objectToProcess,finalItem.key);
  
        recomposedFlow = recomposedFlow.concat([{
          data: rebuildData,
          componentId: primaryflow.componentId
        }]);
        recomposedFlow = recomposedFlow.concat(secondaryFlow);
        // console.log('recomposedFlow',recomposedFlow);
        // console.log('processingNode.component',processingNode.component);
        if (this.config.quietLog != true) console.time("work");
        workResult = await module.pull(processingNode.component, recomposedFlow, processingNode.queryParams == undefined ? undefined : processingNode.queryParams.queryParams)
        if (this.config.quietLog != true) console.timeEnd("work");
        // console.log('workResult',workResult);
        rebuildData=workResult.data;
      }
    } catch (error) {
      console.error(error);
      rebuildData={
        error : error.message
      };
    }

   
   
    // console.log('______ rebuildData', rebuildData);

    // console.log('_________fragment',fragment);
    let pesristedFragment
    try {
        // console.log('BEFORE persist',rebuildData,fragment)
        if (this.config.quietLog != true) console.time("persist");
        pesristedFragment = await this.fragment_lib.persist(rebuildData,undefined,fragment);
        if (this.config.quietLog != true) console.timeEnd("persist");
        // console.log('AFTER persist',JSON.stringify(pesristedFragment))
    } catch (error) {
      console.error("______persist ERROR",error);
    }
    // console.log('______ pesristedFragment',pesristedFragment);
    return pesristedFragment

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
          queryParams: module.buildQueryParam(queryParams?queryParams.queryParams:undefined, component.specificData)
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
  execute: function(component, requestDirection, stompClient, callerId, pushData, queryParams,tracerId) {
    // console.log('_____________tracerId',tracerId)
    let engine = new Engine(component, requestDirection, stompClient, callerId, pushData, queryParams,tracerId);
    return engine.resolveComponent()
  }
}
