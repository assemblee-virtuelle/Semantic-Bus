'use strict'

class GoogleGetJson {
  constructor () {
    this.sheetrock = require('sheetrock');
    this.stringReplacer = require('../utils/stringReplacer.js');
  }

  makeRequest (specificData, flowData, queryParams) {
    return new Promise((resolve, reject) => {
      // reject(new Error("fake"));
      try {
        let url = this.stringReplacer.execute(specificData.key, queryParams, flowData?flowData[0].data:undefined);
        if (!url.startsWith('http')){
          url= 'https://docs.google.com/spreadsheets/d/' + url
        }
        // console.log('url',url);
        this.sheetrock({
          url: url,
          reset: true,
          query: specificData.select,
          callback: function (error, options, response) {
            if (!error || error == null) {
              var cleanData = []

              for (var recordKey in response.raw.table.rows) {
                if (recordKey < specificData.offset) {
                  continue
                }
                var record = response.raw.table.rows[recordKey]
                var cleanRecord = {}
                cleanRecord.provider = specificData.provider
                for (var cellKey in record.c) {
                  var cell = record.c[cellKey]
                  var column = response.raw.table.cols[cellKey].id || cellKey

                  if (cell != undefined && cell != null) {
                    cleanRecord[column] = cell.v
                  }
                }
                cleanData.push(cleanRecord)
              }

              resolve({
                data: cleanData
              })
            } else {
              console.log(error);
              let fullError = new Error(error)
              // error.message='google request failed, check your parameters : '+error.message;
              fullError.displayMessage = 'google request failed, check your parameters'
              reject(fullError)
            }
          }
        })
      } catch (e) {
        console.log(e);
        reject(e)
      }
    })
  }

  pull (data, flowData, queryParams) {
    return this.makeRequest(data.specificData, flowData, queryParams)
  }
}
module.exports = new GoogleGetJson()
