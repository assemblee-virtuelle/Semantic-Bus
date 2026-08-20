'use strict';

// Move all requires before the class definition
const fragment_lib = require('@semantic-bus/core/lib/fragment_lib_scylla.js');
const DfobProcessor = require('@semantic-bus/core/helpers/dfobProcessor.js');
const Loki = require('lokijs');

const stringReplacer = require('../utils/stringReplacer.js');
const objectTransformation = require('../utils/objectTransformationV2.js');
const { validateExpression } = require('../utils/validateExpression.js');
const { runEvalInRemote } = require('../utils/evalSecurity.js');

const db = new Loki('filter', {
  verbose: true
});

class Filter {
  constructor() {
  }

  // -----------------------------------------------------------------------------
  // NOTE: The `pull` path below is DEAD CODE in the current engine.
  //
  // The engine (services/engine.js) routes the Filter component through
  // `workWithFragments` (see engine.js `rebuildFrag_focus_work_persist`, which
  // dispatches to workWithFragments whenever the module exposes it). The `pull`
  // method is therefore never invoked with usable data at runtime.
  //
  // It is kept (commented out) only as an historical reference. It used the
  // `sift` library whose `$where` operator compiles a string into `new Function`
  // (RCE sink). Since `workWithFragments` takes over with a Loki-based
  // implementation, this sift-based path must NOT be reactivated without a
  // security review (see SECURITY spec for eval/$where handling).
  //
  //   pull(data, flowData, pullParams) {
  //     return new Promise((resolve, reject) => {
  //       try {
  //         let usableData = flowData[0].data
  //         if (!Array.isArray(usableData)) {
  //           throw new Error('input data is not an array')
  //         }
  //
  //         let filterString = data.specificData.filterString
  //         let filter = JSON.parse(filterString)
  //         let filterResult = objectTransformation.execute(usableData, pullParams, filter);
  //         var resultData = usableData.filter(sift(filterResult));  // sift $where -> new Function sink
  //         resolve({
  //           data: resultData
  //         })
  //       } catch (e) {
  //         reject(e)
  //       } finally {
  //       }
  //     })
  //   }
  // -----------------------------------------------------------------------------

  async filterRawItems(items, filter, data) {
    return new Promise(async (resolve, reject) => {
      try {
        const collectionName = `${data._id.toString()}-${Math.floor(Math.random() * 10000)}`;
        const collection = db.addCollection(collectionName, { disableMeta: true });
        const insertionErrors = [];
        
        // Handle both array and single item cases
        const itemsToInsert = Array.isArray(items) ? items : [items];
        for (const item of itemsToInsert) {
          if (item !== undefined && item !== null) {
            if (typeof item === 'object') {
              try {
                collection.insert(item);
              } catch (insertError) {
                insertionErrors.push({
                  error: insertError.message,
                  item: item
                });
              }
            } else {
              insertionErrors.push({
                error: 'Filter component: item is not an object and cannot be filtered',
                item: item
              });
            }
          }
        }

        let resultFiltered = await this.filter(collection, filter, data);

        if (!Array.isArray(items)) {
          if(resultFiltered.length === 1) {
            resultFiltered = resultFiltered[0];
          } else {
            resultFiltered=undefined;
          }
        }
        
        // Attach errors to result if any occurred
        if (insertionErrors.length > 0) {
          resultFiltered = {
            filteredData: resultFiltered,
            errors: insertionErrors
          };
        }
        
        // console.log('___resultData', resultFiltered);
        db.removeCollection(collectionName);
        resolve(resultFiltered);
      } catch (e) {
        reject(e);
      }
    });
  }

  async filter(collection, filter, data) {
    return new Promise(async (resolve, reject) => {
      try {
        let resultData;
        if (filter.hasOwnProperty('$where')) {
          // Check if the filterResult only contains the '$where' property
          if (Object.keys(filter).length === 1) {
            // SECURITY: la condition $where (expression JS utilisateur) est
            // validée statiquement AVANT toute exécution (bloque process/require/
            // constructor/__proto__/structures de code...), puis évaluée dans le
            // eval-service (container isolé). `this` est réécrit en `obj`.
            //
            // Retour au comportement Loki d'origine : le code appelant ITÈRE sur
            // les items (boucle ci-dessous) et appelle le eval-service de façon
            // ATOMIQUE par item (variables.obj = item). Le container ne fait
            // qu'une évaluation à la fois — pas de boucle côté service.
            const whereCondition = filter['$where'].replace(/this/g, 'obj');
            validateExpression(whereCondition);
            const whereItems = collection.find({});
            const whereMatches = [];
            for (let i = 0; i < whereItems.length; i++) {
              const res = await runEvalInRemote(whereCondition, { obj: whereItems[i] });
              if (res == true) whereMatches.push(i);
            }
            resultData = whereMatches.map(i => whereItems[i]);
          } else {
            reject({ error: '$where have to be the only property when it is used' });
          }
        } else {
          resultData = collection.find(filter);
        }
        resultData = resultData.map(r => { delete r['$loki']; return r; });
        resolve(resultData);
      } catch (e) {
        reject(e);
      }
    });
  }

  async workWithFragments(data, flowData, pullParams, processId) {
    return new Promise(async (resolve, reject) => {
      try {
        // Get the input fragment and dfob
        const inputFragment = flowData[0].fragment;
        const inputDfob = flowData[0].dfob;
        const pathTable = [...inputDfob.dfobTable];

        // Parse filter string
        const filterString = data.specificData.filterString;
        const filter = JSON.parse(filterString);
        let onlyOneItem = undefined;
        if (! Array.isArray(inputFragment.data) ) {
          onlyOneItem = inputFragment.data;
        }
        //case when onlyOneItem is no clear. when a property have to be compare whith an other.
        const filterResult = await objectTransformation.execute(onlyOneItem, pullParams, filter);

        let rebuildData;
        const insertionErrors = [];
        if (inputFragment.branchFrag) {
          const collectionName = `${processId}-${data._id.toString()}`;
          const collection = db.addCollection(collectionName, { disableMeta: true });
          await fragment_lib.getWithResolutionByBranch(inputFragment, {
            deeperFocusActivated: true,
            pathTable: pathTable,
            callBackOnPath: async (item) => {
              // console.log('___item', item);
              if (item!==undefined && item!==null) {
                delete item['$loki'];
              }
              if (item!==undefined) {
                // Check if item is an object before inserting (LokiJS requires objects)
                if (typeof item === 'object' && item !== null) {
                  try {
                    collection.insert(item);
                  } catch (insertError) {
                    insertionErrors.push({
                      error: insertError.message,
                      item: item
                    });
                  }
                } else {
                  insertionErrors.push({
                    error: 'Filter component: item is not an object and cannot be filtered',
                    item: item
                  });
                }
              }
            }
          });
          rebuildData = await this.filter(collection, filterResult, data);
          // Attach errors to rebuildData if any occurred
          if (insertionErrors.length > 0) {
            rebuildData = {
              filteredData: rebuildData,
              errors: insertionErrors
            };
          }
          db.removeCollection(collectionName);
          // console.log('___out', out);
        } else {
          const inputData = inputFragment.data;
          rebuildData = await DfobProcessor.processDfobFlow(
            inputData,
            { pipeNb: inputDfob.pipeNb, dfobTable: inputDfob.dfobTable, keepArray: inputDfob.keepArray, delayMs: inputDfob.delayMs || 0 },
            this,
            this.filterRawItems,
            (items) => {
              return [items, filterResult, data];
            },
            async () => {
              return true;
            }
          );
          // console.log('___rebuildData', rebuildData);
        }


        // resultData = resultData.map(r => { delete r['$loki']; return r })

        await fragment_lib.persist(rebuildData, undefined, inputFragment);
        
        resolve();
      } catch (e) {
        // console.error(e);
        reject(e);
      }
    });
  }
}

module.exports = new Filter();
