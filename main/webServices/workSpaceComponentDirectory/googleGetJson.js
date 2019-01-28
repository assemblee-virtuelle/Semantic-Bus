'use strict'
module.exports = {
  type: 'Google Sheets',
  description: 'Interroger une feuille de calcule Google Sheets qui fournit un flux JSON.',
  editor: 'google-get-json-editor',
  graphIcon: 'Google_sheets.png',
  tags: [
    'http://semantic-bus.org/data/tags/inComponents',
    'http://semantic-bus.org/data/tags/APIComponents'
  ],
  //  url: require('url'),
  //  http: require('http'),
  sheetrock: require('sheetrock'),

  makeRequest: function (key, select, offset, provider) {
    return new Promise((resolve, reject) => {
      // reject(new Error("fake"));
      try {
        // console.log('ALLO',key);
        this.sheetrock({
          url: 'https://docs.google.com/spreadsheets/d/' + key,
          reset: true,
          query: select,
          callback: function (error, options, response) {
            // console.log('callback sheetrock',error,options,response);
            if (!error || error == null) {
              var cleanData = []

              for (var recordKey in response.raw.table.rows) {
                if (recordKey < offset) {
                  continue
                }
                var record = response.raw.table.rows[recordKey]
                // console.log('record',record);
                var cleanRecord = {}
                cleanRecord.provider = provider
                for (var cellKey in record.c) {
                  var cell = record.c[cellKey]
                  var column = response.raw.table.cols[cellKey].id || cellKey
                  //  console.log('column',column);
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
              // console.log('Google query rejected | ', error);
              // console.log('error',error);
              let fullError = new Error(error)
              // error.message='google request failed, check your parameters : '+error.message;
              fullError.displayMessage = 'google request failed, check your parameters'
              reject(fullError)
            }
          }
        })
      } catch (e) {
        // console.log('ERROR');
        // console.log(e);
        reject(e)
      }
    })
  },
  pull: function (data) {
    // console.log('GOOGLE Get JSON | pull : ', data);
    return this.makeRequest(data.specificData.key, data.specificData.select, data.specificData.offset, data.specificData.provider)
    /* this.makeRequest('GET', data.specificData.url).then(data => {
      //console.log('ALLO', data);
      res.json(data);
    }); */
    /*    res.json({
          url: data.url
        }); */
  }
}
