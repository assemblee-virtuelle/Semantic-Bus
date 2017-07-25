module.exports = {
    type: 'MongoDB connector',
    description: 'intéroger une base de donnée Mongo',
    editor: 'mongo-connecteur-editor',
    mongoose: require('mongoose'),
    mLabPromise: require('../mLabPromise'),
    schema: null,
    modelShema: null,
    initialise: function (url, host, port, username, password, database) {
        // router.post('/sqlconnecte/:compid', function (req, res) {
            console.log(url)
        return new Promise(function (resolve, reject) {
            // if (!url) {
            //     var url = host || 'localhost';
            //     if (port) url += ':' + port;
            //     var auth = '';
            //     if (username) {
            //         auth = username;
            //         if (password) {
            //             auth += ':' + password;
            //         }
            //     }
            //     if (auth) {
            //         url = auth + '@' + url;
            //     }
            //     if (database) {
            //         url += '/' + database;
            //     } else {
            //         url += '/';
            //     }
            //     url = 'mongodb://' + url;
            //     url = url;
            //      resolve(url)
            // }else{
            resolve(url)
            // }
            // mongooseConnection = this.mongoose.connect(url);
            // } else {
            //     mongooseConnection = this.mongoose.connect(url);
            // }
            // resolve(this.schema)
        }.bind(this))
        // console.log("connected", this.schema)
        // }.bind(this))
    },
    createmodel: function (modelName, data, mongoose, url) {
        console.log("create model")
        console.log(modelName)
        return new Promise(function (resolve, reject) {
            dataModel = {}
            var name = modelName;
            var db =  mongoose.createConnection(url);
            // if(modelShema != null){
            //     modelShema.remove(data)
            // }
            var modelShema = db.model(modelName, new mongoose.Schema(
                data
            ));
            resolve({db: db, model: modelShema})
        }.bind(this))
    },
    request: function (querysTable, modelShema, modelName, mongoose) {
        console.log("request on model")
        console.log(querysTable)
        return new Promise(function (resolve, reject) {
            modelShema.db.once('connected', function () {
                console.log("connecter db 2")
                if (querysTable.length == 0) {
                    modelShema.model.find(
                        function (err, dataElements) {
                            
                            resolve(dataElements)
                            // delete mongoose.models[modelName]
                            // modelShema.db.connection.close();
                        }.bind(this))
                } else {
                    console.log("in mutltiple")
                    var query = eval("modelShema.model" + "." + querysTable)
                    console.log(query)
                    query.exec(function (err, data) {
                        if (data) {
                            // console.log(data)
                            resolve(data)
                            // modelShema.db.connection.close();

                        } else {
                            console.lgo(false)
                            resolve(false)
                            // modelShema.db.connection.close();
                        }
                    }.bind(this)).catch(err => resolve("error"))
                }
            }.bind(this));

        }.bind(this))
    },
    pull: function (data) {
        ///creation du model
        console.log("IN pull")
        return new Promise((resolve, reject) => {
            var mongoose = require('mongoose');
            this.mLabPromise.request('GET', 'workspaceComponent/' + data._id.$oid).then(function (data) {
                this.initialise(data.specificData.url, data.specificData.host, data.specificData.port, data.specificData.username, data.specificData.password, data.specificData.database).then(function (url) {
                    this.createmodel(data.specificData.modelName, data.specificData.jsonSchema, mongoose, url).then(function (model) {
                        this.request(data.specificData.querySelect, model, data.specificData.modelName, url, mongoose).then(function (bddData) {
                            console.log("final result", bddData)
                            resolve({
                                data: bddData
                            })
                        })
                    }.bind(this))
                }.bind(this))
            }.bind(this))
        })
    }
};