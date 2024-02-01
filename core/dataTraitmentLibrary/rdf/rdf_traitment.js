// --------------------------------------------------------------------------------
// TODO =>
// changer les packages importés obsoletes 
// remplacer rdf-parser-rdfxml voir même jsonld-streaming-parser
// --------------------------------------------------------------------------------

// var RdfXmlParser =  require('rdf-parser-rdfxml');
// var JsonLdSerializer = require('rdf-serializer-jsonld');
var N3Parser =  require('rdf-parser-n3');

// const jsonld = require('jsonld');
// const N3 = require('n3');
// const rdflib = require('rdflib');
// const rdfTranslator = require('rdf-translator');
const { Readable } = require("stream")
const JsonLdParser = require("jsonld-streaming-parser").JsonLdParser;
const xml_scribe = require('@graphy/content.xml.scribe');
const factory = require('@graphy/core.data.factory');


module.exports = {
  rdf_traitmentXML: _rdf_traitmentXML,
  rdf_traitmentTTL: _rdf_traitmentTTL,
  rdf_traitmentJSONLD: _rdf_traitmentJSONLD,
  json_to_rdf : _json_to_rdf
};

// --------------------------------------------------------------------------------

// const serializer = new JsonLdSerializer({outputFormat: 'string', compact: false});
// const parser = new RdfXmlParser();
const n3Parser = new N3Parser()


function _rdf_traitmentXML (dataXML) {
  // let n3Tab = []
  // return new Promise(function(resolve,reject){
  //   new Promise(function (resolve, reject) {
  //     parser.process(dataXML, function (n3) {
  //       n3Tab.push(n3)
  //       resolve(n3Tab)
  //     })
  //   }).then(function (n3T) {
  //     serializer.serialize(n3T).then(function (jsonld) {
  //       resolve(jsonld)
  //     })
  //   })
  // })
  //   .catch((error) => {
  //       console.error('Error parsing RDF/XML:', error);
  //   });
}

function parseRDF(dataXML) {
  // return new Promise((resolve, reject) => {
  //     const readableStream = Readable.from([dataXML]);
  //     const triples = [];
  //     parser.import(readableStream, (triple) => {
  //         triples.push(triple);
  //     }, (error) => {
  //         if (error) {
  //             reject(error);
  //         } else {
  //             resolve(triples);
  //         }
  //     });
  // });
}

function _rdf_traitmentJSONLD (dataJSON) {
  serializer.serialize(dataJSON).then(function (jsonld) {
    //console.log(jsonld)
    resolve(jsonld)
  })
}


function _rdf_traitmentTTL(dataTTL) {
    let n3Tab = []
    //console.log(dataTTL)
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
  // EN COURS DE DEV
}

async function _json_to_rdf (jsonData, header){
  let rdfSerialise = new Promise(async (resolve,reject)=>{
    let result=''

    const myParser = new JsonLdParser();
    const myTextStream = Readable.from(JSON.stringify(jsonData))
    let ds_scriber = xml_scribe({
      prefixes: jsonData['@context'],
    });
    ds_scriber.on('data',(data)=>{
      result=result.concat(data.toString())
    })
    ds_scriber.on('end',(data)=>{
      resolve(result);
    })

    myParser.import(myTextStream)
      .on('data', (quad)=>{
        let object;
        if(quad.object.termType==="Literal"){
          object = factory.literal(quad.object.value,quad.object.language)
        }else if (quad.object.termType==="NamedNode") {
          object = factory.namedNode(quad.object.value);
        }
        ds_scriber.write(factory.quad(...[
          factory.namedNode(quad.subject.value),
          factory.namedNode(quad.predicate.value),
          object,
        ]));
      })
      .on('error', error=>{
        reject(error)
      })
      .on('end', () => {
        ds_scriber.end()
      });
  });
  return await rdfSerialise;
}



//commentaires//

// DBPEDIA  PB ==> http://dbpedia.org/resource/Eiffel_Tower PROXY pour format ttl je pense
// redirection  vers  http://dbpedia.org/page/Eiffel_Tower qui est rdfa et qui ne peux pas ce convertir en n3 du a probleme de lib //
