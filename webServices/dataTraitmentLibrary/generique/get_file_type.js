var exel = require('../exel/exel_traitment.js');
var rdf = require('../rdf/rdf_traitment.js');
var xml = require('../xml/xml_traitment.js');

module.exports = {
  type_file: _type_file,
};




function _extension(filename, contentType) {
  return new Promise(function (resolve, reject) {
    var regex = /\.([^.]+)/g;
    var reg = new RegExp(regex, 'g');
    if (filename != null) {
      console.log(filename.match(reg)[0])
      resolve(filename.match(reg)[0])
    } else {
      if (contentType) {
        console.log(contentType)
        resolve(contentType)
      } else {
        resolve(false)
      }
    }
  })
}

function _type_file(filename, dataString, dataBuffer, out, api) {
  console.log("in aggregate function", out)
  return _extension(filename).then(function (extension) {
    console.log("extension |", extension)
    return new Promise(function (resolve, reject) {
      if (out == true || out == 'true') {
        resolve({
          data: exel.json_to_exel(dataString)
        })
      } else {
        switch (extension) {
          // JSONLD ///JSON //DONE
          case (".json" || ".json-ld"):
            resolve({
              data: JSON.parse(dataString)
            })
            break;

            // RDF TTL DONE
          case (".ttl"):
            rdf.rdf_traitmentTTL(dataString).then(function (reusltat) {
              console.log(reusltat)
              resolve({
                data: reusltat
              })
            }, function (err) {
              return "votre fichier n'est pas au norme ou pas du bon format, n'hesitez pas a verifier que votre source d'entrée est bien une String"
            })
            break;

            // RDF XML DONE IF TEST PARSE
          case (".rdf"):
            rdf.rdf_traitmentXML(dataString).then(function (reusltat) {
              console.log("RDF", reusltat)
              console.log(JSON.stringify(reusltat))
              resolve({
                data: reusltat
              })
            }, function (err) {
              return "votre fichier n'est pas au norme ou pas du bon format, n'hesitez pas a verifier que votre source d'entrée est bien une String"
            })
            break;

            // EXEL/CSV/XLSX DONE
          case (".xlsx"):
          case (".csv"):
          case (".ods"):
            exel.exel_traitment_client(dataBuffer).then(function (resultat) {
              console.log("RESULTAT", resultat)
              exel.exel_traitment_server(resultat, true).then(function (exelTraite) {
                console.log("FINAL", exelTraite)
                resolve({
                  data: exelTraite
                })
              })
            }, function (err) {
              return "votre fichier n'est pas au norme ou pas du bon format, n'hesitez pas a verifier que votre source d'entrée est bien un buffer"
            })
            break;

            // XML DONE
          case (".xml"):
            xml.xml_traitment(dataString).then(function (reusltat) {
              // console.log("FINAL", reusltat)
              console.log("FINAL", reusltat)
              resolve({
                data: reusltat
              })
            }, function (err) {
              return "votre fichier n'est pas au norme ou pas du bon format, n'hesitez pas a verifier que votre source d'entrée est bien une String"
            })
            break;
        }
      }
    })
  })
}