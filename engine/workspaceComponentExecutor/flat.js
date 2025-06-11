'use strict';
const fragmentModel = require('../../core/models/fragments_model_scylla.js');
const DfobProcessor = require('../../core/helpers/dfobProcessor.js');

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


        if (inputFragment.branchFrag != undefined && inputFragment.dfobTable.length == 0 && (!inputDfob.tableDepth || inputDfob.tableDepth==Infinity || inputDfob.tableDepth == 0)) {
          let resultFragment = await this.fragment_lib.createArrayFrag(undefined, true);
          let index = 1;
          const arrayChildren = await fragmentModel.searchFragmentByField({
            branchOriginFrag: inputFragment.branchFrag
          }, {
            index: 'ASC'
          });
          for (const child of arrayChildren) {
            if (child.branchFrag != undefined) {
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
            } else if (Array.isArray(child.data)) {
              for (let i = 0; i < child.data.length; i++) {
                // console.log('adding child by data', child.data[i])
                await this.fragment_lib.addDataToArrayFrag(child.data[i], resultFragment, index);
                index++;
              }
            } else {
              //nothind to do if no Array (frag or data)
            }
          }

          resultFragment.id = inputFragment.id;
          await fragmentModel.updateFragment(resultFragment);
        } else if (Array.isArray(inputFragment.data) && inputDfob.dfobTable.length == 0 && (!inputDfob.tableDepth || inputDfob.tableDepth==Infinity || inputDfob.tableDepth == 0)) {
          // exact implementation for Array at root of inputFragment.data
          // could be use when dfobTable or tableDepth but not implemented yet
          let resultFragment = await this.fragment_lib.createArrayFrag(undefined, true);
          let index = 1;
          for (let i = 0; i < inputFragment.data.length; i++) {
            const item = inputFragment.data[i];
            if (item._frag) {
              const fragmentObject = await fragmentModel.getFragmentById(item._frag);
              const childrenOfChild = await fragmentModel.searchFragmentByField({
                branchOriginFrag: fragmentObject.branchFrag
              }, {
                index: 'ASC'
              });
              for (const child of childrenOfChild) {
                //TODO thi erase data frome input component output
                await this.fragment_lib.addFragToArrayFrag(child, resultFragment, index);
                index++;
              }
            } else if (Array.isArray(item)) {
              for (let j = 0; j < item.length; j++) {
                await this.fragment_lib.addDataToArrayFrag(item[j], resultFragment, index);
                index++;
              }
            } else {
              //nothind to do if no Array (frag or data)
            }
          }
          resultFragment.id = inputFragment.id;
          await fragmentModel.updateFragment(resultFragment);
        } else if (inputDfob.dfobTable.length > 0 || inputDfob?.tableDepth > 0) {
          // partial implementation when dfobTable or tableDepth is used
          // this.flatFragment could be improved using same implementaiton as previous case
          const dereferencedData = await this.fragment_lib.getWithResolutionByBranch(inputFragment,{
            deeperFocusActivated: true,
            dfobTable: inputDfob.dfobTable
          });
          const postProcessedData = await DfobProcessor.processDfobFlow(
            dereferencedData,
            inputDfob,
            this,
            this.flatFragment,
            (item) => {
              return [item, data]
            }, async () => {
              return true;
            })
          inputFragment.data = postProcessedData;
          await fragmentModel.updateFragment(inputFragment);  
        }


        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  flatFragment(item, data) {
    return item.flat();
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
