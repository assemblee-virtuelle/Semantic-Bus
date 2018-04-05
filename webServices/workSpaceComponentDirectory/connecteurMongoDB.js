"use strict";
module.exports = {
  type: 'MongoDB connector',
  description: 'intéroger une base de donnée Mongo',
  editor: 'mongo-connecteur-editor',
  mongoose: require('mongoose'),
  //mLabPromise: require('../mLabPromise'),
  graphIcon: 'mongoDbConnector.png',
  dotProp : require('dot-prop'),
  tags: [
    'http://semantic-bus.org/data/tags/inComponents',
    'http://semantic-bus.org/data/tags/outComponents',
    'http://semantic-bus.org/data/tags/BDDComponents'
  ],
  schema: null,
  modelShema: null,
  stepNode: true,


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
    //console.log("----- create model mongoose -----")
    return new Promise(function(resolve, reject) {
      let dataModel = {}
      var name = modelName;
      var db = this.mongoose.createConnection(url, (error) => {
        if (error) {
          let fullError = new Error(error);
          fullError.displayMessage = "Connecteur Mongo :  Veuillez entre une uri de connexion valide";
          reject(fullError)
        } else {
          var modelShema = db.model(modelName, new this.mongoose.Schema({}, {
            strict: false
          }), modelName);
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


  request: function(querysTable, modelShema,queryParams) {
    //console.log("----- request mongoose -----", querysTable)
    return new Promise((resolve, reject)=> {
      //   modelShema.db.once('connected', function () {
      //     console.log("----- in connected mongo ------", querysTable)
      if (querysTable == null || querysTable.length == 0) {
        modelShema.model.find().lean().exec(
          function(err, dataElements) {
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
          //console.log(querysTable);
          const regex = /{(\£.*?)}/g;
          let elementsRaw = querysTable.match(regex);
          if (elementsRaw != null) {
            for (let match of elementsRaw) {
              let ObjectKey=match.slice(3, -1);
              console.log(match,ObjectKey,queryParams);

              querysTable=querysTable.replace(match,this.dotProp.get(queryParams, ObjectKey));


            }
            console.log(querysTable);
          }

          var query = eval("modelShema.model." + querysTable+".lean()")
          query.exec(function(err, data) {
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
          }else{
            reject(e)
          }
        }
      }
    });
  },

  insert: function(dataFlow, modelShema) {
    //console.log("----- request mongoose -----", querysTable)
    return new Promise(function(resolve, reject) {
      //   modelShema.db.once('connected', function () {
      //     console.log("----- in connected mongo ------", querysTable)
      try {
        //console.log('insert',dataFlow);
        new Promise((resolve, reject) => {
          modelShema.model.remove({}, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          })
        }).then(() => {
          modelShema.model.create(dataFlow, (err, docs) => {
            //console.log('after create', docs, err);
            if (err) {
              reject(err);
            } else {
              resolve(docs)
            }
          })
        });

      } catch (e) {
        //if (e instanceof SyntaxError) {
        //let fullError = new Error(e);
        //fullError.displayMessage = "Connecteur Mongo : Veuillez entre une query valide  ex: findOne({name:'thomas')}";
        reject(e)
        //}
      }

    });
  },


  pull: function(data, dataFlow, queryParams) {
    return new Promise((resolve, reject) => {

      if (dataFlow == undefined) {
        this.initialise(data.specificData.url).then((url)=> {
          this.createmodel(data.specificData.modelName, data.specificData.jsonSchema, url).then((model)=> {
            this.request(data.specificData.querySelect, model,queryParams).then((finalRes)=> {
              resolve({
                data: finalRes
              })
            }, (error)=> {
              reject(error)
            })
          }, (error) => {
            reject(error)
          })
        }, (error)=> {
          reject(error)
        })
      } else {

        this.initialise(data.specificData.url).then((url) => {
          this.createmodel(data.specificData.modelName, data.specificData.jsonSchema, url).then((model) => {
            this.insert(dataFlow[0].data, model).then((finalRes) => {
              this.request(data.specificData.querySelect, model,queryParams).then((finalRes) => {
                resolve({
                  data: finalRes
                })
              }, function(error) {
                reject(error)
              })
            }, (error) => {
              reject(error)
            })
          }, (error) => {
            reject(error)
          })
        }, (error) => {
          reject(error)
        })
      }

    })
  }
};
