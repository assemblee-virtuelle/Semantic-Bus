var exel = require('../exel/exel_traitment.js');
var rdf = require('../rdf/rdf_traitment.js');
var xml = require('../xml/xml_traitment.js');
var csv = require('../csv/csv_traitment.js');
var ics = require('../ics/index.js');
var zlib = require('zlib');

module.exports = {
  type_file: _type_file,
  buildFile: _buildFile
};

function _extension(filename, contentType) {
  // console.log("contentType", contentType)
  // console.log("filename", filename)
  return new Promise(function(resolve, reject) {
    // console.log('filename', filename);
    if (filename != null) {
      //console.log(filename.match(reg)[0])
      //let matchArray=filename.match(reg);
      //console.log(filename.match(reg));
      var regex = /\.([^\.]*)/g;
      let matches = filename.match(regex);
      // var reg = new RegExp(regex, 'g');
      // let regResult = reg.exec(filename)
      let extention = matches.pop();
      extention = extention.replace(';', '').replace('.', '')
      resolve(extention);
    } else {
      if (contentType) {
        //console.log(contentType)
        //resolve(contentType)
        var regex = /\/(.+)/g;
        var reg = new RegExp(regex, 'g');
        let regResult = reg.exec(contentType)
        resolve(regResult.pop())
      } else {
        reject()
      }
    }
  })
}

function _buildFile(filename, dataString, dataBuffer, out, contentType) {
  return _extension(undefined, contentType).then(function(extension) {
    // console.log("extension |", extension)
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
  })
}

function _type_file(filename, dataString, dataBuffer, out, contentType) {
  //console.log("in aggregate function")
  return _extension(filename, contentType).then(function(extension) {
    // console.log(extension);
    return new Promise(function(resolve, reject) {
      if (out == true || out == 'true') {
        //console.log(out)
        switch (extension) {

          case ("xlsx"):
            //console.log('ALLO');
            resolve(exel.json_to_exel(JSON.parse(dataString)))
            // let ws = exel.json_to_exel(JSON.parse(dataString))
            // let wb = XLSX.utils.book_new();
            // XLSX.utils.book_append_sheet(wb, ws, "People");
            break;
          default:
            //console.log("in default")
            reject("erreur, votre fichier n'est pas au bon format " + extension)

            break;
        }

      } else {

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

            _type_file(newFileName, newString, newBuffer).then((result) => {
              resolve({
                data: result.data
              })
            }, (err)=> {
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
              data: JSON.parse(dataString)
            })
            break;

            // RDF TTL DONE
          case ("ttl"):
            rdf.rdf_traitmentTTL(dataString).then((result) => {
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
            rdf.rdf_traitmentXML(dataString).then(result => {
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
            xml.xml_traitment(dataString).then(function(reusltat) {
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
            csv.csvtojson(dataString).then((result) => {
              // //console.log("FINAL", reusltat)
              //console.log("FINAL", reusltat)
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
            ics.icstojson(dataString).then((result) => {
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
      }
    })
  })
}
