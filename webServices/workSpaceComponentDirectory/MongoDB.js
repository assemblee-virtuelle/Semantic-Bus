"use strict";
module.exports = {
  type: 'MongoDB connector',
  description: 'intéroger une base de donnée Mongo',
  editor: 'mongo-connecteur-editor',
  mongoose: require('mongoose'),
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
    console.log('REQUEST', queryParams);
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

  insertPromise: function(modelShema, data) {
    return modelShema.model.insertMany(data).exec()
  },


  pull: function(data, dataFlow, queryParams) {
    if (dataFlow === undefined) {
      return this.initialise(data.specificData.url)
        .then(url => this.createmodel(data.specificData.modelName, data.specificData.jsonSchema, url))
        .then(model => this.request(data.specificData.querySelect, model, queryParams))
        .then(finalRes => ({
          data: finalRes
        }))
    } else {
      return this.initialise(data.specificData.url)
        .then(url => this.createmodel(data.specificData.modelName, data.specificData.jsonSchema, url))
        .then(model => this.insert(dataFlow[0].data, model))
        .then(finalRes => ({
          data: finalRes
        }))
    }
  }
};
