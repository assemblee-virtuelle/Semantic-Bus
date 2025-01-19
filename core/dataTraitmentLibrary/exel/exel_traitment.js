'use strict';
var XLSX = require('xlsx')
const ExcelJS = require('exceljs');
const { Readable } = require('stream');

module.exports = {
  exel_traitment_server: _exel_traitment_server,
  exel_traitment_client: _exel_traitment_client,
  json_to_exel: _json_to_exel,
  exel_to_json: _exel_to_json,
  exel_to_json_stream: _exel_to_json_stream
};


// --------------------------------------------------------------------------------


function _exel_traitment_client(urlEXEL) {
  //console.log("urlEXEL", urlEXEL)
  return new Promise(function(resolve, reject) {
    var buffer = Buffer.concat(urlEXEL);
    try {
      var exel = XLSX.read(buffer, {
        type: "buffer"
      });
      resolve({
        data: exel.Sheets
      });
    } catch (e) {
      reject(e);
    }
  })
}

function _json_to_exel(jsonData, header) {
  //return XLSX.utils.json_to_sheet(jsonData, {header: header});
  let ws = XLSX.utils.json_to_sheet(jsonData, {
    header: header
  })
  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "data");
  const wopts = {
    bookType: 'xlsx',
    bookSST: false,
    type: 'buffer'
  };
  let buffer = XLSX.write(wb, wopts);
  return buffer;
}

function _exel_to_json(buffer, header) {
  return new Promise((resolve, reject) => {
    try {
      // Calculate and log the buffer size
      const bufferSizeInMB = (buffer.length / (1024 * 1024)).toFixed(2);
      console.log("Buffer size :", bufferSizeInMB, "MB");
      // Create stream reader with options
      const wb = XLSX.read(buffer, {
        type: 'buffer'
      });

      const sheetsData = wb.SheetNames.map(sheetName => {
        const sheet = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);
        return {
          name: sheetName,
          data: rows
        };
      });
      resolve(sheetsData);


    } catch (error) {
      reject(error);
    }
  });
}

function decode_utf8(s) {
  //console.log("in decode",s)
  try {
    return decodeURIComponent(escape(s))
  } catch (e) {
    return s
  }
}

function _exel_traitment_server(data, uploadBoolean) {
  //console.log("_exel server traitment initiliaze")
  var final_tab = []
  var count_table = []
  var regnumero = /[0-9].*/g
  var regLettre = /.*[a-zA-Z]/g
  var i = 0
  return new Promise((resolve, reject) => {
    for (var sheets in data) {
      var cellContent = [];
      for (var sheet in data[sheets]) {
        for (var st in data[sheets][sheet]) {
          //console.log("in data", data[sheets][sheet][st].v)
          var cell = {
            [st]: decode_utf8(data[sheets][sheet][st].v),
            feuille: Object.keys(data[sheets])[0]
          }
          cellContent.push(cell)
        }
      }
      final_tab.push({
        feuille: {
          name: Object.keys(data[sheets])[0],
          content: cellContent
        }
      })
    }
    //console.log("final_tab", final_tab)
    resolve(
      final_tab
    )
  }).then(function(feuilles) {
    // //console.log(feuilles)
    return new Promise(function(resolve, reject) {
      var result = []
      feuilles.forEach(function(feuille) {
        var exel_table_to_json = [];
        var cell = {};
        if (feuille) {
          feuille.feuille.content.forEach(function(content, index) {
            if (content.feuille == feuille.feuille.name) {

              if (feuille.feuille.content[index + 1]) {
                if (Object.keys(content)[0].match(regnumero) != null && Object.keys(feuille.feuille.content[index + 1])[0].match(regnumero) != null) {
                  var val = Object.keys(content).map(function(key) {
                    return content[key];
                  });
                  if (Object.keys(content)[0].match(regnumero)[0] < Object.keys(feuille.feuille.content[index + 1])[0].match(regnumero)[0]) {
                    var c = {}
                    //console.log(val[0]);
                    c[Object.keys(content)[0].match(regLettre)[0]] = val[0]
                    Object.assign(cell, c);
                    exel_table_to_json.push(cell)
                    cell = {}
                  } else {
                    var c = {}
                    c[Object.keys(content)[0].match(regLettre)[0]] = val[0]
                    Object.assign(cell, c);
                  }
                } else {
                  var val = Object.keys(content).map(function(key) {
                    return content[key];
                  });
                  var c = {}
                  c[Object.keys(content)[0].match(regLettre)[0]] = val[0]
                  Object.assign(cell, c);
                  exel_table_to_json.push(cell)
                }
              }
            }
          })
        }
        result.push({
          sheet: feuille.feuille.name,
          data: exel_table_to_json
        })
        resolve(result)
      })
    })
  })
}

/**
 * Converts an Excel buffer to JSON using streaming.
 * @param {Buffer} buffer - The Excel file buffer.
 * @param {Object} [options={}] - Options for processing.
 * @param {boolean} [options.firstLineAsHeader=false] - Use the first line as headers.
 * @param {boolean} [options.useColumnLetters=false] - Use column letters as property names.
 * @returns {Promise<Array<Object|Array>>} - A promise that resolves to the JSON representation of the Excel data.
 */
async function _exel_to_json_stream(buffer, options = {}) {
  const workbook = new ExcelJS.stream.xlsx.WorkbookReader();
  const sheetsData = [];

  return new Promise((resolve, reject) => {
    let currentSheet = null;
    let headers = [];
    workbook.on('error', (err) => {
      console.error('WorkbookReader error:', err);
      reject(err);
    });

    workbook.on('worksheet', (worksheet) => {
      currentSheet = {
        name: worksheet.name,
        data: []
      };

      worksheet.on('row', (row) => {
        // Priority to firstLineAsHeader
        if (options.firstLineAsHeader && row.number === 1) {
          headers = row.values.slice(1).map(value => String(value).trim());
          return; // Skip processing the header row as data
        }

        let rowData = {};

        if (options.firstLineAsHeader) {
          row.eachCell((cell, colNumber) => {
            const headerName = headers[colNumber - 1] || `Column${colNumber}`;
            rowData[headerName] = cell.value;
          });
        } else if (options.useColumnLetters) {
          row.eachCell((cell, colNumber) => {
            const columnLetter = getExcelAlpha(colNumber);
            rowData[columnLetter] = cell.value;
          });
        } else {
          // If no options are set, use an array of cell values
          rowData = row.values.slice(1);
        }

        currentSheet.data.push(rowData);
      });

      worksheet.on('finished', () => {
        sheetsData.push(currentSheet);
        currentSheet = null;
        headers = []; // Reset headers for the next sheet
      });
    });

    workbook.on('end', () => {
      resolve(sheetsData);
    });

    // Convert the buffer into a readable stream
    const stream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      }
    });

    workbook.read(stream);
  });
}

// Utility function to convert column number to letter
function getExcelAlpha(colNumber) {
  let dividend = colNumber;
  let columnName = '';
  let modulo;

  while (dividend > 0) {
    modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    dividend = Math.floor((dividend - modulo) / 26);
  }

  return columnName;
}
