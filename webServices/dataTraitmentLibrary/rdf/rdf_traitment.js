
var RdfXmlParser =  require('rdf-parser-rdfxml');
var JsonLdSerializer = require('rdf-serializer-jsonld');
var N3Parser =  require('rdf-parser-n3');


module.exports = {
  rdf_traitmentXML: _rdf_traitmentXML,
  rdf_traitmentTTL: _rdf_traitmentTTL,
  rdf_traitmentJSONLD: _rdf_traitmentJSONLD
};

// --------------------------------------------------------------------------------

const serializer = new JsonLdSerializer({outputFormat: 'string', compact: false});
const parser = new RdfXmlParser();
const n3Parser = new N3Parser()


function _rdf_traitmentXML (dataXML) {
  let n3Tab = []
  return new Promise(function(resolve,reject){
    new Promise(function (resolve, reject) {
      parser.process(dataXML, function (n3) {
        n3Tab.push(n3)
        resolve(n3Tab)
      })
    }).then(function (n3T) {
      serializer.serialize(n3T).then(function (jsonld) {
        resolve(jsonld)
      })
    })
  })
}

function _rdf_traitmentJSONLD (dataJSON) {
  serializer.serialize(dataJSON).then(function (jsonld) {
    console.log(jsonld)
    resolve(jsonld)
  })
}


function _rdf_traitmentTTL(dataTTL) {
    let n3Tab = []
    console.log(dataTTL)
    return new Promise(function(resolve,reject){
      new Promise(function (resolve, reject) {
        n3Parser.process(dataTTL, function (n3) {
          n3Tab.push(n3)
          resolve(n3Tab)
        })
      }).then(function (n3T) {
      serializer.serialize(n3T).then(function (jsonld) {
        resolve(jsonld)
      })
    })
  })
 }

function _rdf_traitmentRDFA (dataHTMLRDFA) {
  ///EN COUR DE DEV
} 


////commentaires////


//// DBPEDIA  PB ==> http://dbpedia.org/resource/Eiffel_Tower PROXY pour format ttl je pense 
//redirection  vers  http://dbpedia.org/page/Eiffel_Tower qui est rdfa et qui ne peux pas ce convertir en n3 du a probleme de lib //
// ISSUE RDF-EXT :  https://github.com/rdf-ext/rdf-parser-rdfxml/issues/1 ///