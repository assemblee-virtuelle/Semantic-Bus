<mongo-connecteur-editor>
  <div style="padding: 5%;" class="containerV">
    <label>serveur (sans la base de donnée)
    </label>
    <input type="text" ref="url" value={data.specificData.url}/>
    <label>base de donnée
    </label>
    <input type="text" ref="database" value={data.specificData.database}/>
    <label>nom de la collection</label>
    <input type="text" ref="modelName" value={data.specificData.modelName}/>
    <h3 >
      Valeur( ne mettez pas le model seulement la query)
    </h3>
    <h5 >
      Documentation requetes: http://mongoosejs.com/docs/queries.html</h5>
    <div class=containerH style="flex-grow:1">
      <textarea placeholder="exemple: findOne({ 'email': 'alexbocenty@hotmail.fr' });" type="textarea" ref="querySelect" value={data.specificData.querySelect} style="flex-grow:1">{data.specificData.querySelect}</textarea>
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
