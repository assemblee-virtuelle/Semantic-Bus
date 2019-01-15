<unicity-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Unicity" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Unicity</div>
  <!-- Description du composant -->
  <div>Structurer les données en vérifiant l'unicité par champ et répartir les valeurs par source.</div>
  <!-- Champ du composant -->
  <label>Champ de source:</label>
  <input type="text" value={data.specificData.source} onkeyup={onSourceChange}>

  <div class="containerH table-title" style="margin-top: 5px;align-items: center;justify-content:flex-end;">
    <div>Champs d'unicité </div>
    <image src="./image/ajout_composant.svg" placeholder:"Nouveau champ"class="commandButtonImage" width="30" height="30" onclick={addRow}></image>
  </div>

  <zentable style="flex:1" ref="unicityTableRef" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
    <yield to="row">
      <input style="flex-grow: 1;width:90%;" placeholder="Champ"type="text" value={field} data-field="field"/>
    </yield>
  </zentable>

  <script>

    this.updateData = function (dataToUpdate) {
      console.log('dataToUpdate', dataToUpdate);
      this.data = dataToUpdate;
      this.data.specificData.unicityFields = this.data.specificData.unicityFields || [];
      this.refs.unicityTableRef.data = this.data.specificData.unicityFields;
      this.update();
    }.bind(this);

    this.addRow = function (e) {
      this.refs.unicityTableRef.data.push({})
      //console.log(this.tags.zentable.data)
    }.bind(this);

    this.onSourceChange = function (e) {
      console.log('ALLO');
      this.data.specificData.source = e.target.value;
    }.bind(this);

    this.on('mount', function () {
      RiotControl.on('item_current_changed', this.updateData);
      this.refs.unicityTableRef.on('dataChanged', data => {
        this.data.specificData.unicityFields = data;
      });
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });

    // this.fieldValueChange = function (e) {   console.log(e.target.value);   this.fieldValue = e.target.value;   console.log(this.currentRowId)   this.data.specificData.unicityFields[this.currentRowId]={field:this.fieldValue};   console.log("value
    // change", this.data.specificData.unicityFields)   this.tags.zentable.data = this.data.specificData.unicityFields; }.bind(this);
  </script>
  <style scoped="scoped"></style>
</unicity-editor>
