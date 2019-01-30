"use strict";

class Upload {
  constructor() {
    this.type= 'Upload';
    this.description= 'Importer un fichier.';
    this.workspace_component_lib= require('../../../core/lib/workspace_component_lib');
    this.editor= 'upload-editor';
    this.graphIcon= 'Upload.png';
    this.tags= [
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/fileComponents'
    ];
    this.busboy= require('busboy');
    this.dataTraitment= require("../dataTraitmentLibrary/index.js");
    this.propertyNormalizer = require("../sharedLibrary/propertyNormalizer.js");
    this.readable= require('stream').Readable;
    this.configuration= require('../../configuration.js');
    this.stepNode= false;
  }

  initialise(router, stompClient) {
    //this.stompClient=stompClient;
    router.post('/upload/:compId', (req, res, next) => {

      var compId = req.params.compId;
      const isexel = false
      // return new Promise((resolve, reject) => {

      new Promise((resolve, reject) => {

        var busboy = new this.busboy({
          headers: req.headers
        });
        //var buffer = []
        var string = ""
        var fileName = null
        let buffer;

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
          fileName = filename;
          let bufferEnconding;
          switch (encoding) {
            case '7bit':
              bufferEnconding = 'ascii'
              break;
            default:
              bufferEnconding = encoding;
              break;

          }

          file.on('data', (data) => {
            // console.log('data', typeof(data));
            if (buffer == undefined) {
              buffer =  Buffer.from(data);
            } else {
              //console.log(data);
              buffer = Buffer.concat([buffer,data]);
              //buffer.write(data, bufferEnconding);
            }
            //string += data
          });
          file.on('end', () => {
            // console.log('end');
            //console.log('File [' + fieldname + '] Finished');
            string = buffer.toString("utf-8");
          });
        }).on('finish', ()=>{
          // console.log('finish');
          this.dataTraitment.type.type_file(fileName, string, buffer).then((result) => {
            let normalized = this.propertyNormalizer.execute(result);
            //console.log(normalized);
            resolve(normalized);
          }, (err) => {
            //console.log("in error ")
            let fullError = new Error(err);
            fullError.displayMessage = "Upload : " + err;
            reject(fullError);
          })

          //console.log('Data2: ' + base64data);
        });

        busboy.on('error', (err) => {
          let fullError = new Error(err);
          fullError.displayMessage = "Upload : Erreur lors de votre traitement de fichier";
          reject(fullError)
        });

        req.pipe(busboy);

      }).then((resultatTraite) => {
        res.json({
          message: 'file upload ok'
        });

        var recursivPullResolvePromiseDynamic = require('../engine');
        this.workspace_component_lib.get({
          _id: compId
        }).then(data => {
          //console.log('ALLO',req);
          let token = req.headers['authorization'];
          // console.log('token |', token);
          let user;
          let jwtSimple = require('jwt-simple');
          if (token != undefined) {

            token.split("");
            let decodedToken = jwtSimple.decode(token.substring(4, token.length), this.configuration.secret);
            //console.log('ALLO', decodedToken);
            user = decodedToken.iss;
            //console.log('user |', user);
          }
          //console.log('resultatTraite',resultatTraite);
          recursivPullResolvePromiseDynamic.execute(data, 'push', stompClient, user, resultatTraite.data).then((res) => {
            // resolve({
            //   data: res
            // })
          });
        }).catch(err => {
          // let fullError = new Error(err);
          // fullError.displayMessage = "Upload : Erreur lors de votre traitement de fichier";
          // next(fullError)
        });
      }).catch(err => {
        //console.log("in error 2");
        //res.status(500).send(err);
        next(err)
      })
      // })
    })
  }

  pull(data, flowData) {
    return new Promise((resolve, reject) => {
      resolve({});
    })
  }
}

module.exports = new Upload();
