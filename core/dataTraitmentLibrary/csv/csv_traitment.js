'use strict';
var csv = require('csvtojson');

module.exports = {
  csvtojson: _csvtojson,
};


// --------------------------------------------------------------------------------

function decode_utf8(s) {
  //console.log("in decode",s)
  try {
    return decodeURIComponent(escape(s))
  } catch (e) {
    return s
  }
}

function _csvtojson(data, extractionParams) {
  // console.log('extractionParams', extractionParams);
  return new Promise((resolve, reject) => {
    // console.log(  csv({
    //     noheader: true,
    //     delimiter: "auto"
    //   }).fromString(data));
    const delimiter = extractionParams?.delimiter || "auto";
    try {
      csv({
        noheader: true,
        delimiter: delimiter
      }).fromString(data).then(jsonObj=>{
        resolve(jsonObj);
      }).catch(e=>{
        reject(e);
      })
    }catch(e){
      reject(e);
    }
  });
}
