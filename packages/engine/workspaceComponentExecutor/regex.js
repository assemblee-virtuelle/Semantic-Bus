'use strict';
const { runRegexInWorker } = require('../utils/evalSecurity.js');
class Regex {
  constructor () {
    this.objectTransformation = require('../utils/objectTransformationV2.js');
  }
  pull (data, flowData, pullParams) {
    return new Promise((resolve, reject) => {
      try {
        const flowDataPrimary = flowData[0].data;
        if(Array.isArray(flowDataPrimary)){
          throw new Error('input data can not be an array');
        }
        if(flowDataPrimary === undefined){
          throw new Error('input data can not be undefined');
        }
        // SÉCURITÉ (point 3 / ReDoS) : le motif specificData.regex (utilisateur)
        // est appliqué via un worker_threads TERMINABLE avec limites de longueur
        // et timeout. Un motif catastrophique (backtracking exponentiel) ne peut
        // plus bloquer indéfiniment le process engine.
        runRegexInWorker(data.specificData.regex, 'gm', flowDataPrimary)
          .then((result) => {
            resolve({ data: result });
          })
          .catch((e) => {
            reject(e);
          });
      } catch (e) {
        reject (e)
      }
    })
  }
}
module.exports = new Regex()
