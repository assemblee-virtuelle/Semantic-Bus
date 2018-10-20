"use strict";
module.exports = {
  type: 'MongoDB connector',
  description: 'intéroger une base de donnée Mongo',
  editor: 'mongo-connecteur-editor',
  mongoose: require('mongoose'),
  MongoClient: require('mongodb').MongoClient,
  //mLabPromise: require('../mLabPromise'),
  graphIcon: 'mongoDbConnector.png',
  dotProp: require('dot-prop'),
  tags: [
    'http://semantic-bus.org/data/tags/inComponents',
    'http://semantic-bus.org/data/tags/outComponents',
    'http://semantic-bus.org/data/tags/BDDComponents'
  ],
  schema: null,
  modelShema: null,
  stepNode: true,
  PromiseOrchestrator: require("../../lib/core/helpers/promiseOrchestrator.js"),
  ArraySegmentator: require("../../lib/core/helpers/ArraySegmentator.js"),

  mongoInitialise: function(url) {
    //var MongoClient = require('mongodb').MongoClient;
    //var url = "mongodb://localhost:27017/mydb";
    return new Promise((resolve, reject) => {
      if (url) {
        this.MongoClient.connect(url).then(client => {
          //console.log("Database connection OK");
          resolve(client)
        }).catch(e => {
          //const fullError = new Error("bad uri mongo connector");
          e.displayMessage = "connection to MongoDB database failed"
          reject(e);
        })
      } else {
        const fullError = new Error("bad uri mongo connector");
        fullError.displayMessage = "Connecteur Mongo : Veuillez entre une uri de connexion valide";
        reject(fullError)
      }

    })
  },
  mongoRequest: function(client, querysTable, database, collectionName, queryParams) {
    return new Promise((resolve, reject) => {
      try {
        const db = client.db(database)
        //console.log(db);
        const collection = db.collection(collectionName)
        const normalizedQuerysTable = this.normalizeQuerysTable(querysTable, queryParams);
        //console.log(eval("collection." + normalizedQuerysTable+".toArray()"));
        const evaluation = eval("collection." + normalizedQuerysTable);
        let mongoPromise;
        //console.log(evaluation);
        if (evaluation instanceof Promise) {
          mongoPromise = evaluation;

        } else {
          mongoPromise = evaluation.toArray();
        }

        mongoPromise.then(result => {
          //console.log('RESULT',result);
          resolve({
            result: result,
            client: client
          })
        })
      } catch (e) {
        reject(e);
      } finally {
        //client.close();
      }
    })
  },
  mongoClose: function(client) {
    return new Promise((resolve, reject) => {
      return client.close();
    })
  },

  initialise: function(url) {
    //console.log("----- create uri connexion -----")
    return new Promise(function(resolve, reject) {
      if (url) {
        resolve(url)
      } else {
        let fullError = new Error("bad uri mongo connector");
        fullError.displayMessage = "Connecteur Mongo : Veuillez entre une uri de connexion valide";
        reject(fullError)
      }
    }.bind(this))
  },


  createmodel: function(modelName, data, url) {
    //  console.log('createmodel');
    //console.log("----- create model mongoose -----")
    return new Promise(function(resolve, reject) {
      const db = this.mongoose.createConnection(url, (error) => {
        if (error) {
          let fullError = new Error(error);
          fullError.displayMessage = "Connecteur Mongo : Veuillez entre une uri de connexion valide";
          reject(fullError)
        } else {
          const modelShema = db.model(modelName, new this.mongoose.Schema({}, {
            strict: false
          }), modelName);
          if (modelName != null) {
            resolve({
              db: db,
              model: modelShema
            })
          } else {
            let fullError = new Error("vous n'avez pas saisie de nom de table à requeter");
            fullError.displayMessage = "Connecteur Mongo : vous n'avez pas saisie de nom de table à requeter ";
            reject(fullError)
          }
        }
      });
    }.bind(this))
  },

  request: function(querysTable, modelShema, queryParams) {
    //console.log('REQUEST', queryParams);
    if (querysTable == null || querysTable.length == 0) {
      return modelShema.model
        .find()
        .lean()
        .exec()
        .catch(error => {
          let fullError = new Error(error);
          fullError.displayMessage = "Connecteur Mongo :  nous avons rencontré un probleme avec MongoDB";
          throw fullError
        })
    } else {
      try {
        const normalizedQuerysTable = this.normalizeQuerysTable(querysTable, queryParams);
        return eval("modelShema.model." + normalizedQuerysTable + ".lean()")
          .exec()
          .then(data => data || [])
          .catch(error => {
            let fullError = new Error(error);
            fullError.displayMessage = "Connecteur Mongo :  nous avons rencontré un probleme avec votre query MongoDB";
            throw fullError
          })
      } catch (e) {
        if (e instanceof SyntaxError) {
          let fullError = new Error(e);
          fullError.displayMessage = "Connecteur Mongo : Veuillez entre une query valide  ex: findOne({name:'thomas')}";
          return Promise.reject(fullError)
        } else {
          return Promise.reject(e)
        }
      }
    }
  },

  normalizeQuerysTable: function(querysTable, queryParams) {
    let processingQuerysTable = querysTable
    const regex = /{(\£.*?)}/g;
    const elementsRaw = processingQuerysTable.match(regex);
    if (elementsRaw != null) {
      for (let match of elementsRaw) {
        const ObjectKey = match.slice(3, -1);
        //console.log(match, ObjectKey, queryParams, this.dotProp.get(queryParams, ObjectKey));

        processingQuerysTable = processingQuerysTable.replace(match, JSON.stringify(this.dotProp.get(queryParams, ObjectKey)));
      }
      //console.log(processingQuerysTable);
    }
    return processingQuerysTable;
  },

  insert: function(dataFlow, modelShema) {
    return modelShema.model
      .remove({})
      .exec()
      .then(() => {
        const arraySegmentator = new this.ArraySegmentator();
        const segments = arraySegmentator.segment(dataFlow, 100);
        const paramArray = segments.map(s => [modelShema, s])
        const promiseOrchestrator = new this.PromiseOrchestrator();
        promiseOrchestrator.execute(this, this.insertPromise, paramArray, {
          beamNb: 10
        })
      })
  },
  mongoInsert: function(client, database, collectionName, dataFlow) {
    return new Promise((resolve, reject) => {
      try {
        const db = client.db(database)

        //console.log(db);
        const collection = db.collection(collectionName);
        //console.log("collection",collectionName,collection);
        collection.remove({}).then(() => {
          const arraySegmentator = new this.ArraySegmentator();
          const segments = arraySegmentator.segment(dataFlow, 100);
          const paramArray = segments.map(s => [collection, s])
          const promiseOrchestrator = new this.PromiseOrchestrator();
          promiseOrchestrator.execute(this, this.mongoInsertPromise, paramArray, {
            beamNb: 10
          }).then(() => {
            resolve();
          })
        })
      } catch (e) {
        reject(e);
      } finally {
        client.close();
      }
    })
  },
  mongoInsertPromise: function(collection, data) {
    //console.log("mongoInsertPromise",data);
    return collection.insertMany(data)
  },

  insertPromise: function(modelShema, data) {
    return modelShema.model.insertMany(data).exec()
  },


  pull: function(data, dataFlow, queryParams) {
    if (dataFlow === undefined) {
      return new Promise(async (resolve, reject) => {
        const client = await this.mongoInitialise(data.specificData.url);
        try {
          const mongoRequestResolved = await this.mongoRequest(client, data.specificData.querySelect, data.specificData.database, data.specificData.modelName, queryParams)
          resolve({
            data: mongoRequestResolved.result
          })
        } catch (error) {
          reject(error)
        } finally {
          client.close();
        }
      })
    } else {
      return new Promise(async (resolve, reject) => {
        const client = await this.mongoInitialise(data.specificData.url);
        try {
          await this.mongoInsert(client, data.specificData.database, data.specificData.modelName, dataFlow[0].data)
          resolve({data:dataFlow[0].data})
        } catch (error) {
          reject(error)
        } finally {
          client.close();
        }
      })
    }
  }
};
