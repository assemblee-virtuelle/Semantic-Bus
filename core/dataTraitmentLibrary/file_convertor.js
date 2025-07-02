// --------------------------------------------------------------------------------
// TODO =>
// remettre à jour les packages utilisés dans le fichier
// rdf_traitment.js pour les fichiers owl, rdf et ttl
// --------------------------------------------------------------------------------

const exel = require('./exel/exel_traitment.js');
const rdf = require('./rdf/rdf_traitment.js');
const xml = require('./xml/xml_traitment.js');
const csv = require('./csv/csv_traitment.js');
const ics = require('./ics/index.js');
var zlib = require('zlib');
const JSZip = require('jszip');
const FileType = require('file-type');
const { exitCode } = require('process');

module.exports = {
  data_from_file: _data_from_file,
  buildFile: _buildFile,
  extension: _extension
};

function _extension(filename, contentType) {
  // console.log('_extension',filename,contentType);
  let extension;
  if (filename != null && filename != undefined) {
    try {
      var regex = /\.(\w*)/g;
      let matches = filename.match(regex);
      extension = matches.pop();
      extension = extension.replace(';', '').replace('.', '')
    } catch (error) {

    }
  }
  if (!extension && contentType) {
    var regex = /\/(.+)/g;
    var reg = new RegExp(regex, 'g');
    let regResult = reg.exec(contentType)
    extension = regResult.pop()
    // Remove additional parameters from content-type (like charset)
    extension = extension.split(';')[0].trim();
    
    if (extension.includes('vnd.openxmlformats-officedocument')) {
      extension = "ods";
    }
    if (extension.includes('vnd.ms-excel')) {
      extension = "xlsx";
    }
    if (extension === 'calendar') {
      extension = "ics";
    }
  }
  if (!extension) {
    throw new Error('filename or contentType have to be set by valid values');
  }
  return extension;
}

function _buildFile(filename, dataString, dataBuffer, out, contentType) {
  const extension = _extension(filename, contentType);
  return new Promise(function (resolve, reject) {
    switch (extension) {
      case ("vnd.ms-excel"):
      case ("vnd.openxmlformats-officedocument"):
      case ("xlsx"):
        resolve(exel.json_to_exel(JSON.parse(dataString)));
        break;
      case ("rdf+xml"):
        resolve(rdf.json_to_rdf(JSON.parse(dataString)));
        break;
      case ("ics"):
        //console.log('ALLO');
        resolve(ics.json_to_ics(JSON.parse(dataString)));
        break;
      case ('csv'):
        resolve(csv.json_to_csv(JSON.parse(dataString)));
        break;

      default:
        //console.log("in default")
        reject("erreur, le format de fichier demandé n'est pas supporté");
        break;
    }
  })

}

function addFileToTree(tree, fileObject, leaf, parts) {



  // if (parts.length === 0){
  //   leaf.
  // }

  const part = parts.shift();
  if (parts.length === 0) {
    // Si c'est un fichier
    tree[part] = 'file';
  } else {
    // Si c'est un dossier
    if (!tree[part]) tree[part] = {};
    addFileToTree(tree[part], parts);
  }
}

async function _data_from_file(filename, dataBuffer, contentType, extractionParams) {
  // console.log('extractionParams', extractionParams);
  // console.log('_data_from_file  ',filename, contentType, extractionParams);
  // Si dataBuffer est un octet-stream, il doit être transformé en fichier pour trouver son filename avant de rechercher l'extension

  if (!filename) {
    const fileType = await FileType.fromBuffer(dataBuffer);
    if (fileType) {
      filename = `file.${fileType.ext}`; // Utilisez l'extension détectée pour créer un nom de fichier temporaire
    } else {
      console.warn('Impossible de déterminer le type de fichier à partir du buffer');
    }
  }

  const extension = _extension(filename, contentType);

  // console.log('extension',extension,filename,contentType);

  return new Promise(async function (resolve, reject) {
    switch (extension) {
      // GZ decompression
      case ("zip"):
        const zip = new JSZip();
        try {
          const contents = await zip.loadAsync(dataBuffer);
          // console.log('UNZIP!!',contents)
          let files = [];
          for (const fileName of Object.keys(zip.files)) {
            const fileObject = zip.files[fileName]
            if (fileObject.dir == false) {
              const pathTab = fileObject.name.split('/').filter(Boolean);
              const name = pathTab.pop();
              const fileItem = {
                fullPath: fileObject.name,
                name: name,
                path: pathTab.join('/')
              }

              try {
                const bufferFile = await fileObject.async('nodebuffer');
                const data = await _data_from_file(name, bufferFile, undefined, extractionParams);
                // console.log(data)
                fileItem.data = data.data;
              } catch (error) {
                // console.error(error)
                fileItem.data = { error: error };
              } finally {
                files.push(fileItem);
              }
            }
          }
          resolve({
            data: files
          })
        } catch (error) {
          reject(`Erreur lors de la lecture du fichier ZIP: ${error}`)
        }

        break;
      // GZ decompression
      case ("gz"):
        // decompression of a data buffer with Gunzip
        const newBuffer = zlib.gunzipSync(dataBuffer);
        // the file in a decompressed string
        const newString = newBuffer.toString('utf-8');
        // we remove the .gz at the end of the name of the file so that
        // we can find the right file's extension type
        const newFileName = filename.substring(filename, filename.length - 3);

        _data_from_file(newFileName, newBuffer, undefined, extractionParams).then((result) => {
          resolve({
            data: result.data
          })
        }).catch(err => {
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
        // rdf.rdf_traitmentTTL(dataBuffer.toString()).then((result) => {
        //   //console.log(reusltat)
        //   resolve({
        //     data: result
        //   })
        // }, function(err) {
        reject("Format non supporté mais c'est prévu " + extension)
        // })
        break;

      // RDF XML DONE IF TEST PARSE
      case ("rdf"):
      case ("owl"):
        // rdf.rdf_traitmentXML(dataBuffer.toString()).then(result => {
        //   resolve(result)
        // }, function(err) {
        reject("Format non supporté mais c'est prévu  " + extension)
        // })
        break;

      // EXEL/CSV/XLSX DONE
      case ("xls"):
      case ("xlsx"):
        exel.exel_to_json_stream(dataBuffer, extractionParams).then((resultat) => {
          resolve({
            data: resultat
          })
        }, function (err) {
          // console.log(err);
          reject("votre fichier n'est pas au norme ou pas du bon format " + extension)
        })
        break;
      case ("ods"):
        exel.exel_to_json(dataBuffer, extractionParams).then((resultat) => {
          resolve({
            data: resultat
          })
        }, function (err) {
          reject("votre fichier n'est pas au norme ou pas du bon format " + extension)
        })
        break;

      // XML DONE
      case ("xml"):
      case ("kml"):
        // console.log(dataBuffer)
        xml.xml_traitment(dataBuffer.toString(), extractionParams).then(function (result) {
          // //console.log("FINAL", reusltat)
          //console.log("FINAL", reusltat)
          resolve({
            data: result
          })
        }, function (err) {
          reject("votre fichier n'est pas au norme ou pas du bon format " + extension)
        })
        break;
      case ("csv"):
        csv.csvtojson(dataBuffer.toString(), extractionParams).then((result) => {
          // //console.log("FINAL", reusltat)
          // console.log("result", result)
          resolve({
            data: result
          })
        }, function (err) {
          console.log('err', err);
          reject("votre fichier n'est pas au norme ou pas du bon format " + extension)
        })
        break;
      case ("ics"):
      case ("calendar"):
        ics.icstojson(dataBuffer.toString(), extractionParams).then((result) => {
          // //console.log("FINAL", reusltat)
          //console.log("FINAL", reusltat)
          resolve({
            data: result
          })
        }, function (err) {
          // console.log('err', err);
          reject("votre fichier n'est pas au norme ou pas du bon format " + extension)
        })
        break;
      default:
        reject("erreur, le format du fichier n'est pas supporté (" + extension + ")")

        break;
    }

  })

}
