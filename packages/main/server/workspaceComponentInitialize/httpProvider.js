'use strict';

const { v4: uuidv4 } = require('uuid');
const MODE = 'AMQP'; // MODE could be AMQP when all workflow will migrate over V1
class HttpProvider {
  constructor() {
    this.type = 'HTTP provider';
    this.description = 'Mettre à disposition une API HTTP; Permettre à votre workflow d\'être appelé par une requete HTTP.';
    this.editor = 'http-provider-editor';
    this.graphIcon = 'Post_provider.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/outComponents',
      'http://semantic-bus.org/data/tags/APIComponents'
    ],
    this.stepNode = false;
    this.workspace_component_lib = require('@semantic-bus/core/lib/workspace_component_lib');
    this.workspace_lib = require('@semantic-bus/core/lib/workspace_lib');
    // this.fragment_lib = require('../../../core/lib/fragment_lib')
    this.fragment_lib = require('@semantic-bus/core/lib/fragment_lib_scylla');
    this.data2xml = require('data2xml');
    this.xmlJS = require('xml-js');
    this.dataTraitment = require('@semantic-bus/core/dataTraitmentLibrary/index.js');
    this.json2yaml = require('json2yaml');
    this.request = require('request');
    this.config = require('../../config.json');
    this.file_lib = require('@semantic-bus/core/lib/file_lib_scylla');

    const {
      pathToRegexp,
      match,
      parse,
      compile
    } = require('path-to-regexp');
    this.pathToRegexp = pathToRegexp;
    this.pendingWork = {};
    this.pendingCall = {};
    this.currentCall = {};
    this.amqpConnection;
  }

  setAmqp(amqpConnection) {
    console.log('set AMQP');
    this.amqpConnection = amqpConnection;
    amqpConnection.consume('process-persist', async(msg) => {
      const messageObject = JSON.parse(msg.content.toString());
      const tracerId = messageObject.tracerId;
      const pendingWork = this.pendingWork[tracerId];
      const responseComponentId = pendingWork?.component?.specificData?.responseComponentId || pendingWork?.component._id;
      const unlockComponentId = pendingWork?.component?.specificData?.unlockComponentId || pendingWork?.component._id;

      if (responseComponentId == messageObject.componentId) {
        const dataResponse = await this.fragment_lib.getWithResolutionByBranch(messageObject.frag);
        if (pendingWork?.component?.specificData.responseWithoutExecution != true) {
          // console.log('___dataResponse', dataResponse)
          this.sendResult(pendingWork?.component, dataResponse, pendingWork.res);
        }
      }

      if (unlockComponentId == messageObject.componentId) {
        delete this.currentCall[pendingWork.component._id.toString()];
        this.pop(pendingWork.component._id.toString());
      }
    }, {
      noAck: true
    });

    amqpConnection.consume('process-start', (msg) => {
      const messageObject = JSON.parse(msg.content.toString());
      const pendingWork = this.pendingWork[messageObject.tracerId];
      if (pendingWork) {
        pendingWork.process = messageObject._id;
      }
    }, {
      noAck: true
    });

    amqpConnection.consume('process-end', (msg) => {
      const messageObject = JSON.parse(msg.content.toString());
      const pendingWork = this.pendingWork[messageObject.tracerId];
      if (pendingWork) {
        delete this.pendingWork[messageObject.tracerId];
      }
    }, {
      noAck: true
    });

    amqpConnection.consume('process-error', (msg) => {
      const messageObject = JSON.parse(msg.content.toString());
      const tracerId = messageObject.tracerId || messageObject._id;
      const pendingWork = this.pendingWork[tracerId];
      if (pendingWork) {
        pendingWork.error = messageObject._id;
        if (pendingWork?.component?.specificData.resonseWithoutExecution != true) {
          pendingWork.res.status(500).send({
            error: 'engine error'
          });
        }
        delete this.pendingWork[tracerId];
        delete this.currentCall[pendingWork.component._id.toString()];
        this.pop(pendingWork.component._id.toString());
      }
    }, {
      noAck: true
    });
  }

  initialise(router) {
    router.all('/api/*', async(req, res, next) => {
      console.log('API CALL');

      const urlRequieredFull = req.params[0].replace('/', '');
      const query = req.query;
      let targetedComponent;
      const regex = /([^-]*)-.*/g;
      const componentId = regex.exec(urlRequieredFull)[1];

      try {
        let component;
        try {
          component = await this.workspace_component_lib.get({
            _id: componentId
          });
        } catch (error) {
          // no found component just not set component
        }

        if (component != undefined && component.specificData.url != undefined) {
          req.setTimeout(0);
          const keys = [];
          const regexp = this.pathToRegexp(component.specificData.url, keys);

          // convert query url variable to query properties
          if (regexp.test(req.params[0])) {
            const values = regexp.exec(req.params[0]);
            let valueIndex = 1;
            for (const key of keys) {
              const value = values[valueIndex];
              query[key.name] = value;
              valueIndex++;
            }
            for (const queryKey in query) {
              try {
                query[queryKey] = JSON.parse(query[queryKey]);
              } catch (e) {
              }
            }
          } else {
            // console.log('NO MATH!!');
          }

          if (component.specificData.responseWithoutExecution) {
            res.send();
          }

          const callStack = this.pendingCall[component._id];
          const callContent = {
            queryParams: {
              query: req.query,
              body: req.body,
              headers: req.headers,
              method: req.method
            },
            component: component,
            res: res
          };

          if (Array.isArray(callStack)) {
            callStack.push(callContent);
          } else {
            this.pendingCall[component._id] = [callContent];
          }
          this.pop(component._id.toString(), component.specificData.unrestrictedExecution);
        } else {
          res.status(404).send('no API for this url');
        }
      } catch (e) {
        console.log(e);
        res.status(500).send('API error');
      }
    });
  }

  pop(componentId, unrestrictedExecution) {
    const callStack = this.pendingCall[componentId];
    if (unrestrictedExecution || !this.currentCall[componentId] && Array.isArray(callStack) && callStack.length > 0) {
      if (!unrestrictedExecution) {
        this.currentCall[componentId] = true;
        // if engin never send end of process becaus crash; this settime free lock
        setTimeout(() => {
          delete this.currentCall[componentId];
          console.warn('WARNING httpProvider pop timeout', componentId, this.currentCall, callStack.length);
          this.pop(componentId, unrestrictedExecution);
        }, 20000);
      }
      const currentCallItem = callStack.shift();
      const tracerId = uuidv4();
      const workParams = {
        tracerId,
        id: currentCallItem.component._id,
        queryParams: currentCallItem.queryParams
      };
      this.pendingWork[tracerId] = {
        component: currentCallItem.component,
        res: currentCallItem.res
      };

      console.log('sendToQueue');
      this.amqpConnection.sendToQueue(
        'work-ask',
        Buffer.from(JSON.stringify(workParams)),
        null,
        (err, ok) => {
          if (err !== null) {
            console.error('Erreur lors de l\'envoi du message :', err);
            res.status(500).send({
              error: 'AMQP server no connected'
            });
          } else {
            //  console.log(`Message envoyé à la file `);
            // res.send(workParams);
          }
        }
      );
    }
  }

  async sendResult(component, dataToSend, res) {
    if (component.specificData != undefined) { // exception in previous promise
      // Option to return raw file without content-type transformation
      if (component.specificData.returnRawFile && component.specificData.rawFileProperty) {
        if (dataToSend == undefined || dataToSend == null || dataToSend[component.specificData.rawFileProperty] == undefined || dataToSend[component.specificData.rawFileProperty] == null) {
          res.status(404).send('data is undefined or null or property ' + component.specificData.rawFileProperty + ' not found in data : ' + JSON.stringify(dataToSend));
        } else{
          if (component.specificData.contentType) {
            res.setHeader('content-type', component.specificData.contentType);
          }

          // Set content-disposition if filename is provided
          if (component.specificData.filename) {
            res.setHeader('Content-disposition', 'attachment; filename=' + component.specificData.filename);
          }
          // Send the raw file data from the specified property
          const rawFileData = dataToSend[component.specificData.rawFileProperty];
          if (rawFileData) {
            const file = await this.file_lib.get(rawFileData._file);
            res.setHeader('Content-Type', 'application/octet-stream');
            res.send(file.binary);
          } else {
            res.status(400).send(`Property '${component.specificData.rawFileProperty}' not found in data`);
          }
        }
      } else if (component.specificData.contentType != undefined && component.specificData.contentType != '') {
        // console.log('contentType',component.specificData.contentType);
        if (dataToSend == undefined) {
          res.status(201).send();
        } else if (component.specificData.contentType.search('application/vnd.ms-excel') != -1) {
          res.setHeader('content-type', component.specificData.contentType);
          this.dataTraitment.type.buildFile(undefined, JSON.stringify(dataToSend), undefined, true, component.specificData.contentType).then((result) => {
            res.setHeader('Content-disposition', 'attachment; filename=' + component.specificData.url + '.xlsx');
            res.send(result);
          });
        } else if (component.specificData.contentType.search('rdf') != -1) {
          res.setHeader('content-type', component.specificData.contentType);
          this.dataTraitment.type.buildFile(undefined, JSON.stringify(dataToSend), undefined, true, component.specificData.contentType).then((result) => {
            res.setHeader('Content-disposition', 'attachment; filename=' + component.specificData.url + '.xml');
            res.send(result);
          });
        } else if (component.specificData.contentType.search('ics') != -1) {
          res.setHeader('content-type', component.specificData.contentType);
          this.dataTraitment.type.buildFile(undefined, JSON.stringify(dataToSend), undefined, true, component.specificData.contentType).then((result) => {
            res.setHeader('Content-disposition', 'attachment; filename=' + component.specificData.url + '.ics');
            res.send(result);
          });
        } else if (component.specificData.contentType.search('xml') != -1) {
          res.setHeader('content-type', component.specificData.contentType);
          let out = this.xmlJS.js2xml(dataToSend, {
            compact: true,
            ignoreComment: true,
            spaces: 0
          });
          out = out.replace(/\0/g, '');
          // console.log('xml out', out);
          // console.log(Buffer.byteLength(out, 'utf8') + " bytes");
          res.send(out);
          // res.end();
        } else if (component.specificData.contentType.search('yaml') != -1) {
          res.setHeader('content-type', component.specificData.contentType);
          res.send(this.json2yaml.stringify(dataToSend));
        } else if (component.specificData.contentType.search('json') != -1) {
          res.setHeader('content-type', component.specificData.contentType);
          const buf = Buffer.from(JSON.stringify(dataToSend));
          res.send(buf);
        } else {
          res.status(400).send('no supported content-type');
          // res.send(new Error('no supported madiatype'))
          // return ('type mime non géré')
        }
      } else {
        console.log('ERROR content-type have to be set');
        res.status(400).send('content-type have to be set');
        // return ('type mime non géré')
      }
    }
  }
}

module.exports = new HttpProvider();
