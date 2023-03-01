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
  <label class="labelFormStandard">Nom de la mesure:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="measurement" value={data.specificData.measurement} placeholder="electricitySensors" onchange={measurementChange}/>
  </div>
  <label class="labelFormStandard">Champs d'id:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="tagKey" value={data.specificData.tagKey} onchange={tagChange}/>
  </div>
  <label class="labelFormStandard">Champs contenant le timestamp:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="timestamp" value={data.specificData.timestamp} onchange={timestampChange}/>
  </div>

<script>

  this.data = {};
  this.data.specificData= {};
  this.data.specificData.measurement = '';
  this.data.specificData.tagKey = '';
  this.data.specificData.timestamp = '';

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
    this.refs.timestamp.data = this.data.specificData.timestamp;
    this.refs.tagKey.data = this.data.specificData.tagKey;
    this.refs.measurement.data = this.data.specificData.measurement;
    this.update();
  }.bind(this);

  this.on('mount', function () {
    RiotControl.on('item_current_changed',this.updateData);
  });
  this.on('unmount', function () {
    RiotControl.off('item_current_changed', this.updateData);
  });
</script>

</influxdb-connector-editor>
