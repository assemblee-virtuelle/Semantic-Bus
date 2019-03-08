<sql-connecteur-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-SQL" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">{data.type}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">{data.description}</div>
  <!-- Champ du composant -->
  <div>
    <div class="bar"/>
  </div>
  <div>Configuration de la base à interoger</div>
  <label class="labelFormStandard">Driver:</label>  
  <div class="cardInput">
    <input class="inputComponents" placeholder="Driver" type="text" ref="driver" value={data.specificData.driver}/>
  </div>
  <label class="labelFormStandard">Host:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="Host" type="text" ref="host" value={data.specificData.host}/>
  </div>
  <label class="labelFormStandard">Port:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="Port" type="text" ref="port" value={data.specificData.port}/>
  </div>
  <label class="labelFormStandard">User name:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="User name" type="text" ref="username" value={data.specificData.username}/>
  </div>
  <label class="labelFormStandard">Password:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="Password" type="text" ref="password" value={data.specificData.password}/>
  </div>
  <label class="labelFormStandard">Database:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="Database" type="text" ref="database" value={data.specificData.database}/>
  </div>
  <label class="labelFormStandard">Nom de la table:</label>
  <div class="cardInput">  
    <input class="inputComponents" placeholder="Nom de la table" type="text" ref="modelName" value={data.specificData.modelName}/>
  </div>
  <label class="labelFormStandard">Documentation requêtes:
    <a href={'http://sql.sh/cours'} target="_blank"><img src="./image/help.png" alt="Aide" width="15px" height="15px"></a>
  </label class="labelFormStandard">
  <div>
    <textarea class="textArea" placeholder="exemple: SELECT * FROM 'users'" type="textarea" ref="querySelect" value={data.specificData.querySelect}>
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

    this.updateData = function (dataToUpdate) {
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
  <style>
  </style>
</sql-connecteur-editor>
