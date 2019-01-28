'use strict'
module.exports = {
  type: 'SQL',
  description: 'Interroger une base de donnée SQL.',
  editor: 'sql-connecteur-editor',
  graphIcon: 'Sql.png',
  Sequelize: require('sequelize'),
  mLabPromise: require('../mLabPromise'),
  tags: [
    'http://semantic-bus.org/data/tags/inComponents',
    'http://semantic-bus.org/data/tags/BDDComponents'
  ],

  initialise: function (driver, host, port, username, password, database) {
    // console.log("----- initialize sql -----")
    return new Promise(function (resolve, reject) {
      const sequelize = new this.Sequelize(database, username, password, {
        host: host,
        port: port,
        dialect: driver,
        ssl: true,
        pool: {
          max: 100,
          min: 0,
          idle: 10000
        }
      })
      resolve(sequelize)
    }.bind(this))
  },

  createmodel: function (modelName, data, sequelize) {
    // console.log("----- create model sql-----")
    return new Promise(function (resolve, reject) {
      sequelize.authenticate().then(() => {
        // console.log('Connection has been established successfully.');
        dataModel = {}
        var name = modelName
        for (property in data) {
          dataModel[property] = {
            type: eval('this.Sequelize.' + data[property])
          }
        }
        this.modelShema = sequelize.define(name,
          dataModel, {
            timestamps: false
          }
        )
        resolve(this.modelShema)
      }).catch(err => {
        let fullError = new Error(err)
        fullError.displayMessage = 'Connecteur SQL :  Erreur lors de la connexion à SQL'
        reject(fullError)
      })
    }.bind(this))
  },

  request: function (querysTable, modelShema, sequelize) {
    return new Promise(function (resolve, reject) {
      // console.log(querysTable)
      sequelize.query(querysTable, {
        type: sequelize.QueryTypes.SELECT
      })
        .then(users => {
          resolve(users)
        }, function (err) {
          let fullError = new Error(err)
          fullError.displayMessage = 'Connecteur SQL : Mauvais format de requete SQL'
          reject(fullError)
        })
    })
  },

  pull: function (data) {
    return new Promise((resolve, reject) => {
      this.initialise(data.specificData.driver, data.specificData.host, data.specificData.port, data.specificData.username, data.specificData.password, data.specificData.database).then(function (schemaSeq) {
        this.createmodel(data.specificData.modelName, data.specificData.jsonSchema, schemaSeq).then(function (model) {
          this.request(data.specificData.querySelect, model, schemaSeq).then(function (bddData) {
            resolve({
              data: bddData
            })
          }, function (err) {
            reject(err)
          })
        }.bind(this), function (err) {
          reject(err)
        })
      }.bind(this), function (err) {
        reject(err)
      })
    })
  }
}
