<value-mapping-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Value-mapping" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>

  <!-- Titre du composant -->
  <div class="contenaireV title-component">Value mapping</div>
  <!-- Description du composant -->
  <div>Remplacer les valeurs d'une propriété par une autre.</div>
  <!-- Champ du composant -->
  <div class="commandBar containerH" style="justify-content:flex-start">
    <label>
      Nouvelle valeur</label>
    <image class="commandButtonImage" src="./image/ajout_composant.svg" width="30" height="30" onclick={addRowClick}></image>
  </div>
  <zentable ref="mappingTable" style="width: 800px;flex:1" drag={true} title="vos changement de valeurs" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
    <yield to="header">
      <div style="margin-left: 70px;width:50%;">Valeur d'entrée</div>
      <div style="width:10%"></div>
      <div style="width:70%;">Valeur de sortie</div>
    </yield>
    <yield to="row">
      <input style="width:50%" placeholder="Valeur initial" type="text" value={flowValue} data-field="flowValue"/>
      <div style="width:50px;height:15px;">
        --->
      </div>
      <input style="width:50%" placeholder="Remplacer par..." type="text" value={replacementValue} data-field="replacementValue"/>
    </yield>
  </zentable>

  <script>
    this.data = {};

    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.refs.mappingTable.data = this.data.specificData.mappingTable || [];
      this.update();
    }.bind(this);

    addRowClick(e) {
      this.refs.mappingTable.data.push({})
    }

    this.on('mount', function () {
      this.refs.mappingTable.on('dataChanged', data => {
        this.data.specificData.mappingTable = data;
      })
      this.refs.mappingTable.on('delRow', row => {
        console.log(row);
        this.refs.mappingTable.data.splice(row.rowId, 1);
      });
      RiotControl.on('item_current_changed', this.updateData);
    });

    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
  <style scoped="scoped"></style>
</value-mapping-editor>
