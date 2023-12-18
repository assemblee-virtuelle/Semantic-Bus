'use strict'

const { v4: uuidv4 } = require('uuid');
const MODE = 'AMQP' // MODE could be AMQP when all workflow will migrate over V1
class RestApiPost {
  constructor() {
    this.type = 'HTTP provider'
    this.description = `Mettre à disposition une API HTTP; Permettre à votre workflow d'être appelé par une requete HTTP.`
    this.editor = 'rest-api-post-editor'
    this.graphIcon = 'Post_provider.svg'
    this.tags = [
        'http://semantic-bus.org/data/tags/inComponents',
        'http://semantic-bus.org/data/tags/outComponents',
        'http://semantic-bus.org/data/tags/APIComponents'
      ],
      this.stepNode = false
    this.workspace_component_lib = require('../../../core/lib/workspace_component_lib')
    this.workspace_lib = require('../../../core/lib/workspace_lib')
    this.fragment_lib = require('../../../core/lib/fragment_lib')
    this.data2xml = require('data2xml');
    this.xmlJS = require('xml-js');
    this.dataTraitment = require('../../../core/dataTraitmentLibrary/index.js')
    this.json2yaml = require('json2yaml')
    this.request = require('request')
    this.config = require('../../config.json')
    
    const {
      pathToRegexp,
      match,
      parse,
      compile
    } = require("path-to-regexp");
    this.pathToRegexp = pathToRegexp;
    this.pendingWork= {};
    this.amqpConnection;
  }

  setAmqp(amqpConnection){
    // console.log('set AMQP')
    this.amqpConnection=amqpConnection;
    amqpConnection.consume('process-persist', (msg) => {
      const messageObject = JSON.parse(msg.content.toString())
      const pendingWork = this.pendingWork[messageObject.tracerId||messageObject.processId]
      if(pendingWork?.component == messageObject.componentId){
        pendingWork.frag = messageObject.frag;
      }

    }, {
      noAck: true
    })

    amqpConnection.consume('process-start', (msg) => {
      const messageObject = JSON.parse(msg.content.toString())
      // console.log('messageObject',messageObject)
      // console.log('process-start',messageObject.tracerId,this.id)
      const pendingWork = this.pendingWork[messageObject.tracerId||messageObject._id]
      if(pendingWork){
        pendingWork.process = messageObject._id;
      }
    }, {
      noAck: true
    })

    amqpConnection.consume('process-error', (msg) => {
      const messageObject = JSON.parse(msg.content.toString())
      const pendingWork = this.pendingWork[messageObject.tracerId||messageObject._id]
      if(pendingWork){
        pendingWork.error = messageObject._id;
      }
    }, {
      noAck: true
    })

  }

  initialise(router,engineTracer) {

    router.all('*', async (req, res, next) => {

      // console.log('pendingWork',this.pendingWork);
      // console.log(req)
      const urlRequiered = req.params[0].split('/')[1];
      const urlRequieredFull = req.params[0].replace('/', '');
      const query = req.query;
      // console.log();
      let targetedComponent;
      const regex = /([^-]*)-.*/g;
      let componentId = regex.exec(urlRequiered)[1];
      let component;
      try {
        let component = await this.workspace_component_lib.get({
          _id: componentId,
        });
        if (component != undefined && component.specificData.url != undefined) {
          req.setTimeout(0);
          let keys = []
          let regexp = this.pathToRegexp(component.specificData.url, keys);
          //convert query url variable to query properties
          if (regexp.test(urlRequieredFull)) {
            let values = regexp.exec(urlRequieredFull);

            let valueIndex = 1;
            for (let key of keys) {
              let value = values[valueIndex]
              query[key.name] = value
              valueIndex++
            }
            for (let queryKey in query) {
              try {
                query[queryKey] = JSON.parse(query[queryKey])
              } catch (e) {
              }
            }
          } else {
            // console.log('NO MATH!!');
          }

          // console.log('req.body',req.body);

          const worksapce =  await this.workspace_lib.get_workspace_simple(component.workspaceId)

          const version = worksapce.engineVersion==undefined||worksapce.engineVersion=='default'?'v1':worksapce.engineVersion;

          // console.log('VERSION',version)
          if (MODE=='HTTP'){
            // console.log('CALL Direct HTTP')
            const versionUrl = `${this.config.engineUrl}/${version}/work-ask/${component._id}`
            // console.log('versionUrl',this.config.engineUrl + versionUrl + component._id);
            this.request.post(versionUrl, {
              body: {
                queryParams: {
                  query: req.query,
                  body: req.body,
                  headers: req.headers,
                  method :req.method
                },
                pushData: req.body
              },
              json: true
            }
            // eslint-disable-next-line handle-callback-err
            , (err, data) => {

              try {
                if (err) {
                  console.error("restpiIPost request error", err);
                  res.status(500).send(err)
                } else {
                  if (data.statusCode != 200) {
                    res.status(500).send({
                      engineResponse: data.body
                    })
                  } else {
                    console.log('WORK response',data.body);
                    if(data.body.data){
                      console.log(data.body);
                      this.sendResult(component, data.body.data, res)
                    }else {
                      // engineTracer.pendingProcess.push(data.body.processId);
                      this.pendingWork[data.body.processId]={component :component._id};
                      let counter=0
                      const intervalId = setInterval(async () => {
                        console.log(counter,data.body.processId)
                        if (this.pendingWork[data.body.processId].frag){
                          clearInterval(intervalId);
                          // res.send(this.pendingWork[data.body.processId]);
                          const dataResponse = await this.fragment_lib.getWithResolutionByBranch(this.pendingWork[data.body.processId].frag);
                          console.log(dataResponse)
                          this.sendResult(component, dataResponse, res)
                        }else{
                          // console.log('waiting');
                        }
                      }, 100);
                    }
                  }
                }
              } catch (e) {
                console.log('api error after engine call', e);
                res.send(new Error(e.message))
              }
            });
          }else if (MODE=='AMQP'){
            // console.log('CALL AMQP')
            const tracerId =  uuidv4();
            const workParams={
              tracerId ,
              id : component._id,
              queryParams: {
                query: req.query,
                body: req.body,
                headers: req.headers,
                method :req.method
              },
              // pushData: req.body
            }
            this.pendingWork[tracerId] = {
             component :component._id
            }
            //  console.log(this.amqpConnection)
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
            //  let counter=1;
             const intervalId = setInterval(async () => {
               if (this.pendingWork[tracerId].frag){
                 clearInterval(intervalId);
                 const dataResponse = await this.fragment_lib.getWithResolutionByBranch(this.pendingWork[tracerId].frag);
                 this.sendResult(component, dataResponse, res)

               } else  if (this.pendingWork[tracerId].error){
                clearInterval(intervalId);
                res.status(500).send({
                  error:'engine error'
                })
              }else{
                 // console.log('waiting');
                //  counter++;
               }
             }, 100);
          }
        } else {
          res.status(404).send('no API for this url');
        }
      } catch (e) {
        console.log(e);
        res.status(404).send('no API for this url');
      }
    })
  }

  sendResult(component, dataToSend, res) {
    if (component.specificData != undefined) { // exception in previous promise
      if (component.specificData.contentType != undefined && component.specificData.contentType != '') {
        // console.log('contentType',component.specificData.contentType);
        if (dataToSend == undefined) {
          res.status(201).send()
        } else if (component.specificData.contentType.search('application/vnd.ms-excel') != -1) {
          res.setHeader('content-type', component.specificData.contentType)
          this.dataTraitment.type.buildFile(undefined, JSON.stringify(dataToSend), undefined, true, component.specificData.contentType).then((result) => {
            res.setHeader('Content-disposition', 'attachment; filename=' + component.specificData.url + '.xlsx')
            res.send(result)
          })
        } else if (component.specificData.contentType.search('rdf') != -1) {

          res.setHeader('content-type', component.specificData.contentType)
          this.dataTraitment.type.buildFile(undefined, JSON.stringify(dataToSend), undefined, true, component.specificData.contentType).then((result) => {
            res.setHeader('Content-disposition', 'attachment; filename=' + component.specificData.url + '.xml')
            res.send(result)
          })
        } else if (component.specificData.contentType.search('xml') != -1) {
          res.setHeader('content-type', component.specificData.contentType)
          let out = this.xmlJS.js2xml(dataToSend, {
            compact: true,
            ignoreComment: true,
            spaces: 0
          })
          out = out.replace(/\0/g, '')
          // console.log('xml out', out);
          // console.log(Buffer.byteLength(out, 'utf8') + " bytes");
          res.send(out)
          // res.end();
        } else if (component.specificData.contentType.search('yaml') != -1) {
          res.setHeader('content-type', component.specificData.contentType)
          res.send(this.json2yaml.stringify(dataToSend))
        } else if (component.specificData.contentType.search('json') != -1) {
          res.setHeader('content-type', component.specificData.contentType)
          var buf = Buffer.from(JSON.stringify(dataToSend))
          res.send(buf)
        } else {
          res.status(400).send('no supported content-type')
          // res.send(new Error('no supported madiatype'))
          // return ('type mime non géré')
        }
      } else {
        console.log('ERROR content-type have to be set')
        res.status(400).send(`content-type have to be set`)
        // return ('type mime non géré')
      }
    }
  }
}

module.exports = new RestApiPost()
