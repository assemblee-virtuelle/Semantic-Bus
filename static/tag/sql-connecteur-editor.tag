<sql-connecteur-editor>
  <div style ="padding: 5%;">
      <div>Configuration de la base à interoger</div>
      <label>driver</label>
      <input type="text" ref="driver" value={data.specificData.driver}/>
      <label>host</label>
      <input type="text" ref="host" value={data.specificData.host}/>
      <label>port</label>
      <input type="text" ref="port" value={data.specificData.port}/>
      <label>username</label>
      <input type="text" ref="username" value={data.specificData.username}/>
      <label>password</label>
      <input type="text" ref="password" value={data.specificData.password}/>
      <label>database</label>
      <input type="text" ref="database" value={data.specificData.database}/>
      <label>nom de la table</label>
      <input type="text" ref="modelName" value={data.specificData.modelName}/>
      <h5 style="margin-top:2%;"> Requete : Documentation requetes: http://sql.sh/cours</h5>
      <textarea placeholder="exemple: SELECT * FROM 'users'" style="width: 100%;height: 50%; background-color: white;color: rgb(56, 131, 250);padding: 5px;border-radius: 10px;border: 1px solid rgb(56, 131, 250);"
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