<mongo-connecteur-editor style="justify-content:center; align-items: center;">
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Connecteur MONGODB</div>
  <!-- Description du composant -->
  <label style="padding-top: 10px;">Intéroger une base de donnée Mongo</label>
  <!-- Champ du composant -->
  <div class="containerV"style="align-items:center;">
    <label style="padding-top: 10px;">URL de connexion</label>
    <input class="field" style="width:600px;"placeholder="champ libre" type="text" ref="url" value={data.specificData.url}/>
    <label style="padding-top: 10px;">Nom de la collection</label>
    <input class="field" style="width:600px;"placeholder="champ libre" type="text" ref="modelName" value={data.specificData.modelName}/>
    <label style="padding-top: 10px;">Valeur( ne mettez pas le model seulement la query)</label>
    <label style="padding-top: 10px;">Documentation requêtes:
      <a style="color: grey"ref="link" href={'https://mongoosejs.com/docs/queries.html'}>https://mongoosejs.com/docs/queries.html</a></label>
    <div class=containerH style="flex-grow:1">
      <textarea style="width:600px;" placeholder="exemple: findOne({ 'email': 'alexbocenty@hotmail.fr' });" type="textarea" ref="querySelect" value={data.specificData.querySelect} style="flex-grow:1">{data.specificData.querySelect}</textarea>
    </div>
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
