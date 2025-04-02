'use strict'
const fragment_lib = require('../../core/lib/fragment_lib_scylla.js');
const DfobProcessor = require('../../core/helpers/dfobProcessor.js');

class ObjectTransformer {
  constructor() {
    this.objectTransformation = require('../utils/objectTransformation.js');
    this.objectTransformationV2 = require('../utils/objectTransformationV2.js');
    this.config = require('../config.json');
  }

  initComponent(entity) {
    // console.log('Object Transformer | initComponent : ',entity);

    if (entity.specificData.transformObject == undefined) {
      entity.specificData.transformObject = {}
    }
    return entity
  }

  jsonTransform(source, jsonTransformPattern, pullParams, options) {
    let out;
    // console.log('config',this.config);
    // if(options.version==='v1'||options.version==='default'||options.version===undefined){
    //   out = this.objectTransformation.executeWithParams(source, pullParams, jsonTransformPattern, options,this.config)
    // }else if(options.version==='v2'){
      // console.log('source',source.length);
      out = this.objectTransformationV2.executeWithParams(source, pullParams, jsonTransformPattern, options,this.config)

      if(options.keepSource==true &&  !Array.isArray(out)&&!Array.isArray(source)){
        // console.log('source',source);
        out={...source,...out};
      }
    // }
    // let out = this.objectTransformation.executeWithParams(source, pullParams, jsonTransformPattern, options)
    // console.log('out',out);
    // if(out['nom du lieux *']&&out['nom du lieux *'].includes('Nuyens')){
    //   console.log("AFTER transform", out.bf_longitude, typeof out.bf_longitude);
    // }
    // console.log(('transformer out',out));
    return out;
  }

  async workWithFragments(data, flowData, pullParams, processId) {
    return new Promise(async (resolve, reject) => {
      try {
        // Get the input fragment and dfob
        const inputFragment = flowData[0]?.fragment;
        const inputDfob = flowData[0]?.dfob;
        
        if (!inputFragment) {
          resolve();
          return;
        }

        // Get data from fragment
        let rebuildDataRaw = await fragment_lib.getWithResolutionByBranch(inputFragment.id, {
          pathTable: inputDfob?.dfobTable || []
        });

        // Process the data with transformation
        const rebuildData = await DfobProcessor.processDfobFlow(
          rebuildDataRaw,
          { 
            pipeNb: inputDfob?.pipeNb, 
            dfobTable: inputDfob?.dfobTable, 
            keepArray: inputDfob?.keepArray 
          },
          this,
          this.transformItem,
          (item) => {
            return [
              item, 
              data.specificData.transformObject, 
              pullParams, 
              {
                evaluationDetail: data.specificData.evaluationDetail,
                version: data.specificData.version,
                keepSource: data.specificData.keepSource
              }
            ];
          },
          async () => {
            return true;
          }
        );

        // Persist the transformed data
        await fragment_lib.persist(rebuildData, undefined, inputFragment);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }
  
  transformItem(item, transformObject, pullParams, options) {
    return this.jsonTransform(item, transformObject, pullParams, options);
  }

  pull(data, flowData, pullParams) {
    // console.log('ObjectTransformer pull',flowData,pullParams);
    return new Promise((resolve, reject) => {
      try {
        if (flowData != undefined) {
          resolve({
            data: this.jsonTransform(flowData[0].data, data.specificData.transformObject, pullParams, {
              evaluationDetail: data.specificData.evaluationDetail,
              version: data.specificData.version,
              keepSource : data.specificData.keepSource
            })
          })
        } else {
          resolve({
            data: this.jsonTransform({}, data.specificData.transformObject, pullParams, {
              evaluationDetail: data.specificData.evaluationDetail,
              version: data.specificData.version,
              keepSource : data.specificData.keepSource
            })
          })
        }
      } catch (e) {
        reject(e);
      }
    })
  }
}
module.exports = new ObjectTransformer()
