'use strict';

class InfluxdbConnector {
  constructor () {
    this.dotProp = require('dot-prop')
    this.schema = null
    this.modelShema = null
    this.stepNode = false
    this.PromiseOrchestrator = require('../../core/helpers/promiseOrchestrator.js')
    this.ArraySegmentator = require('../../core/helpers/ArraySegmentator.js')
    this.stringReplacer = require('../utils/stringReplacer.js'),
    this.ObjectID = require('bson').ObjectID
  }

  mongoInitialise (url) {
    // TO DOOOOO
    return new Promise((resolve, reject) => {
      if (url) {
          this.MongoClient.connect(url).then(client => {
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
}

module.exports = new InfluxdbConnector()
