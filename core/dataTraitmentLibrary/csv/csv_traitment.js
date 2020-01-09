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

function _csvtojson(data) {
  // console.log("CSV CSV CSV CSV");
  return new Promise((resolve, reject) => {
    // console.log(  csv({
    //     noheader: true,
    //     delimiter: "auto"
    //   }).fromString(data));
    try {
      csv({
        noheader: true,
        delimiter: "auto"
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
