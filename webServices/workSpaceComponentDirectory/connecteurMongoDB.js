module.exports = {
  type: 'MongoDB connector',
  description: 'intéroger une base de donnée Mongo',
  editor: 'mongo-connecteur-editor',
  mongoose: require('mongoose'),
  mLabPromise: require('../mLabPromise'),
  graphIcon: 'mongoDbConnector.png',
  tags:[
    'http://semantic-bus.org/data/tags/inComponents',
    'http://semantic-bus.org/data/tags/BDDComponents'
  ],
  schema: null,
  modelShema: null,

  getPriceState: function(){
    return new Promise((resolve,reject)=>{
      resolve({state:true})
    })
  },
  initialise: function (url) {
    //console.log("----- create uri connexion -----")
    return new Promise(function (resolve, reject) {
      if (url) {
        resolve(url)
      } else {
        let fullError = new Error("bad uri mongo connector");
        fullError.displayMessage = "Connecteur Mongo : Veuillez entre une uri de connexion valide";
        reject(fullError)
      }
    }.bind(this))
  },


  createmodel: function (modelName, data, mongoose, url) {
    //console.log("----- create model mongoose -----")
    return new Promise(function (resolve, reject) {
      dataModel = {}
      var name = modelName;
      var db = mongoose.createConnection(url, function (error) {
        if (error) {
          let fullError = new Error(error);
          fullError.displayMessage = "Connecteur Mongo :  Veuillez entre une uri de connexion valide";
          reject(fullError)
        } else {
          var modelShema = db.model(modelName, new mongoose.Schema(
          ));
          if (modelName != null) {
            resolve({
              db: db,
              model: modelShema
            })
          } else {
            let fullError = new Error("vous n'avez pas saisie de nom de table à requeter");
            fullError.displayMessage = "Connecteur Mongo :  vous n'avez pas saisie de nom de table à requeter ";
            reject(fullError)
          }
        }
      });
    }.bind(this))
  },


  request: function (querysTable, modelShema) {
    //console.log("----- request mongoose -----", querysTable)
    return new Promise(function (resolve, reject) {
    //   modelShema.db.once('connected', function () {
    //     console.log("----- in connected mongo ------", querysTable)
        if (querysTable == null || querysTable.length  == 0) {
          modelShema.model.find(
            function (err, dataElements) {
              resolve(dataElements)
              if (err) {
                let fullError = new Error(err);
                fullError.displayMessage = "Connecteur Mongo :  nous avons rencontré un probleme avec  MongoDB";
                reject(fullError)
              }
            }
          )
        } else {
          try {
            //console.log("----- in try mongo ------")
            var query = eval("modelShema.model" + "." + querysTable)
            query.exec(function (err, data) {
              if (data) {
                //console.log(data)
                resolve(data)
              }
              if (err) {
                //console.log(err)
                let fullError = new Error(err);
                fullError.displayMessage = "Connecteur Mongo :  nous avons rencontré un probleme avec votre query MongoDB";
                reject(fullError)
              }
              if (data == null) {
                resolve([])
              }
            })
          } catch (e) {
            if (e instanceof SyntaxError) {
              let fullError = new Error(e);
              fullError.displayMessage = "Connecteur Mongo : Veuillez entre une query valide  ex: findOne({name:'thomas')}";
              reject(fullError)
            }
          }
        }
      });
  },

  pull: function (data) {
    return new Promise((resolve, reject) => {
      var mongoose = require('mongoose');
      this.initialise(data.specificData.url).then(function (url) {
        this.createmodel(data.specificData.modelName, data.specificData.jsonSchema, mongoose, url).then(function (model) {
          this.request(data.specificData.querySelect, model).then(function (finalRes) {
            resolve({
              data: finalRes
            })
          }.bind(this), function (error) {
            reject(error)
          })
        }.bind(this), function (error) {
          reject(error)
        })
      }.bind(this), function (error) {
        reject(error)
      })
    })
  }
};
