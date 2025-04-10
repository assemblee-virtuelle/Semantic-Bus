'use strict'

const lo = require('dayjs/locale/lo.js');
const ProcessNotifier = require('./ProcessNotifier')
const clone = require('clone');
const DfobHelper = require('../../core/helpers/dfobHelper');
const technicalComponentDirectory = require('./technicalComponentDirectory.js');
const sift = require('sift').default;
const objectSizeOf = require('object-sizeof');
const workspace_component_lib = require('../../core/lib/workspace_component_lib');
const fragment_lib = require('../../core/lib/fragment_lib_scylla');
const workspace_lib = require('../../core/lib/workspace_lib');
const user_lib = require('../../core/lib/user_lib');
const config = require('../config.json');
const PromiseOrchestrator = require('../../core/helpers/promiseOrchestrator.js');
const stringReplacer = require('../utils/stringReplacer.js');
const DfobProcessor = require('../../core/helpers/dfobProcessor');

class Engine {
  constructor(component, requestDirection, amqpClient, callerId, pushData, queryParams, tracerId) {
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

  async resolveComponent() {
    try {
      let components = await workspace_component_lib.get_all({
        workspaceId: this.originComponent.workspaceId
      });
      this.componentsResolving = components;
      let workflow = await workspace_lib.getWorkspace(this.originComponent.workspaceId);
      this.workflow = workflow;
      console.log(' ---------- Start Engine-----------', this.workflow.name);
      this.workflow.status = 'running';
      await workspace_lib.updateSimple(this.workflow);
      let ownerUserMail = this.workflow.users.filter(
        sift({ role: 'owner' })
      )[0];
      let user = await user_lib.get({
        'credentials.email': ownerUserMail.email
      });
      this.componentsResolving.forEach(component => {
        component.specificData = component.specificData || {};
      });

      this.originComponent = this.componentsResolving.filter(sift({
        _id: this.originComponent._id
      }))[0];

      let workAskModule = technicalComponentDirectory[this.originComponent.module];
      if (workAskModule.workAsk != undefined) {
        await workAskModule.workAsk(this.originComponent);
      }

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
      );

      if (config.quietLog != true) {
        console.table(this.pathResolution.links.map(link => {
          return {
            source: link.source.component._id.toString(),
            source_module: link.source.component.module,
            source_nom: link.source.component.nom,
            target: link.target.component._id.toString(),
            target_module: link.target.component.module,
            target_nom: link.target.component.nom
          };
        }));
      }

      this.owner = user;
      let process = await workspace_lib.createProcess({
        workflowId: this.originComponent.workspaceId,
        ownerId: this.owner._id,
        callerId: this.callerId,
        originComponentId: this.originComponent._id,
        steps: this.pathResolution.nodes.map(node => ({
          componentId: node.component._id
        }))
      });
      this.processId = process._id;
      this.processNotifier = new ProcessNotifier(this.amqpClient, this.originComponent.workspaceId);
      this.processNotifier.start({
        _id: this.processId,
        callerId: this.callerId,
        tracerId: this.tracerId,
        timeStamp: process.timeStamp,
        steps: this.pathResolution.nodes.map(node => ({
          componentId: node.component._id,
          status: node.status
        }))
      });

      this.pathResolution.links.forEach(link => {
        link.status = 'waiting';
      });

      if (this.originComponent.specificData.responseComponentId != undefined && this.originComponent.specificData.responseComponentId != 'undefined') {
        this.responseComponentId = this.originComponent.specificData.responseComponentId;
      } else {
        this.responseComponentId = this.originComponent._id;
      }

      if (this.responseComponentId != undefined && this.responseComponentId != 'undefined') {
        this.processNextBuildPath();
      } else {
        throw new Error('responseComponentId undefined');
      }

    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  processNextBuildPath() {
    setTimeout(this.processNextBuildPathDelayed.bind(this), 100)
  }

  async processNextBuildPathDelayed(owner) {
    try {
      let process = await workspace_lib.getCurrentProcess(this.processId);
      if (process.state == 'stop') {
        this.processNotifier.information({
          _id: this.processId,
          tracerId: this.tracerId,
          information: 'Votre flow a été aretté avec succéss'
        })

      } else {
        if (this.owner.credit >= 0 || (config.privateScript && config.privateScript.length == 0) || config.free == true) {

          this.fackCounter++
          console.log(`---------- processNextBuildPath ----------- ${this.workflow.name} ${this.fackCounter}/${this.pathResolution.nodes.length}`)
          if (config.quietLog != true) {
          }
          let processingNode
          let nodeWithoutIncoming = this.pathResolution.nodes.filter(sift({
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
            processingNode = nodeWithoutIncoming[0]
          } else {

            let nodeWithAllIncomingResolved = this.pathResolution.nodes.filter(sift({
              status: 'waiting'
            }));

            nodeWithAllIncomingResolved.every(n => {
              let nbSourcesResolved = n.sources.filter(sift({
                'source.status': 'resolved'
              })).length;

              if (n.sources.length == nbSourcesResolved) {
                processingNode = n
                return false
              } else {
                return true
              }
            })
          }

          if (processingNode != undefined) {
            if (config.quietLog != true) {
              console.log(`           processingNode ----------- ${processingNode.component._id} type:'${processingNode.component.type}' name:'${processingNode.component.name}'`)
            }
            let startTime = new Date()

            let nodesProcessingInputs = this.pathResolution.nodes.filter(npi =>
              npi.targets.map(t =>
                t.target.component._id
              ).includes(processingNode.component._id)
            );

            let module = technicalComponentDirectory[processingNode.component.module]

            let dataFlow
            let primaryflow
            let secondaryFlow;

            let componentFlow = {}
            if (nodesProcessingInputs.length > 0) {
              let persistedDataFlow = [];
              for (const sourceNode of nodesProcessingInputs) {
                let persistedData;
                let persistedFragmentData;

                let sourceComponentId;

                sourceComponentId = sourceNode.component._id

                const persistedDataFlowCoponent = await workspace_component_lib.get_component_result(sourceComponentId, this.processId);
                const fragAvailable = persistedDataFlowCoponent.frag && persistedDataFlowCoponent.frag != null;

                if (fragAvailable) {
                  persistedFragmentData = persistedDataFlowCoponent.frag;
                }

                const previousDfob = persistedDataFlowCoponent.dfob ? persistedDataFlowCoponent.dfob : undefined;

                const targetInput = sourceNode.targets.find(t => t.target.component._id.equals(processingNode.component._id)).targetInput;
                persistedDataFlow.push({
                  fragment: persistedFragmentData,
                  componentId: sourceNode.component._id,
                  targetInput: targetInput,
                  dfob: previousDfob
                })
              }

              componentFlow = {
                dataFlow: persistedDataFlow,
                deeperFocusData: processingNode.component.deeperFocusData
              }

              if ((!componentFlow?.deeperFocusData || Object.keys(componentFlow.deeperFocusData).length == 0) || (componentFlow?.deeperFocusData?.activateDf == undefined || componentFlow?.deeperFocusData?.activateDf == false)) {
                componentFlow.deeperFocusData = {
                  dfobPath: '',
                  keepArray: true
                };
              }

              componentFlow.deeperFocusData = {
                keepArray: componentFlow.deeperFocusData.keepArray != undefined ? componentFlow.deeperFocusData.keepArray : componentFlow.deeperFocusData.dfobKeepArray,
                dfobPath: componentFlow.deeperFocusData.path != undefined ? componentFlow.deeperFocusData.path : componentFlow.deeperFocusData.dfobPath,
                pipeNb: componentFlow.deeperFocusData.beanNb != undefined ? componentFlow.deeperFocusData.beanNb : componentFlow.deeperFocusData.pipeNb != undefined ? componentFlow.deeperFocusData.pipeNb : componentFlow.deeperFocusData.dfobNbPipe,
                tableDepth: componentFlow.deeperFocusData.tableDepth != undefined ? componentFlow.deeperFocusData.tableDepth : componentFlow.deeperFocusData.dfobTableDepth
              }

              if (module.getPrimaryFlow != undefined) {
                componentFlow.primaryflow = await module.getPrimaryFlow(
                  processingNode.component,
                  componentFlow.dataFlow
                )
              } else {
                componentFlow.primaryflow = componentFlow.dataFlow.find(df => df.targetInput == undefined)
              }
              if (module.getSecondaryFlow != undefined) {
                componentFlow.secondaryFlow = await module.getSecondaryFlow(
                  processingNode.component,
                  componentFlow.dataFlow
                )
              } else {
                componentFlow.secondaryFlow = componentFlow.dataFlow.filter(flow => flow !== componentFlow.primaryflow);
              }
            }

            if (componentFlow.dataFlow != undefined && componentFlow.primaryflow == undefined) {
              let err = new Error('primary flow could not be identified')
              processingNode.status = 'error'
              processingNode.dataResolution = {
                error: err
              }
              await this.historicEndAndCredit(processingNode, startTime, undefined, err)
              this.processNextBuildPath('flow ko')
            } else {
              if (componentFlow.deeperFocusData) {
                try {

                  let { dfobPath, keepArray, pipeNb, tableDepth } = componentFlow.deeperFocusData;

                  if (dfobPath == undefined) {
                    dfobPath = '';
                  }

                  let dfobPathNormalized = stringReplacer.execute(dfobPath, processingNode.queryParams?.queryParams, componentFlow.primaryflow?.data);
                  var dfobTab = dfobPathNormalized.length > 0 ? dfobPathNormalized.split('.') : []

                  let dfobFragmentFlow = await this.buildDfobFragmentFlow(
                    componentFlow.primaryflow.fragment,
                    { dfobTable: dfobTab, keepArray, tableDepth },
                  )

                  const newFrag = dfobFragmentFlow.newFrag;
                  let dfobFragmentSelected = dfobFragmentFlow.dfobFragmentSelected;
                  // console.log('dfobFragmentSelected',dfobFragmentSelected)

                  dfobFragmentSelected = Array.isArray(dfobFragmentSelected) ? dfobFragmentSelected : [dfobFragmentSelected]

                  if (dfobFragmentSelected.length == 0) {
                    processingNode.dataResolution = {}
                    processingNode.status = 'resolved'
                    await this.historicEndAndCredit(processingNode, startTime, newFrag, undefined)
                    this.processNextBuildPath('dfob empty')
                  } else {
                    const secondaryFlowDefraged = [];
                    if (!module.workWithFragments) {
                      if (config.quietLog != true) console.time("secondary_getWithResolutionByBranch" + '_' + this.processId + '_' + this.workflow.name);
                      for (let sf of componentFlow.secondaryFlow) {
                        secondaryFlowDefraged.push({
                          data: await fragment_lib.getWithResolutionByBranch(sf.fragment),
                          componentId: sf.componentId,
                          targetInput: sf.targetInput
                        })
                      }
                      if (config.quietLog != true) console.timeEnd("secondary_getWithResolutionByBranch" + '_' + this.processId + '_' + this.workflow.name);

                    }

                    if (config.quietLog != true) console.time("rebuildFrag_focus_work_persist" + '_' + this.processId + '_' + this.workflow.name);
                    try {
                      let dfob = undefined;
                      let paramArray = dfobFragmentSelected.map(item => {
                        return [
                          processingNode,
                          item.frag,
                          { dfobTable: item.relativDfobTable || [], pipeNb, keepArray },
                          componentFlow.primaryflow,
                          secondaryFlowDefraged,
                          componentFlow.secondaryFlow
                        ]
                      })

                      try {
                        const workResult = await this.promiseOrchestrator.execute(this, this.rebuildFrag_focus_work_persist, paramArray, {
                          beamNb: pipeNb,
                          logIteration: true,
                          continueCheckFunction: async () => {
                            const process = await workspace_lib.getCurrentProcess(this.processId);
                            if (process.state == 'stop') {
                              return false
                            } else {
                              return true
                            }
                          }
                        }, config);
                        //TODO : seems to be deleted
                        for (const workResultItem of workResult) {
                          dfob = workResultItem?.dfob;
                        }

                      } catch (error) {
                        console.error(error);
                      }


                      processingNode.status = 'resolved'
                      await this.historicEndAndCredit(processingNode, startTime, newFrag, undefined, dfob)
                      this.processNextBuildPath('flow ok')
                    } catch (error) {
                      console.error('REJECT dfob', error)
                      processingNode.dataResolution = {
                      }
                      await this.historicEndAndCredit(processingNode, startTime, undefined, error)
                      processingNode.status = 'error'
                      this.processNextBuildPath('dfob reject')
                    }
                    if (config.quietLog != true) console.timeEnd("rebuildFrag_focus_work_persist" + '_' + this.processId + '_' + this.workflow.name);
                    if (module.endWork) {
                      await module.endWork(processingNode.component,this.processId);
                    }
                  }
                } catch (e) {
                  console.error('CATCH dfob', e)
                  processingNode.dataResolution = {
                  }
                  await this.historicEndAndCredit(processingNode, startTime, undefined, e)
                  processingNode.status = 'error'
                  if (module.endWork) {
                    await module.endWork(processingNode,this.processId);
                  }
                  this.processNextBuildPath('dfob catch')
                }
              } else {
                // this code occure when no input dependency because dfob is set by defaut when input dependency exist
                try {
                  //TODO: methode can be workWithFragments
                  const componentFlow = await module.pull(processingNode.component, dataFlow, processingNode.queryParams?.queryParams, this.processId);

                  const {
                    data,
                    ...dataResolution
                  } = componentFlow;

                  // console.log('____frag persist when no input dependency_____DATA',data)
                  processingNode.dataResolution = dataResolution;
                  processingNode.status = 'resolved';
                  const frag = await fragment_lib.persist(data)

                  // console.log('____frag persist when no input dependency_____FRAG', frag)
                  // fragment_lib.displayFragTree(frag.id)
                  // await new Promise(resolve => setTimeout(resolve, 1000));

                  await this.historicEndAndCredit(processingNode, startTime, frag, undefined)


                  this.processNextBuildPath('normal ok')

                } catch (e) {
                  console.error('CATCH normal', e, typeof e)
                  processingNode.dataResolution = {
                  }
                  await this.historicEndAndCredit(processingNode, startTime, undefined, e)
                  processingNode.status = 'error'
                  this.processNextBuildPath('normal catch')
                }
              }
            }
          } else {

            let nodeOnError = this.pathResolution.nodes.filter(sift({
              status: 'error'
            }));

            if (nodeOnError.length > 0) {
              this.processNotifier.error({
                _id: this.processId,
                tracerId: this.tracerId,
              })
              this.workflow.status = 'error';
              await workspace_lib.updateSimple(this.workflow)
              let errors = []
              this.pathResolution.nodes.forEach(n => {
                if (n.dataResolution != undefined && n.dataResolution.error != undefined) {
                  errors.push(n.dataResolution.error)
                }
              })
            } else {
              this.processNotifier.end({
                _id: this.processId,
                tracerId: this.tracerId,
              });
              this.workflow.status = 'resolved';
              await workspace_lib.updateSimple(this.workflow)
            }
            await workspace_lib.markProcessAsResolved(process);
            const processes = await workspace_lib.cleanOldProcessByWorkflow(this.workflow);
            console.log('--------------  End of Worksapce processing --------------', this.workflow.name, this.owner.credit)

            this.processNotifier.processCleaned({
              cleanedProcesses: [process],
              tracerId: this.tracerId,
              workspaceId: this.workflow._id
            })
            user_lib.update(this.owner)
          }
        } else {
          const fullError = new Error("Vous n'avez pas assez de credit");
          this.processNotifier.error({
            _id: this.processId,
            tracerId: this.tracerId,
            error: fullError.message
          })
          this.workflow.status = 'error';
          await workspace_lib.updateSimple(this.workflow)
        }
      }
    } catch (error) {
      console.error(error);
      const fullError = new Error("Erreur du moteur inconnue contater l'hebergeur");
      this.processNotifier.error({
        _id: this.processId,
        tracerId: this.tracerId,
        error: fullError.message
      })
      this.workflow.status = 'error';
      await workspace_lib.updateSimple(this.workflow)
    }

  }

  async historicEndAndCredit(processingNode, startTime, frag, error, dfob) {
    if (config.quietLog != true) {
      console.time('historicEndAndCredit' + '_' + this.processId + '_' + this.workflow.name)
    }
    let historic_object = {};
    try {
      historic_object.componentId = processingNode.component._id;
      historic_object.persistProcess = processingNode.component.persistProcess;
      historic_object.processId = this.processId;
      historic_object = await workspace_lib.createOrUpdateHistoriqueEnd(historic_object)
      let module = processingNode.component.module;

      if (frag) {
        try {
          historic_object = await workspace_lib.addFragHistoriqueEnd(historic_object._id, frag);

          this.processNotifier.persist({
            componentId: historic_object.componentId,
            processId: historic_object.processId,
            tracerId: this.tracerId,
            frag: frag.id
          })
        } catch (e) {
          console.log('ERROR', e);
          this.processNotifier.persist({
            componentId: historic_object.componentId,
            processId: historic_object.processId,
            tracerId: this.tracerId,
            error: 'error persisting historic data'
          })
          await workspace_lib.addDataHistoriqueEnd(historic_object._id, {
            error: 'error persisting historic data'
          });
          throw new Error('error persisting historic data');
        }
      }



      let specificData = processingNode.component.specificData;
      let current_component = config.components_information[module];
      if(!current_component){
        throw new Error(`Component ${module} not found in prices`);
      }
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

      if (dfob) {
        historic_object.dfob = dfob
      }

      historic_object.recordPrice = current_component_price.record_price || 0;
      historic_object.componentPrice = current_component_price.moPrice;
      historic_object.userId = this.owner._id;
      historic_object.componentModule = module;
      historic_object.componentName = processingNode.component.name;
      historic_object.error = error;
      historic_object.startTime = startTime;
      historic_object.roundDate = roundDate;
      historic_object.workflowId = this.originComponent.workspaceId;

      historic_object = await workspace_lib.createOrUpdateHistoriqueEnd(historic_object);
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
    if (config.quietLog != true) console.timeEnd('historicEndAndCredit' + '_' + this.processId + '_' + this.workflow.name)
    if (historic_object != undefined) {
      this.owner.credit -= historic_object.totalPrice
    }

  }

  async buildDfobFragmentFlow(fragment, dfobOptions) {
    if (config.quietLog != true) console.time("buildDfobFragmentFlow_" + this.processId + '_' + this.workflow.name);
    const out = await fragment_lib.copyFragUntilPath(fragment, dfobOptions);
    // console.log('out', out)
    if (config.quietLog != true) console.timeEnd("buildDfobFragmentFlow_" + this.processId + '_' + this.workflow.name);
    return out;
  }

  async rebuildFrag_focus_work_persist(processingNode, fragment, dfob, primaryflow, secondaryFlowDefraged, secondaryFlowFragments) {
    
    let module = technicalComponentDirectory[processingNode.component.module]
    const { dfobTable, pipeNb, keepArray } = dfob
    let rebuildData;
    let workWithFragments = module.workWithFragments;

    if (!workWithFragments) {
      try {

        rebuildData = await fragment_lib.getWithResolutionByBranch(fragment.id);
        dfob = undefined;

        const needDfob = dfobTable.length > 0 || (Array.isArray(rebuildData) && !keepArray && !fragment.branchOriginFrag);
        if (needDfob) {

          rebuildData = await DfobProcessor.processDfobFlow(
            rebuildData,
            { pipeNb, dfobTable, keepArray },
            module,
            module.pull,
            (item) => {

              const recomposedFlow = [{
                data: item,
                componentId: primaryflow.componentId
              }, ...secondaryFlowDefraged];

              return [
                processingNode.component,
                recomposedFlow,
                processingNode.queryParams?.queryParams,
                this.processId
              ];
            },
            async () => {
              const process = await workspace_lib.getCurrentProcess(this.processId);
              return process.state !== 'stop';
            },
            true
          );
        } else {

          let workResult
          let recomposedFlow = [];
          recomposedFlow = recomposedFlow.concat([{
            data: rebuildData,
            componentId: primaryflow.componentId
          }]);
          recomposedFlow = recomposedFlow.concat(secondaryFlowDefraged);
          workResult = await module.pull(processingNode.component, recomposedFlow, processingNode.queryParams == undefined ? undefined : processingNode.queryParams.queryParams, this.processId)
          // console.log('___workResult', workResult.data)
          rebuildData = workResult.data;
          dfob = workResult.dfob
        }
      } catch (error) {
        console.error(error);
        rebuildData = {
          error: error.message
        };
      }

      // console.log('___rebuildData', rebuildData[0][0])

      let pesristedFragment
      try {
        pesristedFragment = await fragment_lib.persist(rebuildData, undefined, fragment);

      } catch (error) {
        console.error("persist ERROR", error);
      }
      return {
        frag: pesristedFragment,
        dfob
      }
    }

    if (workWithFragments) {
      try {

        let workResult
        let recomposedFlow = [];
        recomposedFlow = recomposedFlow.concat([{
          fragment: fragment,
          componentId: primaryflow.componentId,
          dfob: { dfobTable, pipeNb, keepArray :true },
        }]);
        recomposedFlow = recomposedFlow.concat(secondaryFlowFragments);
        workResult = await module.workWithFragments(processingNode.component, recomposedFlow, processingNode.queryParams == undefined ? undefined : processingNode.queryParams.queryParams, this.processId)

        return {
          frag: workResult,
          dfob
        }
      } catch (error) {
        const errorData = {
          error: error.message
        };

        console.error(error);

        await fragment_lib.persist(errorData, undefined, fragment);
      }
    }
  }


  buildPathResolution(workspace, component, requestDirection, depth, usableComponents, buildPath, queryParams, buildPathCauseLink) {
    if (depth < 100) {
      if (buildPath == undefined) {
        buildPath = {}
        buildPath.links = []
        buildPath.nodes = []
      }

      let module = technicalComponentDirectory[component.module]

      if (module.buildQueryParam != undefined) {
        queryParams = {
          origin: component._id,
          queryParams: module.buildQueryParam(queryParams ? queryParams.queryParams : undefined, component.specificData)
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

      let existingNodes = buildPath.nodes.filter(sift(existingNodesFilter));

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

      let connectionsBefore = workspace.links.filter(sift({
        target: component._id
      }));

      let connectionsAfter = workspace.links.filter(sift({
        source: component._id
      }));

      if (requestDirection != 'push') {
        if (
          connectionsBefore.length > 0 &&
          !(requestDirection == 'pull' && module.stepNode == true)
        ) {
          for (var beforelink of connectionsBefore) {
            var beforeComponentObject = usableComponents.filter(sift({
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

              var existingLink = buildPath.links.filter(sift(existingLinkFilter));
              if (existingLink.length == 0) {
                var linkToProcess = {
                  target: buildPathNode,
                  requestDirection: 'pull',
                  queryParams: queryParams,
                  linkId: beforelink._id,
                  targetInput: beforelink.targetInput
                }
                buildPath.links.push(linkToProcess)
                buildPathNode.sources.push(linkToProcess)
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
            var afterComponentObject = usableComponents.filter(sift({
              _id: afterlink.target
            }))[0];

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
              var existingLink = buildPath.links.filter(sift(existingLinkFilter));

              if (existingLink.length == 0) {
                var linkToProcess = {
                  source: buildPathNode,
                  requestDirection: 'push',
                  queryParams: queryParams,
                  linkId: afterlink._id,
                  targetInput: afterlink.targetInput
                }

                buildPath.links.push(linkToProcess)
                buildPathNode.targets.push(linkToProcess)

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
  execute: function (component, requestDirection, stompClient, callerId, pushData, queryParams, tracerId) {
    let engine = new Engine(component, requestDirection, stompClient, callerId, pushData, queryParams, tracerId);
    return engine.resolveComponent()
  }
}
