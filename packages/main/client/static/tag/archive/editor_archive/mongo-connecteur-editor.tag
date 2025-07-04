<mongo-connecteur-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Mongo" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Mongo
  </div>
  <!-- Champ du composant -->
  <label>Serveur (sans la base de donnée):</label>
  <input type="text" ref="url" value={data.specificData.url}/>
  <label>Base de donnée:</label>
  <input type="text" ref="database" value={data.specificData.database}/>
  <label>Nom de la collection:</label>
  <input type="text" ref="modelName" value={data.specificData.modelName}/>
  <label>Valeur( ne mettez pas le model seulement la query):
    <a href="http://mongoosejs.com/docs/queries.html" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </label>
  <div class="containerH">
    <textarea placeholder="exemple: findOne({ 'email': 'alexbocenty@hotmail.fr' });" type="textarea" ref="querySelect" value={data.specificData.querySelect} style="flex-grow:1">{data.specificData.querySelect}</textarea>
  </div>
  <script>

    //initialize
    this.data = {}
    this.data.specificData = {}

    this.updateData = function (dataToUpdate) {
      console.log("datatoupdate", dataToUpdate)
      this.data = dataToUpdate;
      this.update();
    }.bind(this);

    //mount
    this.on('mount', function () {
      this.connected = false
      this.query = false
      this.refs.url.addEventListener('change', function (e) {
        this.data.specificData.url = e.currentTarget.value;
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

    //unmount
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>

</mongo-connecteur-editor>
