<properties-matrix-editor class="containerV">
  <div>matrice de propriétés</div>

  <label>
    attribut à générer
  </label>
  <input type="text" value={data.specificData.attribut} onkeyup={onAttributChange}>
  <label>
    champs sources (doivent être des tableaux)
  </label>
  <div class="fieldsTable containerV">
    <div class="containerH commandBar" style="justify-content:flex-end">
      <div class="commandGroup">
        <image src="./image/ajout_composant.svg" class="commandButtonImage" width="50" height="50" onclick={addRow}></image>
      </div>
    </div>
    <zenTable ref="fieldsTableRef" style="flex:1" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
      <yield to="header">
        <div>champ</div>
      </yield>
      <yield to="row">
        <input type="text" value={field} data-field="field"/>
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
