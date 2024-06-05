'use strict'

const { v4: uuidv4 } = require('uuid');
const MODE = 'AMQP' // MODE could be AMQP when all workflow will migrate over V1
class HttpProvider {
  constructor() {
    this.type = 'HTTP provider'
    this.description = `Mettre à disposition une API HTTP; Permettre à votre workflow d'être appelé par une requete HTTP.`
    this.editor = 'http-provider-editor'
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
    this.pendingCall= {};
    this.currentCall= {};
    this.amqpConnection;
  }

  setAmqp(amqpConnection){
    // console.log('set AMQP')
    this.amqpConnection=amqpConnection;
    amqpConnection.consume('process-persist', async (msg) => {
      const messageObject = JSON.parse(msg.content.toString());
      const tracerId = messageObject.tracerId;
      const pendingWork = this.pendingWork[tracerId];
      const responseComponentId= pendingWork?.component?.specificData?.responseComponentId||pendingWork?.component._id;
      const unlockComponentId= pendingWork?.component?.specificData?.unlockComponentId||pendingWork?.component._id;

      if(responseComponentId == messageObject.componentId){
        const dataResponse = await this.fragment_lib.getWithResolutionByBranch(messageObject.frag);
        if(pendingWork?.component?.specificData.responseWithoutExecution!=true){
          this.sendResult(pendingWork?.component, dataResponse, pendingWork.res);
        }
      }
      if(unlockComponentId == messageObject.componentId){
        delete this.currentCall[pendingWork.component._id.toString()];
        this.pop(pendingWork.component._id.toString());
      }


    }, {
      noAck: true
    })

    amqpConnection.consume('process-start', (msg) => {
      const messageObject = JSON.parse(msg.content.toString())
      const pendingWork = this.pendingWork[messageObject.tracerId]
      if(pendingWork){
        pendingWork.process = messageObject._id;
      }
    }, {
      noAck: true
    })

    amqpConnection.consume('process-end', (msg) => {
      // console.log('_______process-end 1')
      const messageObject = JSON.parse(msg.content.toString())
      // console.log('_______process-end 2')
      const pendingWork = this.pendingWork[messageObject.tracerId]
      // console.log('_______process-end 3')
      if(pendingWork){
        delete this.pendingWork[messageObject.tracerId];
      }
      // console.log('_______process-end 4')
    }, {
      noAck: true
    })

    amqpConnection.consume('process-error', (msg) => {
      const messageObject = JSON.parse(msg.content.toString())
      const tracerId=messageObject.tracerId||messageObject._id;
      const pendingWork = this.pendingWork[tracerId]
      if(pendingWork){
        pendingWork.error = messageObject._id;
        if(pendingWork?.component?.specificData.resonseWithoutExecution!=true){
          pendingWork.res.status(500).send({
            error:'engine error'
          })
        }
        // console.log('_______________4 delete error',pendingWork.component._id.toString());
        delete this.pendingWork[tracerId];
        delete this.currentCall[pendingWork.component._id.toString()];
        this.pop(pendingWork.component._id.toString());
      }
  
    }, {
      noAck: true
    })

  }

  initialise(router,engineTracer) {
    router.all('*', async (req, res, next) => {
      // console.log('pendingWork',this.pendingWork);
      // console.log('_______________0.1');
      const urlRequiered = req.params[0].split('/')[1];
      const urlRequieredFull = req.params[0].replace('/', '');
      const query = req.query;
      // console.log();
      let targetedComponent;
      const regex = /([^-]*)-.*/g;
      let componentId = regex.exec(urlRequiered)[1];
      // let component;
      try {
        // console.log('______componentId',componentId)
        let component = await this.workspace_component_lib.get({
          _id: componentId,
        });
        if (component != undefined && component.specificData.url != undefined) {
          // console.log('_______________0.2');
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

          if(component.specificData.responseWithoutExecution){
            res.send();
          }
          

          // console.log('_______________1 add call',component._id.toString());
          const callStack=this.pendingCall[component._id];
          const callContent = {
            queryParams: {
              query: req.query,
              body: req.body,
              headers: req.headers,
              method :req.method
            },
            component : component,
            res:res
          }

          if (Array.isArray(callStack)){
            callStack.push(callContent);
          } else{
            this.pendingCall[component._id]=[callContent]
          }
          this.pop(component._id.toString(),component.specificData.unrestrictedExecution);


        } else {
          res.status(404).send('no API for this url');
        }
      } catch (e) {
        console.log(e);
        res.status(500).send('API error');
      }
    })
  }

  pop(componentId,unrestrictedExecution){
    const callStack = this.pendingCall[componentId];    
    // console.log(callStack.length);
    // console.log('_______________2 pop',componentId);
    if(unrestrictedExecution || !this.currentCall[componentId] && Array.isArray(callStack) && callStack.length>0){
      // console.log('_______________3 pop GO',componentId,' - ',callStack.length);
      if(!unrestrictedExecution){
        this.currentCall[componentId]=true;
        // if engin never send end of process becaus crash; this settime free lock
        setTimeout(() => {
          delete this.currentCall[componentId];
        }, 20000);
      }
      const currentCallItem = callStack.shift();
      const tracerId =  uuidv4();
      const workParams={
        tracerId ,
        id : currentCallItem.component._id,
        queryParams: currentCallItem.queryParams
      }
      this.pendingWork[tracerId] = {
        component :currentCallItem.component,
        res : currentCallItem.res
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
    }
    

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
        } else if (component.specificData.contentType.search('ics') != -1) {

          res.setHeader('content-type', component.specificData.contentType)
          this.dataTraitment.type.buildFile(undefined, JSON.stringify(dataToSend), undefined, true, component.specificData.contentType).then((result) => {
            res.setHeader('Content-disposition', 'attachment; filename=' + component.specificData.url + '.ics')
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

module.exports = new HttpProvider()
