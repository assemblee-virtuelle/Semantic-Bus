<sql-connecteur-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-SQL" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">SQL</div>
  <!-- Description du composant -->
  <div>Interroger une base de donnée SQL.</div>
  <!-- Champ du composant -->
  <div>Configuration de la base à interoger</div>
  <label>Driver:</label>
  <input placeholder="Driver" type="text" ref="driver" value={data.specificData.driver}/>
  <label>Host:</label>
  <input placeholder="Host" type="text" ref="host" value={data.specificData.host}/>
  <label>Port:</label>
  <input placeholder="Port" type="text" ref="port" value={data.specificData.port}/>
  <label>User name:</label>
  <input placeholder="User name" type="text" ref="username" value={data.specificData.username}/>
  <label>Password:</label>
  <input placeholder="Password" type="text" ref="password" value={data.specificData.password}/>
  <label>Database:</label>
  <input placeholder="Database" type="text" ref="database" value={data.specificData.database}/>
  <label>Nom de la table:</label>
  <input placeholder="Nom de la table" type="text" ref="modelName" value={data.specificData.modelName}/>
  <label >Documentation requêtes:
    <a href={'http://sql.sh/cours'} target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </label>
  <textarea placeholder="exemple: SELECT * FROM 'users'" style="color: rgb(56, 131, 250);padding: 5px;border-radius: 10px;border: 1px solid rgb(56, 131, 250);" type="textarea" ref="querySelect" value={data.specificData.querySelect}>
    {data.specificData.querySelect}
  </textarea>

  <script>

    //front animation
    this.color1 = "blue";
    this.color2 = "white";
    this.color3 = "white";
    this.connection = true;
    this.editionModel = false;
    this.queryMode = false;

    this.updateData = function (dataToUpdate) {
      console.log("datatoupdate", dataToUpdate)
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

      RiotControl.on('item_current_changed', this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>

</sql-connecteur-editor>
