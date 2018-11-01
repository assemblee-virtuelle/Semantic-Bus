<value-mapping-editor style="justify-content:center; align-items: center;">
  <!-- Titre du composant -->
  <div class="contenaireV title-component">MAPPING DE VALEUR</div>
  <!-- Description du composant -->
  <label style="padding-top: 10px;">Remplacer les valeurs d'une propriété par une autre</label>
  <!-- Champ du composant -->
  <div class="commandBar containerH" style="width: 90%;justify-content:flex-end">
    <image class="commandButtonImage" src="./image/ajout_composant.svg" width="50" height="50" onclick={addRowClick}></image>
  </div>

  <zenTable ref="mappingTable" style="width: 800px;flex:1" drag={true} title="vos changement de valeurs" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
    <yield to="header">
      <div style="padding-left: 100px">Valeur d'entrée</div>
      <div style="width:10%"></div>
      <div style="padding-left: 100px">Valeur de sortie</div>
    </yield>
    <yield to="row">
      <input class="field" style="width:300px;"placeholder="Valeur initial" type="text" style="width:50%" value={flowValue} data-field="flowValue"/>
      <div style="width:50px;height:15px;"> -> </div>
      <input class="field" style="width:300px;"placeholder="Remplacer par..." type="text" style="width:50%" value={replacementValue} data-field="replacementValue"/>
    </yield>
  </zenTable>

  <script>
    this.data = {};

    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.refs.mappingTable.data = this.data.specificData.mappingTable|| [];
      this.update();
    }.bind(this);

    addRowClick(e) {
      this.refs.mappingTable.data.push({})
    }

    this.on('mount', function () {
      this.refs.mappingTable.on('dataChanged',data=>{
        this.data.specificData.mappingTable=data;
      })
      this.refs.mappingTable.on('delRow', row=>{
        console.log(row);
        this.refs.mappingTable.data.splice(row.rowId, 1);
      });
      RiotControl.on('item_current_changed', this.updateData);
    });

    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
  <style scoped></style>
</value-mapping-editor>
