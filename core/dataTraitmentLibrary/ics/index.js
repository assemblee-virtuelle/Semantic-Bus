'use strict';
const ics = require('ics-to-json').default;
const {default : icalParser} = require('ical-js-parser');

module.exports = {
  icstojson: _icstojson,
  json_to_ics: _jsontoics,
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
  return new Promise((resolve, reject) => {
    try {
      const data = icalParser.toJSON(icsData);
      resolve(data);
    }catch(e){
      console.log(e);
      reject(e);
    }
  });
}

function _jsontoics(jsonData, header) {
  return new Promise((resolve, reject) => {
    try {
      const resultJSON = icalParser.toString(jsonData);
      resolve(resultJSON);
    }catch(e){
      console.log(e);
      resolve({
        error:{
          message: "Unable to parse the data, see https://www.npmjs.com/package/ical-js-parser and https://en.wikipedia.org/wiki/ICalendar",
          libMessage : e.message
        }
      });
    }
  });
}
