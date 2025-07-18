const fragment_lib = require('@semantic-bus/core/lib/fragment_lib_scylla');
const fragmentModel = require('@semantic-bus/core/models/fragments_model_scylla');

'use strict';
class SimpleAgregator {
  constructor() {
  }

  async getPrimaryFlow(data, dataFlow) {
    dataFlow.sort((a, b) => {
      let componentIdA = a.componentId.toString();
      let componentIdB = b.componentId.toString();
      const diff = componentIdA.localeCompare(componentIdB);
      return diff;
    });
    //TODO : refactor and search an other solution because the rootArrayFrag is not referenced by process history and so not deleted
    const newRooFrag = await fragment_lib.createRootArrayFragFromFrags(dataFlow.map(df => df.fragment))

    return {
      fragment: newRooFrag.id
    }
  }

  async getSecondaryFlow(data, flowData) {
    return []
  }

  async workWithFragments(data, flowData, queryParams, processId) {
    return new Promise(async (resolve, reject) => {
      try {

        let resultFragment = await fragment_lib.createArrayFrag(undefined, true);
        let index = 1;

        const inputFragment = flowData[0]?.fragment;
        const inputDfob = flowData[0]?.dfob;
        // console.log('inputFragment', inputFragment)

        if (inputFragment.branchFrag) {
          const childrenFlow = await fragmentModel.searchFragmentByField({
            branchOriginFrag: inputFragment.branchFrag
          }, {
            index: 'ASC'
          });
          for (const childFlow of childrenFlow) {
            if (childFlow.branchFrag) {
              const childrenFragments = await fragmentModel.searchFragmentByField({
                branchOriginFrag: childFlow.branchFrag
              }, {
                index: 'ASC'
              });
              for (const childFragment of childrenFragments) {
                await fragment_lib.addFragToArrayFrag(childFragment, resultFragment, index);
                index++;
              }
            } else if (Array.isArray(childFlow.data)) {
              for (const item of childFlow.data) {
                await fragment_lib.addDataToArrayFrag(item, resultFragment, index);
                index++;
              }
            } else {
              await fragment_lib.addDataToArrayFrag(childFlow.data, resultFragment, index);
              index++;
            }
          }
        } else if (Array.isArray(inputFragment.data)) {
          for (const childFlow of inputFragment.data) {
            if (childFlow._frag) {
              const childArrayFrag = await fragmentModel.getFragmentById(item._frag);
              const childrenFragments = await fragmentModel.searchFragmentByField({
                branchOriginFrag: childArrayFrag.branchFrag
              }, {
                index: 'ASC'
              });
              for (const childFragment of childrenFragments) {
                await fragment_lib.addFragToArrayFrag(childFragment, resultFragment, index);
                index++;
              }
            } else if (Array.isArray(childFlow.data)) {
              for (const item of childFlow.data) {
                await fragment_lib.addDataToArrayFrag(item, resultFragment, index);
                index++;
              }
            } else {
              await fragment_lib.addDataToArrayFrag(childFlow, resultFragment, index);
              index++;
            }

          }
        } else {

        }

        resultFragment.id = inputFragment.id;
        await fragmentModel.updateFragment(resultFragment);

        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  pull(data, flowData) {
    return new Promise((resolve, reject) => {
      var resultFlow = []
      for (let flow of flowData) {
        if (Array.isArray(flow.data)) {
          for (let originData of flow.data) {
            // if (Array.isArray(originData)) {
            //   for (let record of originData) {
            //     resultFlow.push(record)
            //   }
            // } else {
            resultFlow.push(originData)
            // }
          }
        } else {
          resultFlow.push(flow.data)
        }
      }
      resultFlow = resultFlow.flat();
      resolve({
        data: resultFlow
      })
    })
  }
}
module.exports = new SimpleAgregator()
