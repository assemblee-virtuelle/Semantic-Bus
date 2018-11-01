<properties-matrix-editor style="justify-content:center; align-items: center;">
<!-- Titre du composant -->
<div class="contenaireV title-component">Matrice de propriétés</div>
<!-- Description du composant -->
  <label style="padding-top: 10px;">Recontruire des objects à partir de plusieurs propriétés en liste</label>
<!-- Champ du composant -->>
  <label style="padding-top: 10px;">Attribut à générer</label>
  <input class="field" style=" margin-bottom: 20px;width:600px;"placeholder="Attribut"type="text" value={data.specificData.attribut} onkeyup={onAttributChange}>

  <div class="fieldsTable containerV" style="width:90%;">
    <div class="containerH commandBar" style="justify-content:flex-end">
      <div class="commandGroup">
        <image src="./image/ajout_composant.svg" class="commandButtonImage" width="50" height="50" onclick={addRow}></image>
      </div>
    </div>
    <zenTable ref="fieldsTableRef" style="flex:1" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
      <yield to="header">
        <div style="padding-left: 20%;">Champ</div>
      </yield>
      <yield to="row">
        <input class="field" style="width:600px;" placeholder="Le champ source doivent être un tableau"type="text" value={field} data-field="field"/>
      </yield>
    </zenTable>
  </div>

  <script>

    this.updateData = function (dataToUpdate) {
      console.log('dataToUpdate',dataToUpdate);
      this.data = dataToUpdate;
      this.data.specificData.fields=this.data.specificData.fields||[];
      this.refs.fieldsTableRef.data = this.data.specificData.fields;
      this.update();
    }.bind(this);

    this.addRow=function(e) {
      this.refs.fieldsTableRef.data.push({})
      //console.log(this.tags.zentable.data)
    }.bind(this);

    this.onAttributChange=function(e) {
      //console.log('ALLO');
      this.data.specificData.attribut = e.target.value;
    }.bind(this);

    this.on('mount', function () {
      RiotControl.on('item_current_changed', this.updateData);
      this.refs.fieldsTableRef.on('dataChanged', data => {
        this.data.specificData.fields = data;
      });
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });

    // this.fieldValueChange = function (e) {   //console.log(e.target.value);   this.fieldValue = e.target.value;   console.log(this.currentRowId)   this.data.specificData.unicityFields[this.currentRowId]={field:this.fieldValue};   console.log("value
    // change", this.data.specificData.unicityFields)   this.tags.zentable.data = this.data.specificData.unicityFields; }.bind(this);
  </script>
  <style scoped>
    .fieldsTable {
      border-style: solid;
      border-width: 1px;
    }

  </style>
</properties-matrix-editor>
