'use strict'

const path = require('path');
const fs = require('fs');
const busboy = require('busboy');
const file_lib = require('../../../core/lib/file_lib')

class Upload {
  constructor () {
    this.type = 'Upload'
    this.description = 'Importer un fichier.'
    this.editor = 'upload-editor'
    this.graphIcon = 'Upload.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/fileComponents'
    ]
    // this.dataTraitment = require('../../../core/dataTraitmentLibrary/index.js')
    this.file_convertor = require('../../../core/dataTraitmentLibrary/file_convertor.js')
    this.propertyNormalizer = require('../utils/propertyNormalizer.js')
    this.readable = require('stream').Readable
    this.workspace_component_lib = require('../../../core/lib/workspace_component_lib')
    this.configuration = require('../../config.json')
    this.stepNode = false
    this.request = require('request')
    this.config = require('../../config.json')
  }

  setAmqp(amqpConnection){
    // console.log('set AMQP')
    this.amqpConnection=amqpConnection;
  }

  initialise (router, stompClient) {
    router.post('/upload/:compId', (req, res, next) => {
      var compId = req.params.compId

      var busboyInstance = new busboy({
        headers: req.headers
      })

      let fileName = null
      let saveTo = null
      busboyInstance.on('file', (fieldname, file, filename, encoding, mimetype) => {
        fileName = filename
        // file.on('data', (data) => {
        //   if (buffer == undefined) {
        //     buffer = Buffer.from(data)
        //   } else {
        //     buffer = Buffer.concat([buffer, data])
        //   }
        // })
        // file.on('end', () => {
        //   string = buffer.toString('utf-8')
        // })

        const uploadDir= path.join(__dirname, '../../../uploads',compId);
        
        console.log('uploadDir',uploadDir)
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        saveTo = path.join(uploadDir, path.basename(filename));
  
        const writeStream = fs.createWriteStream(saveTo);
  
        file.pipe(writeStream);
  
        writeStream.on('finish', () => {
          // console.log('File has been written');
        });
  
        writeStream.on('error', (err) => {
          console.error('Error writing file:', err);
        });

      })
      busboyInstance.on('finish', async () => {
        res.json({
          message: 'file upload ok'
        })

        const file = await file_lib.create({
          filePath:saveTo,
          fileName:fileName
        })

        const workParams={
          id : compId,
          queryParams: {
            _file : file._id
          }
        }

        this.amqpConnection.sendToQueue(
          'work-ask',
          Buffer.from(JSON.stringify(workParams)),
          null,

          (err, ok) => {
            if (err !== null) {
              console.error('Erreur lors de l\'envoi du message :', err);
              res.status(500).send({
                 error: 'AMQP server no connected'
               })
            } else {
             //  console.log(`Message envoyé à la file `);
              // res.send(workParams);
            }
          }
        )

        // // Lecture du fichier et conversion en buffer
        // fs.readFile(saveTo, (err, buffer) => {
        //   if (err) {
        //     console.error('Erreur lors de la lecture du fichier:', err);
        //     return;
        //   }

        //   this.file_convertor.data_from_file(fileName, buffer).then((result) => {
        //     let normalized = this.propertyNormalizer.execute(result);
        //     console.log('normalized',normalized.data)

            
        //     // resolve(normalized)
        //   }, (err) => {
        //     let fullError = new Error(err)
        //     fullError.displayMessage = 'Upload : ' + err
        //     throw new Error(fullError)
        //     // reject(fullError)
        //   })
        // });
  
  
        // this.workspace_component_lib.get({
        //   _id: compId
        // }).then(component => {



     //  let coun

          // console.log('resultatTraite.data',resultatTraite.data);
  
          //TODO : change by file writing and AMQP call with file path
          // this.request.post(this.config.engineUrl + '/work-ask/' + component._id,
          //   { body: {
          //       pushData: resultatTraite.data,
          //       queryParams: {
          //         upload: resultatTraite.data
          //       }
          //    },
          //     json: true
          //   }
          //   // eslint-disable-next-line handle-callback-err
          //   , (err, dataToSend) => {
          //     if (err) {
          //       console.error(err);
          //       // err.details=err.displayMessage;
          //       next(err)
          //     } else {
          //       res.json({
          //         message: 'file upload ok'
          //       })
          //     }
          //   })
        // })


        // this.file_convertor.data_from_file(fileName, string, buffer).then((result) => {
        //   let normalized = this.propertyNormalizer.execute(result)
        //   resolve(normalized)
        // }, (err) => {
        //   let fullError = new Error(err)
        //   fullError.displayMessage = 'Upload : ' + err
        //   reject(fullError)
        // })
      })

      busboyInstance.on('error', (err) => {
        let fullError = new Error(err)
        fullError.displayMessage = 'Upload : Erreur lors de votre traitement de fichier'
        reject(fullError)
      })

      req.pipe(busboyInstance)
    })
  }

}

module.exports = new Upload()
