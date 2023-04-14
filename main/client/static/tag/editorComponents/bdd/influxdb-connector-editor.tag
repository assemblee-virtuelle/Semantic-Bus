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
 <!--  Formulaire de choix lie au composant  -->
  <form action='' ref="actionToggle" id="actionToggle" onchange={saveRadioState}>
    <fieldset class="fieldsetInflux">
      <p>Choix de l'action à réaliser : </p>
      <input type="checkbox" id="supprimer" name="action" value="supprimer" ref="deleteChecked" checked={data.specificData.deleteChecked}>
        <label for="supprimer">Supprimer des données</label><br>
      <input type="checkbox" id="inserer" name="action" value="inserer" ref="insertChecked" checked={data.specificData.insertChecked}>
        <label for="inserer">Insérer des données</label><br>
      <input type="checkbox" id="requeter" name="action" value="requeter" ref="requestChecked" checked={data.specificData.requestChecked}>
        <label for="requeter">Requêter des données</label><br>
    </fieldset>
  </form>
  <!--  Suppression des données  -->
  <div id= "bucketMeasureType" show={data.specificData.deleteChecked == 'checked'}>
    <div>
      <div class="bar"/>
      <label class="labelFormStandard">Suppression des données :</label>
      <div class="bar"/>
    </div>
    <!--  Bucket suppression  -->
    <label class="labelFormStandard">Bucket:</label>
    <div class="cardInput">
      <input class="inputComponents" type="text" ref="bucketDelete" value={data.specificData.bucketDelete} placeholder="Test" onchange={bucketDeleteChange}/>
    </div>
    <!--  Nom de la mesure suppression  -->
    <label class="labelFormStandard">Nom de la mesure:</label>
    <div class="cardInput">
      <input class="inputComponents" type="text" ref="measurementDelete" value={data.specificData.measurementDelete} placeholder="electricitySensors" onchange={measurementDeleteChange}/>
    </div>
  <!--  Tag de suppression et valeur de ce tag  -->
    <label class="labelFormStandard">Tag et sa valeur</label>
    <div class="cardInput">
      <div onclick={addRowClickDelete} class="btnFil commandButtonImage">
        Ajouter
        <img class="imgFil" src="./image/ajout_composant.svg" title="Importer un Workflow">
        <input onchange={import} ref="import" type="file" style="display:none;"/>
      </div>
    </div>
    <zentable ref="tagDelete" style="flex:1" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
      <yield to="row">
        <div class="tableRowLocation">
          <input type="text" placeholder="location" value={tag} data-field="tag"/>
        </div>
        <div class="tableRowTagValue">
          <input type="text" placeholder="coma" value={tagValue} data-field="tagValue"/>
        </div>
      </yield>
    </zentable>
    </div>
  <!--  Insertion des données  -->
  <div id="insertData" show={ data.specificData.insertChecked == 'checked' }>
    <div>
      <div class="bar"/>
      <label class="labelFormStandard">Insertion des données :</label>
      <div class="bar"/>
    </div>
    <!--  Bucket insertion  -->
    <div id="bucketInsert">
      <label class="labelFormStandard">Bucket:</label>
      <div class="cardInputInsert">
        <input class="inputComponents" type="text" ref="bucketInsert" value={data.specificData.bucketInsert} placeholder="Test" onchange={bucketInsertChange}/>
      </div>
    </div>
    <!--  Nom de la mesure insertion -->
    <label class="labelFormStandard">Nom de la mesure:</label>
    <div class="cardInput">
      <input class="inputComponents" type="text" ref="measurementInsert" value={data.specificData.measurementInsert} placeholder="electricitySensors" onchange={measurementInsertChange}/>
    </div>
    <!--  Timestamp  -->
    <label class="labelFormStandard">Champs contenant le timestamp:</label>
    <div class="cardInput">
      <input class="inputComponents" type="text" ref="timestamp" value={data.specificData.timestamp} onchange={timestampChange}/>
    </div>
    <!--  Champs d'id  -->
    <label class="labelFormStandard">Champs de tags:
      <a href="https://docs.influxdata.com/influxdb/v1.8/concepts/glossary/#tag" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
    </label>
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
  <div id="queryData" show={data.specificData.requestChecked == 'checked'}>
    <div>
      <div class="bar"/>
      <label class="labelFormStandard">Requêtage des données :</label>
      <div class="bar"/>
    </div>
    <label>Valeur(Mettre uniquement query de recherche de données):
      <a href="https://docs.influxdata.com/influxdb/v2.6/reference/syntax/influxql/spec/" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
    </label>
    <div class="containerH">
      <textarea class="textArea" placeholder="from(bucket:'Test') |> range(start: -3d) |> filter(fn: (r) => r._measurement == 'electricitySensors')" type="textarea" ref="querySelect" onchange={querySelectChange} value={data.specificData.querySelect} style="flex-grow:1">{data.specificData.querySelect}</textarea>
    </div>
  </div>

<script>

  this.data = {};
  this.data.specificData= {};
  this.data.specificData.tagKey = '';
  this.data.specificData.timestamp = '';
  this.data.specificData.apiKey = '';
  this.data.specificData.url = '';

  this.data.specificData.bucketInsert = '';
  this.data.specificData.bucketDelete = '';
  this.data.specificData.measurementInsert = '';
  this.data.specificData.measurementDelete = '';

  this.data.specificData.organization = '';
  this.data.specificData.querySelect = '';
  this.data.specificData.deleteTag = '';
  this.data.specificData.deleteTagValue = '';
  this.data.specificData.tags = [];
  this.data.specificData.choices = [];

  this.data.specificData.insertChecked = '';
  this.data.specificData.deleteChecked = '';
  this.data.specificData.requestChecked = '';
  this.currentRowId = undefined;

  //code for the show/hide each component part
  showHideElements(checkedRadio) {
    //console.log('checkedRadio : ',checkedRadio);

    fullCheckedArray = ['requeter','inserer','supprimer'];
    tempCheckedArray = [];
  
    if(this.checkedRadio.length > 0){
      checkedRadio.forEach((checkedButton) => {
        tempCheckedArray.push(checkedButton.value);

        if (checkedButton.value == "requeter") {
          this.data.specificData.requestChecked = 'checked';
        } else if (checkedButton.value == "supprimer") {
          this.data.specificData.deleteChecked = 'checked';
        } else if (checkedButton.value == "inserer") {
          this.data.specificData.insertChecked = 'checked';
        }
      })
    }

    const notCheckedArray = fullCheckedArray.filter(f => !tempCheckedArray.includes(f));
    console.log('notchecked : ',notCheckedArray);

    notCheckedArray.forEach((notChecked) => {
      if (notChecked == "requeter") {
          this.data.specificData.requestChecked = '';
        } else if (notChecked == "supprimer") {
          this.data.specificData.deleteChecked = '';
        } else if (notChecked == "inserer") {
          this.data.specificData.insertChecked = '';
        }
    })

  }

  returnChoices(){
    let choiceArray = []
    if (this.data.specificData.requestChecked == "checked") {
      choiceArray.push("requeter");
    } 
    if (this.data.specificData.deleteChecked == "checked") {
      choiceArray.push("supprimer");
    }
    if (this.data.specificData.insertChecked == "checked") {
      choiceArray.push("inserer");
    }
    return choiceArray;
  }

  saveRadioState(){
    this.checkedRadio = document.querySelectorAll('input[name="action"]:checked');
    this.showHideElements(this.checkedRadio);
    const choicesArray = this.returnChoices();
    console.log('choix : ',choicesArray);
    this.data.specificData.choices = choicesArray;
  }
  //end of the code for show/hide elements

  //beggining of code for the input section
  addRowClick(e) {
    this.refs.tagsTable.data.push({})
  }

  addRowClickDelete(e) {
    //var index=parseInt(e.currentTarget.dataset.rowid) console.log(index);
    this.refs.tagDelete.data.push({})
  }
  //end of code for the input section

  deleteTagValueChange(e){
    this.data.specificData.deleteTagValue = e.target.value;
  }
  deleteTagChange(e) {
    this.data.specificData.deleteTag = e.target.value;
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
  organizationChange(e) {
    this.data.specificData.organization = e.target.value;
  }
  deleteChange(e){
    this.data.specificData.deleteData = e.target.checked
  }
  querySelectChange(e){
    this.data.specificData.querySelect = e.target.value;
  }

  bucketInsertChange(e) {
    this.data.specificData.bucketInsert = e.target.value;
  }
  bucketDeleteChange(e){
    this.data.specificData.bucketDelete = e.target.value;
  }
  measurementDeleteChange(e){
    this.data.specificData.measurementDelete = e.target.value;
  }
  measurementInsertChange(e) {
    this.data.specificData.measurementInsert = e.target.value;
  }

  this.updateData=function(dataToUpdate){
    this.data = dataToUpdate;
   // this.refs.tagsTable.data = this.data.specificData.tags;
    this.refs.timestamp.data = this.data.specificData.timestamp;
    this.refs.apiKey.data = this.data.specificData.apiKey;
    this.refs.url.data = this.data.specificData.url;
    
    this.refs.measurementInsert.data = this.data.specificData.measurementInsert;
    this.refs.measurementDelete.data = this.data.specificData.measurementDelete;
    this.refs.bucketInsert.data = this.data.specificData.bucketInsert;
    this.refs.bucketDelete.data = this.data.specificData.bucketDelete;
    
    this.refs.organization.data = this.data.specificData.organization;
    this.refs.tagsTable.data = this.data.specificData.tags || [];
    this.refs.deleteData = this.data.specificData.deleteData || false;
    this.refs.querySelect = this.data.specificData.querySelect;

    this.refs.deleteTag = this.data.specificData.deleteTag;
    this.refs.deleteTagValue = this.data.specificData.deleteTagValue;
    this.refs.insertChecked = this.data.specificData.insertChecked;
    this.refs.deleteChecked = this.data.specificData.deleteChecked;
    this.refs.requestChecked = this.data.specificData.requestChecked;
    this.refs.tagDelete.data = this.data.specificData.tagDelete || [];

    /*const choicesArray = this.returnChoices();
    this.data.specificData.choices ? this.data.specificData.choices : this.data.specificData.choices = [];
    this.data.specificData.choices.push(choicesArray);*/

    this.update();
  }.bind(this);

  this.on('mount', function () {
    //tags
    this.refs.tagsTable.on('dataChanged', data => {
      this.data.specificData.tags = data;
    });
    this.refs.tagsTable.on('delRow', row => {
        this.refs.tagsTable.data.splice(row.rowid, 1);
      });
    //scrapers
    this.refs.tagDelete.on('dataChanged', data => {
      this.data.specificData.tagDelete = data;
    });

    this.refs.tagDelete.on('delRow', (row) => {
      //console.log(row);
      this.refs.tagDelete.data.splice(row.rowId, 1);
    });
    RiotControl.on('item_current_changed',this.updateData);
  });
  
  this.on('unmount', function () {
    RiotControl.off('item_current_changed', this.updateData);
  });
</script>

<style>
  .containerRowScrapper {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex: 1
  }

  .tableRowLocation {
    font-size: 0.85em;
    flex:0.3;
    justify-content: flex-start;
    align-items: center;
    display: flex;
    width: 90%; 
    padding: 0.7vh;
  }
  .tableRowTagValue {
    font-size: 0.85em;
    flex:0.3;
    justify-content: flex-start;
    align-items: center;
    display: flex;
    width: 90%; 
    padding: 0.7vh;
  }
  
  zentable .tableHeader{
    justify-content: flex-start;
    padding-left : 5%;
  }

  .hide {
    display: none;
  }

  .display {
    display: block;
  }

  .fieldsetInflux {
    border-style: solid;
    border-width: 1px;
    margin: 1vh;
    width:40%;
  }

  .scrollable {
    height: 20%;
  }

</style>

</influxdb-connector-editor>
