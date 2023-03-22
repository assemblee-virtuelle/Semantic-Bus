'use strict';
var ics = require('ics-to-json').default;

module.exports = {
  icstojson: _icstojson,
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

function _icstojson(icsData) {
  // console.log(icsData);
  // console.log('ics',ics);
  return new Promise((resolve, reject) => {
    try {
      const data = ics(icsData);
      resolve(data);
    }catch(e){
      console.log(e);
      reject(e);
    }
  });
}
