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
    createmodel: function (modelName, data) {
        console.log("create model")
        console.log(modelName)
        return new Promise(function (resolve, reject) {
            dataModel = {}
            var name = modelName;
            // for (property in data) {
            //     dataModel[property] = {
            //         type: eval("this.schema." + data[property])
            //     };
            // }
            // console.log(data)
            // console.log("model de données connecteur SQL |", dataModel)
            var modelShema = this.mongoose.model(modelName, this.mongoose.Schema(
                data
            ));
            resolve(modelShema)
        }.bind(this))
    },
    request: function (querysTable, modelShema, modelName, url) {
        console.log("request on model")
        // console.log(schema.client.disconnect())
        return new Promise(function (resolve, reject) {
            console.log(url)
            // delete this.mongoose.connections[0].models[modelName]
            var db  = this.mongoose.createConnection(url)
            console.log(db)
            // db.on('error', console.log('connection error:'));
            // console.log(db)
            db.once('connected', function () {
                console.log("connecter")
                //  delete this.mongoose.connections[0].models[modelName]
                if (querysTable.length == 0) {
                    modelShema.find(
                        function (err, dataElements) {
                            console.log(dataElements)
                            resolve(dataElements)
                            delete this.mongoose.models[modelName]
                            this.mongoose.connection.close();
                            // schema.client.connection.close();
                            // console.log(schema.client)
                        }.bind(this))
                } else {
                    console.log("in mutltiple")
                    var query = modelShema.find({
                        email: "alexbocenty@hotmail.fr"
                    });
                    console.log(query)
                    query.exec(function (err, data) {
                        if (data) {
                            console.log(data)
                            resolve(data)
                            delete this.mongoose.models[modelName]
                            this.mongoose.connection.close();

                        } else {
                            console.lgo(false)
                            resolve(false)
                            this.mongoose.connection.close();

                        }
                    }.bind(this))
                }
            }.bind(this));

        }.bind(this))
    },
    test: function (data) {
        ///creation du model
        console.log("IN TEST")
        return new Promise((resolve, reject) => {
            this.mLabPromise.request('GET', 'workspaceComponent/' + data._id.$oid).then(function (data) {
                this.initialise(data.specificData.url, data.specificData.host, data.specificData.port, data.specificData.username, data.specificData.password, data.specificData.database).then(function (url) {
                    this.createmodel(data.specificData.modelName, data.specificData.jsonSchema).then(function (model) {
                        this.request(data.specificData.querySelect, model, data.specificData.modelName, url).then(function (bddData) {
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