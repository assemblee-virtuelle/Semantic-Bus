'use strict';
var XLSX = require('xlsx')

module.exports = {
  exel_traitment_server: _exel_traitment_server,
  exel_traitment_client: _exel_traitment_client
};


// --------------------------------------------------------------------------------


function _exel_traitment_client (urlEXEL, callback){
	return new Promise(function(resolve, reject){
	  var buffer = Buffer.concat(urlEXEL);
	  var exel = XLSX.read(buffer, {type:"buffer"});
	  // console.log(exel.Sheets)
	  resolve({data: exel.Sheets})
	})
}

function _exel_traitment_server (data, uploadBoolean){
	console.log("_exel server traitment initiliaze")
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
			  	console.log(st)
			    var cell = {
			      [st]: data[sheets][sheet][st].v,
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
	console.log("final_tab", final_tab)
	resolve(
	  final_tab
	)
	}).then(function (feuilles) {
		// console.log(feuilles)
		return new Promise (function(resolve, reject){
		    var result = []
		    feuilles.forEach(function (feuille) {
		      var exel_table_to_json = [];
		      var cell = {};
		      feuille.feuille.content.forEach(function (content, index) {
		        if (content.feuille == feuille.feuille.name) {
		        	// console.log(content)
		          if (feuille.feuille.content[index + 1]) {
		            if (Object.keys(content)[0].match(regnumero) != null && Object.keys(feuille.feuille.content[index + 1])[0].match(regnumero) != null) {
		              // console.log(Object.keys(content)[0].match(regnumero)[0],  Object.keys(feuille.feuille.content[index + 1])[0].match(regnumero)[0])
		              // console.log(parseInt(Object.keys(content)[0].match(regnumero)[0]) <  parseInt(Object.keys(feuille.feuille.content[index + 1])[0].match(regnumero)[0]))
		              var val = Object.keys(content).map(function(key) {
		                  return content[key];
		              });
		              if (Object.keys(content)[0].match(regnumero)[0] < Object.keys(feuille.feuille.content[index + 1])[0].match(regnumero)[0]) {
		                var c = {}
		                console.log(val[0]);
		                // console.log(Object.values(content)[0])
		                c[Object.keys(content)[0].match(regLettre)[0]] = val[0]
		                Object.assign(cell, c);
		                // console.log(cell)
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
		              // console.log("cas unicité 1")
		              // console.log(content)
		              var c = {}
		              c[Object.keys(content)[0].match(regLettre)[0]] = val[0]
		              Object.assign(cell, c);
		              exel_table_to_json.push(cell)
		            }
		          }
		        }
		      })
		      result.push({sheet:  feuille.feuille.name, data: exel_table_to_json})
		      resolve(result)
		    })
		})
	})
}
