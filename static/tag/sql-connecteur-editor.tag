<sql-connecteur-editor style="justify-content:center; align-items: center;">
  <!-- Titre du composant -->
  <div class="contenaireV title-component">CONNECTEUR SQL</div>
  <!-- Description du composant -->
  <label style="padding-top: 10px;">Intéroger une base de donnée SQL</label>
  <!-- Champ du composant -->
  <div class="containerV"style="align-items:center;">
      <div style="padding-top: 10px;">Configuration de la base à interoger</div>
      <label style="padding-top: 10px;">Driver</label>
      <input class="field" style="width:600px;"placeholder="Driver"type="text" ref="driver" value={data.specificData.driver}/>
      <label style="padding-top: 10px;">Host</label>
      <input class="field" style="width:600px;"placeholder="Host"type="text" ref="host" value={data.specificData.host}/>
      <label style="padding-top: 10px;">Port</label>
      <input class="field" style="width:600px;"placeholder="Port"type="text" ref="port" value={data.specificData.port}/>
      <label style="padding-top: 10px;">User name</label>
      <input class="field" style="width:600px;"placeholder="User name"type="text" ref="username" value={data.specificData.username}/>
      <label style="padding-top: 10px;">Password</label>
      <input class="field" style="width:600px;"placeholder="Password"type="text" ref="password" value={data.specificData.password}/>
      <label style="padding-top: 10px;">Database</label>
      <input class="field" style="width:600px;"placeholder="Database"type="text" ref="database" value={data.specificData.database}/>
      <label style="padding-top: 10px;">Nom de la table</label>
      <input class="field" style="width:600px;"placeholder="Nom de la table"type="text" ref="modelName" value={data.specificData.modelName}/>
      <label >Documentation requêtes: <a style="padding-top: 10px;color: grey"ref="link" href={'http://sql.sh/cours'}>http://sql.sh/cours</a></label>
      <textarea placeholder="exemple: SELECT * FROM 'users'" style="width: 90%;height: 50%; background-color: white;color: rgb(56, 131, 250);padding: 5px;border-radius: 10px;border: 1px solid rgb(56, 131, 250);"
          type="textarea" ref="querySelect" value={data.specificData.querySelect}>
          {data.specificData.querySelect}
      </textarea>
  </div>

  <script>

    //front animation
    this.color1 = "blue";
    this.color2 = "white";
    this.color3 = "white";
    this.connection = true;
    this.editionModel = false;
    this.queryMode = false;

    this.updateData=function(dataToUpdate){
      console.log("datatoupdate",dataToUpdate)
      this.data = dataToUpdate;
      this.update();
    }.bind(this);

    //initialize
    this.data = {}
    this.data.specificData = {}

    this.on('mount', function () {
      this.connected = false
      this.query = false
      this.refs.driver.addEventListener('change', function (e) {
        this.data.specificData.driver = e.currentTarget.value;
      }.bind(this));

      this.refs.host.addEventListener('change', function (e) {
        this.data.specificData.host = e.currentTarget.value;
      }.bind(this));

      this.refs.port.addEventListener('change', function (e) {
        this.data.specificData.port = e.currentTarget.value;
      }.bind(this));

      this.refs.username.addEventListener('change', function (e) {
        this.data.specificData.username = e.currentTarget.value;
      }.bind(this));

      this.refs.password.addEventListener('change', function (e) {
        this.data.specificData.password = e.currentTarget.value;
      }.bind(this));

      this.refs.database.addEventListener('change', function (e) {
        this.data.specificData.database = e.currentTarget.value;
      }.bind(this));

      this.refs.modelName.addEventListener('change', function (e) {
        this.data.specificData.modelName = e.currentTarget.value;
      }.bind(this));

      this.refs.querySelect.addEventListener('change', function (e) {
        this.data.specificData.querySelect = e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed',this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });
  </script>

</sql-connecteur-editor>
