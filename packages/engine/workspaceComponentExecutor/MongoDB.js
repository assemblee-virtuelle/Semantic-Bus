'use strict';

const { ObjectId,MongoClient } = require('mongodb');
const { EJSON } = require('bson'); // Ajout de l'import EJSON
const mongoQueryExecutor = require('../utils/mongoQueryExecutor.js');

class MongoConnector {
  constructor () {
    // this.mongoose = require('mongoose')
    // this.MongoClient = require('mongodb').MongoClient
    this.dotProp = require('dot-prop')
    this.schema = null
    this.modelShema = null
    this.stepNode = false
    this.PromiseOrchestrator = require('@semantic-bus/core/helpers/promiseOrchestrator.js')
    this.ArraySegmentator = require('@semantic-bus/core/helpers/ArraySegmentator.js')
    this.stringReplacer = require('../utils/stringReplacer.js'),
    this.ObjectID = ObjectId
  }

  mongoInitialise (url) {
    return new Promise((resolve, reject) => {
      if (url) {
          MongoClient.connect(url).then(client => {
            // console.log('client',client)
            resolve(client)
          }).catch(e => {
            e.displayMessage = 'connection to MongoDB database failed'
            console.error('MongoDB Error',e);
            reject(e)
          })

      } else {
        const fullError = new Error('bad uri mongo connector')
        fullError.displayMessage = 'Connecteur Mongo : Veuillez entre une uri de connexion valide';
        reject(fullError)
      }
    })
  }

  mongoRequest (client, querysTable, database, collectionName, queryParams,flowdata) {
    //console.log('mongoRequest',querysTable);
    return new Promise(async (resolve, reject) => {
      try {
        const db = client.db(database)
        const collection = db.collection(collectionName)
        const normalizedQuerysTable = this.stringReplacer.execute(querysTable, queryParams, flowdata, true);
        // SECURITY: la requête est parsée et exécutée SANS eval. Seules les
        // méthodes whitelistées avec des arguments littéraux JSON sont
        // autorisées. La validation se fait sur la chaîne APRÈS interpolation
        // (les valeurs {£.x}/{$.y} peuvent provenir de sources anonymes).
        const evaluation = await mongoQueryExecutor.executeQuery(collection, normalizedQuerysTable);
        let mongoPromise
        if (evaluation instanceof Promise) {
          mongoPromise = evaluation
        } else {
          mongoPromise = Promise.resolve(evaluation);
        }

        const result = await mongoPromise;
        let serializableResult;
        serializableResult = JSON.parse(EJSON.stringify(result));
        resolve({
          result: serializableResult,
          client: client
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  mongoClose (client) {
    return new Promise((resolve, reject) => {
      return client.close()
    })
  }

  initialise (url) {
    return new Promise(function (resolve, reject) {
      if (url) {
        resolve(url)
      } else {
        let fullError = new Error('bad uri mongo connector')
        fullError.displayMessage = 'Connecteur Mongo : Veuillez entre une uri de connexion valide';
        reject(fullError)
      }
    })
  }

  // createmodel (modelName, data, url) {
  //   return new Promise(function (resolve, reject) {
  //     const db = this.mongoose.createConnection(url, (error) => {
  //       if (error) {
  //         let fullError = new Error(error)
  //         fullError.displayMessage = 'Connecteur Mongo : Veuillez entre une uri de connexion valide';
  //         reject(fullError)
  //       } else {
  //         const modelShema = db.model(modelName, new this.mongoose.Schema({}, {
  //           strict: false
  //         }), modelName)
  //         if (modelName != null) {
  //           resolve({
  //             db: db,
  //             model: modelShema
  //           })
  //         } else {
  //           let fullError = new Error("vous n'avez pas saisie de nom de table à requeter")
  //           fullError.displayMessage = "Connecteur Mongo : vous n'avez pas saisie de nom de table à requeter "
  //           reject(fullError)
  //         }
  //       }
  //     })
  //   }.bind(this))
  // }

  normalizeQuerysTable (querysTable, queryParams) {
    let processingQuerysTable = querysTable
    const regex = /{(\£.*?)}/g
    const elementsRaw = processingQuerysTable.match(regex)
    if (elementsRaw != null) {
      for (let match of elementsRaw) {
        const ObjectKey = match.slice(3, -1)

        processingQuerysTable = processingQuerysTable.replace(match, JSON.stringify(this.dotProp.get(queryParams, ObjectKey)))
      }
    }
    return processingQuerysTable
  }

  mongoInsert (client, database, collectionName, dataFlow,notErase) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = client.db(database)
        const collection = db.collection(collectionName);
        if (notErase!==true){
          await collection.remove({});
        }

        const arraySegmentator = new this.ArraySegmentator()
        let segmentFlow;
        if(!Array.isArray(dataFlow)){
          segmentFlow=[dataFlow];
        }else{
          segmentFlow=dataFlow;
        }

        for (let data of segmentFlow){
          const {_id,...noId}=data;
          try {
            if (_id) {
              let objectId;
              try {
                objectId = new this.ObjectID(_id);
              } catch (e) {
                objectId = _id;
              }
              
              await collection.findOneAndUpdate({
                _id: objectId
              },
              {
                $set:noId
              },
              {
                  upsert:true,
                  returnNewDocument: true
              })
            } else {
              await collection.insertOne(noId);
            }
          } catch (e) {
            console.log(e);
          }
        }

        resolve();
      } catch (e) {
        reject(e)
      }
    })
  }

  mongoInsertPromise (collection, data) {
    return collection.insertMany(data)
  }

  pull (data, dataFlow, queryParams) {
    if (data.specificData.querySelect !== undefined && data.specificData.querySelect !== undefined && data.specificData.querySelect !== '') {
      // console.log('pull',data.specificData.querySelect);
      return new Promise(async (resolve, reject) => {
        let client;
        try {
          client = await this.mongoInitialise(data.specificData.url)
          const mongoRequestResolved = await this.mongoRequest(client, data.specificData.querySelect, data.specificData.database, data.specificData.modelName, queryParams, dataFlow!=undefined?dataFlow[0].data:undefined)
          // console.log('mongoRequestResolved',mongoRequestResolved.result);
          resolve({
            data: mongoRequestResolved.result
          })
        } catch (error) {
          reject(error)
        } finally {
          if (client) client.close();
        }
      })
    } else {
      const writeFlow= dataFlow!=undefined?dataFlow[0].data:[{}];
      return new Promise(async (resolve, reject) => {
        let client
        try {
          client = await this.mongoInitialise(data.specificData.url)
          await this.mongoInsert(client, data.specificData.database, data.specificData.modelName, writeFlow,data.specificData.notErase)
          resolve({ data: writeFlow })
        } catch (error) {
          reject(error)
        } finally {
          if (client) client.close()
        }
      })
    }
  }
}

module.exports = new MongoConnector()
