var exel = require('../exel/exel_traitment.js');
var rdf = require('../rdf/rdf_traitment.js');
var xml = require('../xml/xml_traitment.js');
var csv = require('../csv/csv_traitment.js');

module.exports = {
  type_file: _type_file,
  buildFile: _buildFile
};




function _extension(filename, contentType) {
  console.log("contentType", contentType)
  console.log("filename", filename)
  return new Promise(function(resolve, reject) {

    if (filename != null) {
      //console.log(filename.match(reg)[0])
      //let matchArray=filename.match(reg);
      //console.log(filename.match(reg));
      var regex = /\.([^\.]*)/g;
      let matches = filename.match(regex);
      // var reg = new RegExp(regex, 'g');
      // let regResult = reg.exec(filename)
      let extention =matches.pop();
      extention = extention.replace(';','').replace('.','')
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
        //console.log('ALLO');
          resolve(exel.json_to_exel(JSON.parse(dataString)));
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
            reject("erreur, votre fichier n'est pas au bon format "+extension)

            break;
        }

      } else {

        switch (extension) {
          // JSONLD ///JSON //DONE
          case ("json"):
          case ("json-ld"):
            //console.log()
            resolve({
              data: JSON.parse(dataString)
            })
            break;

            // RDF TTL DONE
          case ("ttl"):
            rdf.rdf_traitmentTTL(dataString).then((result) =>{
              //console.log(reusltat)
              resolve({
                data: result
              })
            }, function(err) {
              reject("votre fichier n'est pas au norme ou pas du bon format "+ extension+" , n'hesitez pas a verifier que votre source d'entrée est bien un buffer")
            })
            break;

            // RDF XML DONE IF TEST PARSE
          case ("rdf"):
          case ("owl"):
            console.log('allo');
            rdf.rdf_traitmentXML(dataString).then(result => {
              // console.log("RDF", result)
              //console.log(JSON.stringify(reusltat))
              resolve(result)
            }, function(err) {
              reject("votre fichier n'est pas au norme ou pas du bon format "+ extension+", n'hesitez pas a verifier que votre source d'entrée est bien un buffer")
            })
            break;

            // EXEL/CSV/XLSX DONE
          case ("xls"):
          case ("xlsx"):
          case ("ods"):
          //console.log('ALLO3');
            exel.exel_to_json(dataBuffer).then((resultat)=>{
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
              reject("votre fichier n'est pas au norme ou pas du bon format "+ extension+", n'hesitez pas a verifier que votre source d'entrée est bien un buffer")
            })
            break;

            // XML DONE
          case ("xml"):
            xml.xml_traitment(dataString).then(function(reusltat) {
              // //console.log("FINAL", reusltat)
              //console.log("FINAL", reusltat)
              resolve({
                data: reusltat
              })
            }, function(err) {
              reject("votre fichier n'est pas au norme ou pas du bon format "+ extension+", n'hesitez pas a verifier que votre source d'entrée est bien un buffer")
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
              // console.log('err', err);
              reject("votre fichier n'est pas au norme ou pas du bon format "+ extension+", n'hesitez pas a verifier que votre source d'entrée est bien un buffer")
            })
            break;
          default:
            //console.log("in default")
            reject("erreur, le format du fichier n'est pas supporté ("+ extension+")")

            break;
        }
      }
    })
  })
}
