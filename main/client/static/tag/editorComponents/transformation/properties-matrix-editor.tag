<properties-matrix-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Property-matrix" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Property matrix</div>
    <!-- Description du composant -->
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">Reconstruire des objects à partir de plusieurs propriétés en liste.</div>
  <!-- Champ du composant -->
  <div>
    <div class="bar"/>
  </div>

  <label class="labelFormStandard">Attribut à générer:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="Attribut" type="text" value={data.specificData.attribut} onkeyup={onAttributChange}>
  </div>
  <label class="labelFormStandard">Ajouter un champ</label>
  <div class="cardInput">
    <image src="./image/ajout_composant.svg" placeholder="Nouveau Champ" class="commandButtonImage btnAddSize" onclick={addRow}></image>
  </div>

  <zentable ref="fieldsTableRef" style="flex:1;" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
    <yield to="row">
      <input style="width:90%;margin: 5px" placeholder="Le champ source doit être un tableau" type="text" value={field} data-field="field"/>
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
    }.bind(this);

    this.onAttributChange = function (e) {
      this.data.specificData.attribut = e.target.value;
    }.bind(this);

    this.on('mount', function () {
      RiotControl.on('item_current_changed', this.updateData);
      this.refs.fieldsTableRef.on('dataChanged', data => {
        this.data.specificData.fields = data;
      });
      this.refs.fieldsTableRef.on('delRow', item => {
        const fields = this.data.specificData.fields
        fields.splice(fields.findIndex(_ => _.rowId === item.rowId), 1)
      });
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
  <style scoped="scoped"></style>
</properties-matrix-editor>
