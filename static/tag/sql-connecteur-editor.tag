<sql-connecteur-editor>
<div if={!connected && !query}>
    <div>description de quel type de base a interoger</div>
    <label>url</label>
    <input type="text" name="driver" value={data.specificData.driver}></input>
    <label>host</label>
    <input type="text" name="host" value={data.specificData.host}></input>
    <label>port</label>
    <input type="text" name="port" value={data.specificData.port}></input>
    <label>username</label>
    <input type="text" name="username" value={data.specificData.username}></input>
    <label>password</label>
    <input type="text" name="password" value={data.specificData.password}></input>
    <label>database</label>
    <input type="text" name="database" value={data.specificData.database}></input>
    <button class="sql-btn"  onclick = {connectesql} type="button">Connexion</button>
</div>
<div if={connected && !query}>
    <div>configuration vos models objects de base de donnée</div>
    <label>nom du model</label>
    <input type="text" name="modelName" value={data.specificData.modelName}></input>
    <jsonEditor name="jsonSchema" title="Schema Caminte" style="flex:1;height: 50vh;"  modes="['tree','text']"></jsonEditor>
    <div style="display: flex;justify-content: center;margin-top: 5%;" >
        <button class="sql-btn"  onclick = {validateModel} type="button">Valider model</button>
        <button class="sql-btn"  onclick = {backConnection} type="button">Retour</button>
    </div>
</div>
<div if={!connected && query}>
    <div>Entrez votre requete select</div>
        <input type="text" name="querySelect" value={data.specificData.querySelect}></input>
        <button class="sql-btn"  onclick = {backModel} type="button">Retour</button>
        <button class="sql-btn"  onclick = {request} type="button">Envoyer requete</button>
    </div>
</div>
<script>
    this.innerData={};

    this.connectesql = function(){
        RiotControl.trigger('connectesql', this.data.specificData)
        this.connected = true
        this.query = false
    }

    RiotControl.on('connectesqltrue', function(){
        console.log(this.connected,"connected trigger")
        this.connected = true
    }.bind(this))

    this.validateModel = function(){
        console.log(this.tags.jsonSchema.data);
        this.query = true
        this.connected = false
        RiotControl.trigger('validateModel', {modelName:data.specificData.modelName, data: this.tags.jsonSchema.data})
    }


    this.request = function(){
        this.query = true
        this.connected = false
        RiotControl.trigger('request', data.specificData.querySelect)
    }

    this.backConnection = function(){
        this.connected = false
        this.query = false
    }


    this.backModel = function(){
        this.query = false
    }


    Object.defineProperty(this, 'data', {
       set: function (data) {
         this.innerData=data;
         //this.tags.jsonSchema.data= data.specificData.model;
         console.log("json shema", this.tags.jsonSchema.data)
         this.update();
       }.bind(this),
       get: function () {
        //this.innerData.specificData.model = this.tags.jsonSchema.data;
        return this.innerData;
      },
      configurable: true
    });
    this.on('mount', function (){
      this.connected = false
      this.query = false
      this.driver.addEventListener('change',function(e){
        this.innerData.specificData.driver=e.currentTarget.value;
      }.bind(this));
            this.host.addEventListener('change',function(e){
        this.innerData.specificData.host=e.currentTarget.value;
      }.bind(this));

      this.port.addEventListener('change',function(e){
        this.innerData.specificData.port=e.currentTarget.value;
      }.bind(this));

      this.username.addEventListener('change',function(e){
        this.innerData.specificData.username=e.currentTarget.value;
      }.bind(this));

      this.password.addEventListener('change',function(e){
        this.innerData.specificData.password=e.currentTarget.value;
      }.bind(this));

      this.database.addEventListener('change',function(e){
        this.innerData.specificData.database=e.currentTarget.value;
      }.bind(this));

      this.querySelect.addEventListener('change',function(e){
        this.innerData.specificData.querySelect=e.currentTarget.value;
      }.bind(this));

      this.modelName.addEventListener('change',function(e){
        this.innerData.specificData.modelName=e.currentTarget.value;
      }.bind(this));

      

      RiotControl.on('item_current_changed',function(data){
        this.innerData=data;
        this.update();
      }.bind(this));
    });
  </script>
  <style> 
    .sql-btn {
      color: #ffffff;
      background-color: #F89406;
      border: none;
      padding:10px;
      border-radius: 5px 5px 5px 5px;
      text-align:center;
      max-width: 25%;
      margin-left: 5%;
      margin-top: 5%;
    }
</style>

</sql-connecteur-editor>