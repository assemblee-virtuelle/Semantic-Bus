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
  <!--  Formulaire de choix lie au composant  -->
  <form action='' ref="actionToggle" id="actionToggle">
    <p>Choix de l'action à réaliser : </p>
    <input type="radio" id="inserer" name="action" value="inserer" ref="insertChecked" onchange={saveRadioState} checked={data.specificData.insertChecked}>
    <label for="inserer">Insérer des données</label><br>
    <input type="radio" id="requeter" name="action" value="requeter" ref="requestChecked" onchange={saveRadioState} checked={data.specificData.requestChecked}>
    <label for="requeter">Requêter des données</label><br>
    <input type="radio" id="supprimer" name="action" value="supprimer" ref="deleteChecked" onchange={saveRadioState} checked={data.specificData.deleteChecked}>
    <label for="supprimer">Supprimer des données</label>
  </form>
  <div>
    <div class="bar"/>
  </div>
  <!--  Url influxdb  -->
  <label class="labelFormStandard">Url Influxdb:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="url" value={data.specificData.url} placeholder="https://db.influxdb.com" onchange={urlChange}/>
  </div>
  <!--  Clé d'api influxdb  -->
   <label class="labelFormStandard">Clé Influxdb:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="apiKey" value={data.specificData.apiKey} placeholder="7e9f5Tu..." onchange={apiKeyChange}/>
  </div>
  <!--  Organisation  -->
   <label class="labelFormStandard">Organisation:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="organization" value={data.specificData.organization} placeholder="Data-Players" onchange={organizationChange}/>
  </div>
  <!--  Elements nécessaires pour suppression ou insertion  -->
    <!--  Bucket  -->
  <div id= "bucketMeasureType" style='display:none;'>
    <div id="bucket">
      <label class="labelFormStandard">Bucket:</label>
      <div class="cardInput">
        <input class="inputComponents" type="text" ref="bucket" value={data.specificData.bucket} placeholder="Test" onchange={bucketChange}/>
      </div>
    </div>
    <!--  Nom de la mesure  -->
    <label class="labelFormStandard">Nom de la mesure:</label>
    <div class="cardInput">
      <input class="inputComponents" type="text" ref="measurement" value={data.specificData.measurement} placeholder="electricitySensors" onchange={measurementChange}/>
    </div>
  </div>
  <!--  Insertion des données  -->
  <div id="insertData" show={ data.specificData.insertChecked == 'checked' }>
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
  </div>
  <!--  Requetage des données  -->
  <div id="queryData" show={ data.specificData.requestChecked == 'checked' }>
    <label>Valeur(Mettre uniquement query de recherche de données):
      <a href="https://docs.influxdata.com/influxdb/v2.6/reference/syntax/influxql/spec/" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
    </label>
    <div class="containerH">
      <textarea class="textArea" placeholder="from(bucket:'Test') |> range(start: -3d) |> filter(fn: (r) => r._measurement == 'electricitySensors')" type="textarea" ref="querySelect" onchange={querySelectChange} value={data.specificData.querySelect} style="flex-grow:1">{data.specificData.querySelect}</textarea>
    </div>
  </div>
    <!--  Suppression des données  -->
  <div id="deleteData" show={ data.specificData.deleteChecked == 'checked' }>
    <label class="labelFormStandard">Tag utilisé pour la suppression:</label>
    <div class="cardInput">
      <input class="inputComponents" type="text" ref="deleteTag" value={data.specificData.deleteTag} placeholder="location" onchange={deleteTagChange}/>
    </div>
    <label class="labelFormStandard">Valeur du tag en question:</label>
    <div class="cardInput">
      <input class="inputComponents" type="text" ref="deleteTagValue" value={data.specificData.deleteTagValue} placeholder="coma" onchange={deleteTagValueChange}/>
    </div>
  </div>


<script>

  this.data = {};
  this.data.specificData= {};
  this.data.specificData.measurement = '';
  this.data.specificData.tagKey = '';
  this.data.specificData.timestamp = '';
  this.data.specificData.apiKey = '';
  this.data.specificData.url = '';
  this.data.specificData.bucket = '';
  this.data.specificData.organization = '';
  this.data.specificData.querySelect = '';
  this.data.specificData.choice = '';
  this.data.specificData.deleteTag = '';
  this.data.specificData.deleteTagValue = '';
  this.data.specificData.tags = [];

  this.data.specificData.insertChecked = '';
  this.data.specificData.deleteChecked = '';
  this.data.specificData.requestChecked = '';

  //code for the show/hide each component part
  showHideElements(checkedRadioValue) {
    if (checkedRadioValue == "requeter") {
      this.data.specificData.insertChecked = '';
      this.data.specificData.deleteChecked = '';
      this.data.specificData.requestChecked = 'checked';
    } else if (checkedRadioValue == "supprimer") {
      this.data.specificData.insertChecked = '';
      this.data.specificData.deleteChecked = 'checked';
      this.data.specificData.requestChecked = '';
    } else if (checkedRadioValue == "inserer") {
      this.data.specificData.insertChecked = 'checked';
      this.data.specificData.deleteChecked = '';
      this.data.specificData.requestChecked = '';
    }
  }

  saveRadioState(){
    console.log('LOL', 'saveRadioState');
    this.checkedRadio = document.querySelector('input[name="action"]:checked')
    if (this.checkedRadio) {
      this.showHideElements(this.checkedRadio.value);
    }
  }
  //end of the code for show/hide elements

  //beggining of code for the input section
  addRowClick(e) {
    this.refs.tagsTable.data.push({})
  }
  //end of code for the input section

  deleteTagValueChange(e){
    this.data.specificData.deleteTagValue = e.target.value;
  }
  deleteTagChange(e) {
    this.data.specificData.deleteTag = e.target.value;
  }
  measurementChange(e) {
    this.data.specificData.measurement = e.target.value;
  }
  tagChange(e) {
    this.data.specificData.tagKey = e.target.value;
  }
  timestampChange(e) {
    this.data.specificData.timestamp = e.target.value;
  }
  apiKeyChange(e) {
    this.data.specificData.apiKey = e.target.value;
  }
  urlChange(e) {
    this.data.specificData.url = e.target.value;
  }
  bucketChange(e) {
    this.data.specificData.bucket = e.target.value;
  }
  organizationChange(e) {
    this.data.specificData.organization = e.target.value;
  }
  deleteChange(e){
    this.data.specificData.deleteData = e.target.checked
  }
  querySelectChange(e){
    this.data.specificData.querySelect = e.target.value;
  }

  this.updateData=function(dataToUpdate){
    this.data = dataToUpdate;
   // this.refs.tagsTable.data = this.data.specificData.tags;
    this.refs.timestamp.data = this.data.specificData.timestamp;
    this.refs.measurement.data = this.data.specificData.measurement;
    this.refs.apiKey.data = this.data.specificData.apiKey;
    this.refs.url.data = this.data.specificData.url;
    this.refs.bucket.data = this.data.specificData.bucket;
    this.refs.organization.data = this.data.specificData.organization;
    this.refs.tagsTable.data = this.data.specificData.tags || [];
    this.refs.deleteData = this.data.specificData.deleteData || false;
    this.refs.querySelect = this.data.specificData.querySelect;
    this.refs.choice = this.data.specificData.choice;
    this.refs.deleteTag = this.data.specificData.deleteTag;
    this.refs.deleteTagValue = this.data.specificData.deleteTagValue;
    this.refs.insertChecked = this.data.specificData.insertChecked;
    this.refs.deleteChecked = this.data.specificData.deleteChecked;
    this.refs.requestChecked = this.data.specificData.requestChecked;
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