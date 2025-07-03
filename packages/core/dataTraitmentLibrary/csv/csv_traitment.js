'use strict';
const csv = require('csvtojson');
const { Parser } = require('@json2csv/plainjs');

module.exports = {
  csvtojson: _csvtojson,
  json_to_csv: _json_to_csv
};


// --------------------------------------------------------------------------------

function decode_utf8(s) {
  // console.log("in decode",s)
  try {
    return decodeURIComponent(escape(s));
  } catch (e) {
    return s;
  }
}

function _csvtojson(data, extractionParams) {
  // console.log('extractionParams', extractionParams);
  return new Promise((resolve, reject) => {
    // console.log(  csv({
    //     noheader: true,
    //     delimiter: "auto"
    //   }).fromString(data));
    const delimiter = extractionParams?.delimiter || 'auto';
    try {
      csv({
        noheader: true,
        delimiter: delimiter
      }).fromString(data).then(jsonObj => {
        resolve(jsonObj);
      }).catch(e => {
        reject(e);
      });
    }catch(e) {
      reject(e);
    }
  });
}

function _json_to_csv(data, extractionParams) {
  return new Promise((resolve, reject) => {
    const delimiter = extractionParams?.delimiter || ',';
    try {
      // Define fields based on the first object in data array
      // or use fields from extractionParams if provided
      const fields = extractionParams?.fields ||
                      (data && data.length > 0 ? Object.keys(data[0]) : []);

      const opts = {
        fields,
        delimiter
      };

      const parser = new Parser(opts);
      const csvString = parser.parse(data);

      // Convert the CSV string to a Buffer before resolving
      const csvBuffer = Buffer.from(csvString);
      resolve(csvBuffer);
    } catch (e) {
      reject(e);
    }
  });
}

