'use strict';

const xml2js = require('xml2js');
// var parser = new xml2js.Parser({attrkey: "attr", "trim": true});

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
  xml_traitment: _xml_traitment
};

function _xml_traitment(sourceXML) {
  return new Promise((resolve, reject) => {
  		xml2js.parseString(sourceXML, { attrkey: 'attr', 'trim': true }, (err, result) => {
    		resolve(result);
  		});
  });
}

