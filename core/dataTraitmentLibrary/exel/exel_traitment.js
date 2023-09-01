'use strict';
var XLSX = require('xlsx')


module.exports = {
  exel_traitment_server: _exel_traitment_server,
  exel_traitment_client: _exel_traitment_client,
  json_to_exel: _json_to_exel,
  exel_to_json: _exel_to_json
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

  //console.log('ALLO');
  return new Promise((resolve, reject) => {
    try {

      let wb = XLSX.read(buffer, {
        type: "buffer"
      });


      let out = [];
      for (let ws in wb.Sheets) {
        // console.log('ws',wb.Sheets[ws]);
        let json = XLSX.utils.sheet_to_json(wb.Sheets[ws], {
          header: 'A'
        });

        out.push({
          name: ws,
          data: json
        });
      }
      resolve(out);
    } catch (e) {
      reject(e);
    } finally {

    }

  })
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
