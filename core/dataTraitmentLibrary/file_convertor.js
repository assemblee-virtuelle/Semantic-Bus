var exel = require('./exel/exel_traitment.js');
var rdf = require('./rdf/rdf_traitment.js');
var xml = require('./xml/xml_traitment.js');
var csv = require('./csv/csv_traitment.js');
var ics = require('./ics/index.js');
var zlib = require('zlib');

module.exports = {
  data_from_file: _data_from_file,
  buildFile: _buildFile
};

function _extension(filename, contentType) {
  if (filename != null) {
    var regex = /\.(\w*)/g;
    let matches = filename.match(regex);
    let extention = matches.pop();
    extention = extention.replace(';', '').replace('.', '')
    return extention;
  } else if (contentType) {
    var regex = /\/(.+)/g;
    var reg = new RegExp(regex, 'g');
    let regResult = reg.exec(contentType)
    return regResult.pop()
  } else {
    throw new Error('filename or contentType have to be set');
  }
}

function _buildFile(filename, dataString, dataBuffer, out, contentType) {
  const extension = _extension(undefined, contentType);
  return new Promise(function(resolve, reject) {
    switch (extension) {
      case ("vnd.ms-excel"):
      case ("xlsx"):
        resolve(exel.json_to_exel(JSON.parse(dataString)));
        break;
      case ("rdf+xml"):
        //console.log('ALLO');
        resolve(rdf.json_to_rdf(JSON.parse(dataString)));
        break;
      default:
        //console.log("in default")
        reject("erreur, votre fichier n'est pas au bon format");
        break;
    }
  })

}

function _data_from_file(filename, dataBuffer, contentType) {
  //console.log("in aggregate function")
  const extension= _extension(filename, contentType);

  return new Promise(function(resolve, reject) {
    switch (extension) {

      // GZ decompression
      case("gz"):
        // decompression of a data buffer with Gunzip
        const newBuffer = zlib.gunzipSync(dataBuffer);
        // the file in a decompressed string
        const newString = newBuffer.toString('utf-8');
        // we remove the .gz at the end of the name of the file so that
        // we can find the right file's extension type
        const newFileName = filename.substring(filename, filename.length-3);

        _data_from_file(newFileName, newString, newBuffer).then((result) => {
          resolve({
            data: result.data
          })
        }).catch(err=> {
          reject("Il y a eu un problème après la décompression du fichier : " + err)
        })
        break;

      // JSONLD ///JSON //DONE
      case ("json"):
      case ("json-ld"):
      case ("umap"):
      case ("geojson"):
        //console.log()
        resolve({
          data: JSON.parse(dataBuffer.toString())
        })
        break;

        // RDF TTL DONE
      case ("ttl"):
        rdf.rdf_traitmentTTL(dataBuffer.toString()).then((result) => {
          //console.log(reusltat)
          resolve({
            data: result
          })
        }, function(err) {
          reject("votre fichier n'est pas au norme ou pas du bon format " + extension)
        })
        break;

        // RDF XML DONE IF TEST PARSE
      case ("rdf"):
      case ("owl"):
        rdf.rdf_traitmentXML(dataBuffer.toString()).then(result => {
          // console.log("RDF", result)
          //console.log(JSON.stringify(reusltat))
          resolve(result)
        }, function(err) {
          reject("votre fichier n'est pas au norme ou pas du bon format " + extension)
        })
        break;

        // EXEL/CSV/XLSX DONE
      case ("xls"):
      case ("xlsx"):
      case ("ods"):
        //console.log('ALLO3');
        exel.exel_to_json(dataBuffer).then((resultat) => {
          //console.log("RESULTAT", resultat)
          resolve({
            data: resultat
          })
          // exel.exel_traitment_server(resultat, true).then(function(exelTraite) {
          //   //console.log("FINAL", exelTraite)
          //   resolve({
          //     data: exelTraite
          //   })
          // })
        }, function(err) {
          console.log(err);
          reject("votre fichier n'est pas au norme ou pas du bon format " + extension)
        })
        break;

        // XML DONE
      case ("xml"):
      case ("kml"):
        xml.xml_traitment(dataBuffer.toString()).then(function(reusltat) {
          // //console.log("FINAL", reusltat)
          //console.log("FINAL", reusltat)
          resolve({
            data: reusltat
          })
        }, function(err) {
          reject("votre fichier n'est pas au norme ou pas du bon format " + extension)
        })
        break;
      case ("csv"):
        csv.csvtojson(dataBuffer.toString()).then((result) => {
          // //console.log("FINAL", reusltat)
          // console.log("result", result)
          resolve({
            data: result
          })
        }, function(err) {
          console.log('err', err);
          reject("votre fichier n'est pas au norme ou pas du bon format " + extension)
        })
        break;
      case ("ics"):
      case ("calendar"):
        ics.icstojson(dataBuffer.toString()).then((result) => {
          // //console.log("FINAL", reusltat)
          //console.log("FINAL", reusltat)
          resolve({
            data: result
          })
        }, function(err) {
          // console.log('err', err);
          reject("votre fichier n'est pas au norme ou pas du bon format " + extension)
        })
        break;
      default:
        //console.log("in default")
        reject("erreur, le format du fichier n'est pas supporté (" + extension + ")")

        break;
    }
    
  })

}
