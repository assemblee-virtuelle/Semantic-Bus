<properties-matrix-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Property-matrix" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Property matrix</div>
  <!-- Description du composant -->
  <div>Recontruire des objects à partir de plusieurs propriétés en liste.</div>
  <!-- Champ du composant -->
  <label>Attribut à générer:</label>
  <input placeholder="Attribut" type="text" value={data.specificData.attribut} onkeyup={onAttributChange}>

  <div class="containerH commandBar">
    <div>Nouveau champ
      <image src="./image/ajout_composant.svg" class="commandButtonImage" width="30" height="30" onclick={addRow}></image>
    </div>
  </div>
  <zentable ref="fieldsTableRef" style="flex:1" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
    <yield to="row">
      <input style="width: 90%" placeholder="Le champ source doit être un tableau" type="text" value={field} data-field="field"/>
    </yield>
  </zentable>

  <script>

    this.updateData = function (dataToUpdate) {
      console.log('dataToUpdate', dataToUpdate);
      this.data = dataToUpdate;
      this.data.specificData.fields = this.data.specificData.fields || [];
      this.refs.fieldsTableRef.data = this.data.specificData.fields;
      this.update();
    }.bind(this);

    this.addRow = function (e) {
      this.refs.fieldsTableRef.data.push({})
      //console.log(this.tags.zentable.data)
    }.bind(this);

    this.onAttributChange = function (e) {
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

    // this.fieldValueChange = function (e) {   console.log(e.target.value);   this.fieldValue = e.target.value;   console.log(this.currentRowId)   this.data.specificData.unicityFields[this.currentRowId]={field:this.fieldValue};   console.log("value
    // change", this.data.specificData.unicityFields)   this.tags.zentable.data = this.data.specificData.unicityFields; }.bind(this);
  </script>
  <style scoped="scoped"></style>
</properties-matrix-editor>
