'use strict'

class GoogleGetJson {
  constructor () {
    this.sheetrock = require('sheetrock')
  }

  makeRequest (key, select, offset, provider) {
    return new Promise((resolve, reject) => {
      // reject(new Error("fake"));
      try {
        this.sheetrock({
          url: 'https://docs.google.com/spreadsheets/d/' + key,
          reset: true,
          query: select,
          callback: function (error, options, response) {
            if (!error || error == null) {
              var cleanData = []

              for (var recordKey in response.raw.table.rows) {
                if (recordKey < offset) {
                  continue
                }
                var record = response.raw.table.rows[recordKey]
                var cleanRecord = {}
                cleanRecord.provider = provider
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
              let fullError = new Error(error)
              // error.message='google request failed, check your parameters : '+error.message;
              fullError.displayMessage = 'google request failed, check your parameters'
              reject(fullError)
            }
          }
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  pull (data) {
    return this.makeRequest(data.specificData.key, data.specificData.select, data.specificData.offset, data.specificData.provider)
  }
}
module.exports = new GoogleGetJson()