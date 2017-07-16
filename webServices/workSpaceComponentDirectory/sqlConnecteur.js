module.exports = {
    type: 'SQL connector',
    description: 'intéroger une base de donnée SQL',
    editor: 'sql-connecteur-editor',
    caminte: require('caminte'),
    schema:null,
    modelShema: null,
    initialise: function (router) {
        router.post('/sqlconnecte/:compid', function (req, res) {
            Schema = this.caminte.Schema,
                config = {
                    driver: req.body.driver, // or mariadb
                    host: req.body.host,
                    port: req.body.port,
                    username: req.body.username,
                    password: req.body.password,
                    database: req.body.database,
                    pool: false, // optional for use pool directly,
                    ssl: true
                };
            // if(Schema != null && config != null){
            this.schema = new Schema(config.driver, config);
            console.log("connected", this.schema)
            res.send(true)
        }.bind(this))
    },
    createmodel: function (router) {
        router.post('/createmodel/:compid', function (req, res) {
            // var schemaMlab = new Schema("mongoose", config.configMongo);
            var name = req.body.modelName;
            var c = {}
            console.log(req.body.data)
            for (property in req.body.data){
                c["property"] = property;
                c["property"]["type"] =  property[req.body.data];
            }
            this.modelShema = this.schema.define(name, 
                {name:{type: this.schema.String}
            });
            console.log("thisModelShema",this.modelShema)
        }.bind(this))
    },
    request: function (router) {
        router.post('/request/:compid', function (req, res) {
        console.log(this.modelShema)
        // var user = new this.modelShema({name: 'Peter'});
        // user.save(function (err,suer) {
        //   console.log(suer)
        // });
            this.modelShema.all(function(err, users){
                console.log(users)
                res.send(users)
        }) 
        }.bind(this))
    },
    test: function (data) {
        //console.log('REST Get JSON | test : ',data);
        // return this.makeRequest('GET', data.specificData.url);
    }
};