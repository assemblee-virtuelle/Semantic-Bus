module.exports = {
    type: 'SQL connector',
    description: 'intéroger une base de donnée SQL',
    editor: 'sql-connecteur-editor',
    caminte: require('caminte'),
    mLabPromise: require('../mLabPromise'),
    schema: null,
    modelShema: null,
    initialise: function (driver, host, port, username, password, database) {
        // router.post('/sqlconnecte/:compid', function (req, res) {
        return new Promise(function (resolve, reject) {
            console.log("connenction")
            Schema = this.caminte.Schema,
                config = {
                    driver: driver, // or mariadb
                    host: host,
                    port: port,
                    username: username,
                    password: password,
                    database: database,
                    pool: false, // optional for use pool directly,
                    ssl: true
                };
            console.log(config)
            console.log(Schema)
            // if(Schema != null && config != null){
            this.schema = new Schema(config.driver, config);
            resolve(this.schema)
        }.bind(this))
        // console.log("connected", this.schema)
        // }.bind(this))
    },
    createmodel: function (modelName, data, schema) {
        console.log("create model")
        return new Promise(function (resolve, reject) {
            dataModel = {}
            var name = modelName;
            for (property in data) {
                dataModel[property] = {
                    type: eval("this.schema." + data[property])
                };
            }
            // console.log("model de données connecteur SQL |", dataModel)
            this.modelShema = schema.define(name,
                dataModel
            );
            resolve(this.modelShema)
        }.bind(this))
    },
    request: function (querysTable, modelShema) {
        console.log("request on  model")
        console.log(querysTable)
        return new Promise(function (resolve, reject) {
            if (querysTable.length == 0) {
                console.log("in if")
                console.log(modelShema)
                modelShema.find(
                    {},
                    function (err, dataElements) {
                    console.log(dataElements)
                    resolve(dataElements)
                }.bind(this))
            } else {
                console.log("in else")
                var querys = JSON.parse(querysTable)
                var final_query = {}
                var b = {}
                for (query in querys) {
                    //  console.log(query)
                    if (querys[query].query == "where") {
                        // console.log(querys[query].query )
                        b[querys[query].attributs] = querys[query].value
                        final_query[querys[query].query] = b
                    } else {
                        final_query[querys[query].query] = querys[query].value
                    }
                    // console.log(final_query)
                }
                console.log("in else")
                console.log(final_query)
                modelShema.find(
                    final_query,
                    function (err, data) {
                        if (data) {
                            resolve(data)
                        } else {
                            console.lgo(false)
                            resolve(false)
                        }
                    })
            }
        }.bind(this))
    },
    test: function (data) {
        ///creation du model
        return new Promise((resolve, reject) => {
            this.mLabPromise.request('GET', 'workspaceComponent/' + data._id.$oid).then(function (data) {
                this.initialise(data.specificData.driver, data.specificData.host, data.specificData.port, data.specificData.username, data.specificData.password, data.specificData.database).then(function (shema) {
                    this.createmodel(data.specificData.modelName, data.specificData.jsonSchema, shema).then(function (model) {
                        this.request(data.specificData.querySelect, model).then(function (bddData) {
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