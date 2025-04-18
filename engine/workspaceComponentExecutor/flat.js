'use strict';
const fragmentModel = require('../../core/models/fragments_model_scylla.js');

class Flat {
  constructor() {
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
        let resultFragment = await this.fragment_lib.createArrayFrag(undefined, true);
        let index = 1;

        const isArrayFrag = inputFragment.branchFrag != undefined;
        if (isArrayFrag) {
          // console.log('inputFragment is arrayFrag', inputFragment)
          const arrayChildren = await fragmentModel.searchFragmentByField({
            branchOriginFrag: inputFragment.branchFrag
          }, {
            index: 'ASC'
          });
          // console.log('arrayChildren', arrayChildren)
          for (const child of arrayChildren) {
            const isChildArrayFrag = child.branchFrag != undefined;
            if (isChildArrayFrag) {
              const childrenOfChild = await fragmentModel.searchFragmentByField({
                branchOriginFrag: child.branchFrag
              }, {
                index: 'ASC'
              });
              for (const childOfChild of childrenOfChild) {
                // console.log('adding child by fragment', childOfChild)
                await this.fragment_lib.addFragToArrayFrag(childOfChild, resultFragment, index);
                index++;
              }
            }else if (Array.isArray(child.data)){
              for(let i = 0; i < child.data.length; i++){
                // console.log('adding child by data', child.data[i])
                await this.fragment_lib.addDataToArrayFrag(child.data[i], resultFragment, index);
                index++;  
              }
            }else{
              //nothind to do if no ARray (frag or data)
            }
          }
        } else if (Array.isArray(inputFragment.data)){
          for(let i = 0; i < inputFragment.data.length; i++){
            const item = inputFragment.data[i];
            if (item._frag){
              await this.fragment_lib.addFragToArrayFrag(item._frag, resultFragment, index);
              index++;
            } else if (Array.isArray(item)){
              for(let j = 0; j < item.length; j++){
                await this.fragment_lib.addDataToArrayFrag(item[j], resultFragment, index);
                index++;
              }
            }
          }
        } else {
          throw new Error("Data are not in an array structure.")
        }

        resultFragment.id = inputFragment.id;
        await fragmentModel.updateFragment(resultFragment);

        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  pull(data, flowData, pullParams) {
    return new Promise((resolve, reject) => {
      try {
        var result = []
        if (Array.isArray(flowData[0].data)) {
          result = flowData[0].data.flat();
        }
        else {
          throw new Error("Data are not in an array structure.")
        }
        resolve({
          data: result
        })
      } catch (e) {
        reject(e)
      }
    })
  }
}
module.exports = new Flat()
