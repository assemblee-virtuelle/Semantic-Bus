module.exports = {
    type: 'SQL connector',
    description: 'intéroger une base de donnée SQL',
    editor: 'sql-connecteur-editor',
    Sequelize: require('sequelize'),
    mLabPromise: require('../mLabPromise'),
    initialise: function (driver, host, port, username, password, database) {
        // router.post('/sqlconnecte/:compid', function (req, res) {
        return new Promise(function (resolve, reject) {

            const sequelize = new this.Sequelize(database, username, password, {
                host: host,
                port:port,
                dialect: driver,
                dialectOptions: {
                    ssl: {
                        require: true
                    }
                },
                ssl: true,
                pool: {
                    max: 5,
                    min: 0,
                    idle: 10000
                },
            });
            console.log(sequelize)
            resolve(sequelize)
            // console.log("connenction")
            // Schema = this.caminte.Schema,
            //     config = {
            //         driver: driver, // or mariadb
            //         host: host,
            //         port: port,
            //         username: username,
            //         password: password,
            //         database: database,
            //         pool: false, // optional for use pool directly,
            //         ssl: true
            //     };
            // console.log(config)
            // console.log(Schema)
            // // if(Schema != null && config != null){
            // this.schema = new Schema(config.driver, config);
            // resolve(this.schema)
        }.bind(this))
        // console.log("connected", this.schema)
        // }.bind(this))
    },
    createmodel: function (modelName, data, sequelize) {

        console.log("create model")
        return new Promise(function (resolve, reject) {
            sequelize.authenticate().then(() => {
                console.log('Connection has been established successfully.');
                dataModel = {}
                var name = modelName;
                for (property in data) {
                    dataModel[property] = {
                        type: eval("this.Sequelize." + data[property])
                    };
                }
                console.log(name)
                // console.log("model de données connecteur SQL |", dataModel)
                this.modelShema = sequelize.define(name,
                    dataModel, {
                        timestamps: false
                    }
                );
                resolve(this.modelShema)
            }).catch(err => {
                resolve("error")
            });

        }.bind(this))
    },
    request: function (querysTable, modelShema, sequelize) {
        console.log("request on  model")
        var final_tableau = []
        return new Promise(function (resolve, reject) {
            if (modelShema == "error") {
                resolve("erreur lors de votre connection")
            } else {
                if (querysTable.length == 0) {
                    console.log(modelShema)
                    console.log("in 0")
                    modelShema.findAll().then(function (result) {
                        result.forEach(function (elem) {
                            final_tableau.push(elem.dataValues)
                        })
                        resolve(final_tableau)
                        sequelize.close()
                        console.log(final_tableau)

                    }).catch(err => {
                        resolve(err)
                        sequelize.close()
                    });
                } else {
                    console.log("in mutltiple")
                    console.log(JSON.parse(querysTable))
                    modelShema.findAll(
                        JSON.parse(querysTable)).then(function (result) {
                        if (result) {
                            console.log(result[0].dataValues)
                            result.forEach(function (elem) {
                                final_tableau.push(elem.dataValues)
                            })
                            console.log(final_tableau)
                            resolve(final_tableau)
                            sequelize.close()
                        } else {
                            console.lgo(false)
                            resolve(false)
                            sequelize.close()
                        }
                    }).catch(err => {
                        resolve(err)
                        sequelize.close()
                    });
                }
            }
        }.bind(this))
    },
    test: function (data) {
        ///creation du model
        return new Promise((resolve, reject) => {
            this.mLabPromise.request('GET', 'workspaceComponent/' + data._id.$oid).then(function (data) {
                this.initialise(data.specificData.driver, data.specificData.host, data.specificData.port, data.specificData.username, data.specificData.password, data.specificData.database).then(function (schemaSeq) {
                    this.createmodel(data.specificData.modelName, data.specificData.jsonSchema, schemaSeq).then(function (model) {
                        this.request(data.specificData.querySelect, model, schemaSeq).then(function (bddData) {
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