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

  <label class="containerH" style="align-items: center;min-height:30px">
    Ignorer la valeur source:
    <span class="switch" style="margin-left:10px;">
      <input type="checkbox" name="forgetOriginalValueInput" ref="forgetOriginalValueInput" checked={data.specificData.forgetOriginalValue} />
      <span class="slider round"></span>
    </span>

  </label>

  <div class="containerH table-title" style="margin-top: 5px;align-items: center;justify-content:flex-end;">
    <div>Ajouter une valeur</div>
    <image class="commandButtonImage" placeholder="Nouvelle valeur" src="./image/ajout_composant.svg" width="30" height="30" onclick={addRowClick}></image>
  </div>
  <zentable ref="mappingTable" style="flex:1" drag={true} title="vos changement de valeurs" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
    <yield to="header">
      <div class="table-title"style="padding-left: 70px;width:50%;">Valeur d'entrée</div>
      <div class="table-title"style="width:50%;">Valeur de sortie</div>
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

      this.refs.forgetOriginalValueInput.addEventListener('change', event => {
        this.data.specificData.forgetOriginalValue = event.target.checked
      });
    });

    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
  <style scoped="scoped"></style>
</value-mapping-editor>
