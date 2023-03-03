<influxdb-connector-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Influxdb" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
 <!-- Titre du composant -->
  <div class="contenaireV title-component">{data.type}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">{data.description}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Champ du composant -->
  <!--  Nom de la mesure  -->
  <label class="labelFormStandard">Nom de la mesure:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="measurement" value={data.specificData.measurement} placeholder="electricitySensors" onchange={measurementChange}/>
  </div>
  <!--  Timestamp  -->
  <label class="labelFormStandard">Champs contenant le timestamp:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="timestamp" value={data.specificData.timestamp} onchange={timestampChange}/>
  </div>
  <!--  Champs d'id  -->
  <label class="labelFormStandard">Champs d'id:</label>
  <div class="cardInput">
    <div onclick={addRowClick} class="btnFil commandButtonImage">
        Ajouter
        <img class="imgFil" src="./image/ajout_composant.svg" title="Importer un Workflow">
        <input onchange={import} ref="import" type="file" style="display:none;"/>
      </div>
    </div>
    <zentable ref="tagsTable" title="tag(s) a choisir" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
      <yield to="row">
        <input placeholder="Tag" type="text" style="flex-basis:90%; margin: 5px" value={tag} data-field="tag"/>
      </yield>
    </zentable>

<script>

  this.data = {};
  this.data.specificData= {};
  this.data.specificData.measurement = '';
  this.data.specificData.tagKey = '';
  this.data.specificData.timestamp = '';
  this.data.specificData.tags = [];

  //beggining of code for the input section
  addRowClick(e) {
    this.refs.tagsTable.data.push({})
  }
  //end of code for the input section

  measurementChange(e) {
    this.data.specificData.measurement = e.target.value;
  }

  tagChange(e) {
    this.data.specificData.tagKey = e.target.value;
  }

  timestampChange(e) {
    this.data.specificData.timestamp = e.target.value;
  }

  this.updateData=function(dataToUpdate){
    this.data = dataToUpdate;
   // this.refs.tagsTable.data = this.data.specificData.tags;
    this.refs.timestamp.data = this.data.specificData.timestamp;
    this.refs.measurement.data = this.data.specificData.measurement;
    this.refs.tagsTable.data = this.data.specificData.tags || [];
    this.update();
  }.bind(this);

  this.on('mount', function () {
    this.refs.tagsTable.on('dataChanged', data => {
      this.data.specificData.tags = data;
    });
    this.refs.tagsTable.on('delRow', row => {
        this.refs.tagsTable.data.splice(row.rowid, 1);
      });
    RiotControl.on('item_current_changed',this.updateData);
  });
  this.on('unmount', function () {
    RiotControl.off('item_current_changed', this.updateData);
  });
</script>

<style>
.hide {
  display: none;
}
</style>

</influxdb-connector-editor>
