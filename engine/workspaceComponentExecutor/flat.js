'use strict';
const fragmentModel = require('../../core/models/fragments_model_scylla.js');

class Flat {
  constructor () {
    this.fragment_lib = require('../../core/lib/fragment_lib_scylla.js');
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

        // Create a new array fragment to store the flattened results
        let resultFragment = await this.fragment_lib.createArrayFrag(undefined,true);
        let index = 1;

        const isArrayFrag = inputFragment.branchFrag!=undefined;
        if (isArrayFrag) {
          const arayChildren = await fragmentModel.searchFragmentByField({ 
            branchOriginFrag: inputFragment.branchFrag
          }, {
            index: 'ASC'
          });
          for (const child of arayChildren) {
            const isChildArrayFrag = child.branchFrag!=undefined;
            if (isChildArrayFrag) {
              const childrenOfChild = await fragmentModel.searchFragmentByField({
                branchOriginFrag: child.branchFrag
              }, {
              index: 'ASC'
            });
            for (const childOfChild of childrenOfChild) {
                await this.fragment_lib.addFragToArrayFrag(childOfChild, resultFragment, index);
                index++;
              }
            }
          }
        } 

        resultFragment.id = inputFragment.id;
        await fragmentModel.updateFragment(resultFragment);

        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  pull (data, flowData, pullParams) {
    return new Promise((resolve, reject) => {
      try {
        var result = []
        if (Array.isArray(flowData[0].data)){
          result = flowData[0].data.flat();
        }
        else{
          throw new Error("Data are not in an array structure.")
        }
        resolve({
          data: result
        })
      } catch (e) {
        reject (e)
      }
    })
  }
}
module.exports = new Flat()
