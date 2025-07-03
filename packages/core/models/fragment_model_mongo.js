'use strict';
const MongoClient = require('../db/mongo_client');
const FragmentSchema = require('../model_schemas/fragment_schema');
// const config = require('../../config.json');
const mongoose = require('mongoose');
const config = require('../getConfiguration.js')();

class FragmentModelSingleton {
  constructor() {
    this.instance = null; // Initialisation de l'instance
    this.initializing = false; // Ajout d'un état d'initialisation
  }

  static async getInstance() {
    try {
      if (this.instance == null && !this.initializing) { // Vérifiez si l'initialisation est en cours
        this.initializing = true; // Marquez comme en cours d'initialisation
        this.instance = new FragmentModel(); // Création d'une nouvelle instance
        await this.instance.init(); // Appel de l'initialisation
        this.initializing = false; // Réinitialisez l'état d'initialisation
      } else if (this.initializing) {
        // Attendre que l'initialisation soit terminée
        await new Promise(resolve => {
          const checkInitialization = setInterval(() => {
            if (!this.initializing) {
              clearInterval(checkInitialization);
              resolve();
            }
          }, 100); // Vérifie toutes les 100 ms
        });
      }
    } catch (err) {
      console.log('err', err);
      this.initializing = false; // Réinitialisez même en cas d'erreur
    }
    return this.instance;
  }
}

class FragmentModel {
  constructor() {
    // console.log('config', config);
    this._model = null; // Initialisation du modèle
  }

  async init() {
    try {
      const conn = await mongoose.connect(config.mongodbFlowDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        minPoolSize: 20,
        maxPoolSize: 20
      });

      this._model = conn.model('fragment', FragmentSchema);
      // conn.on('disconnected', function () {
      //   console.log('Mongoose default connection disconnected');
      // });
    } catch (err) {
      console.log('Mongoose default connection error: ' + err); // Gestion de l'erreur
    }
  }

  get model() {
    return this._model;
  }
}

module.exports = FragmentModelSingleton;
