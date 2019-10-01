<value-mapping-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Value-mapping" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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
  <div class="containerH" style="justify-content:space-between">
    <div class="options">
      <label class="labelFormStandard">Ignorer la valeur source:</label>
      <div class="cardInput">
        <label class="switch">
            <input type="checkbox" name="forgetOriginalValueInput" ref="forgetOriginalValueInput" checked={data.specificData.forgetOriginalValue} onchange={forgetOriginalValueChange}/>
            <span class="slider round"></span>
        </label>
      </div>
    </div>
    <div class="options">
      <label class="labelFormStandard">Ignorer les majuscules:</label>
      <div class="cardInput">
        <label class="switch">
            <input type="checkbox" name="ignoreCase" ref="ignoreCaseInput" checked={data.specificData.ignoreCase} onchange={ignoreCaseChange}/>
            <span class="slider round"></span>
        </label>
      </div>
    </div>
    <div class="options">
      <label class="labelFormStandard">Ignorer les accents:</label>
      <div class="cardInput">
        <label class="switch">
            <input type="checkbox" name="ignoreAccent" ref="ignoreAccentInput" checked={data.specificData.ignoreAccent} onchange={ignoreAccentChange}/>
            <span class="slider round"></span>
        </label>
      </div>
    </div>
  </div>



  <label class="labelFormStandard">Ajouter une valeur</label>
  <div class="cardInput">
    <div onclick={addRowClick} class="btnFil commandButtonImage">
      Ajouter
      <img class="imgFil" src="./image/ajout_composant.svg" title="Importer un Workflow">
      <input onchange={import} ref="import" type="file" style="display:none;"/>
    </div>
  </div>

  <zentable ref="mappingTable" style="flex:1" drag={true} title="vos changement de valeurs" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
    <yield to="header">
      <div class="containerTitle">
        <div class="tableTitleEnter">Valeur d'entrée</div>
        <div class="tableTitleExit">Valeur de sortie</div>
        <div class="tableEmpty"/>
      </div>
    </yield>
    <yield to="row">
      <div class="containerRowMapping">
        <div class="tableRowEnter">
          <input style="width: 90%; padding: 0.7vh;" placeholder="Valeur initial" type="text" value={flowValue} data-field="flowValue"/>
        </div>
        <div style="padding: 0.7vh;">&#10513;</div>
        <div class="tableRowExit">
          <input style="width: 90%; padding: 0.7vh;" placeholder="Remplacer par..." type="text" value={replacementValue} data-field="replacementValue"/>
        </div>
      </div>
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

    forgetOriginalValueChange(e){
        this.data.specificData.forgetOriginalValue = event.target.checked
    }
    ignoreCaseChange(e){
        this.data.specificData.ignoreCase = event.target.checked
    }
    ignoreAccentChange(e){
        this.data.specificData.ignoreAccent = event.target.checked
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

      // this.refs.forgetOriginalValueInput.addEventListener('change', event => {
      //   this.data.specificData.forgetOriginalValue = event.target.checked
      // });
    });

    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
  <style scoped="scoped">
    .containerTitle {
      border-radius: 2px;
      width: 90%;
      flex-direction: row;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgb(26,145,194);
    }
    .tableTitleEnter {
      font-size: 0.85em;
      flex:0.425;
      color: white;
      text-transform: uppercase;
      text-align: center;

      text-align: center;
    }
    .tableTitleExit {
      font-size: 0.85em;
      flex:0.425;
      color: white;
      text-transform: uppercase;
      text-align: center;
    }
    .tableEmpty {
      flex:0.15;
    }

    .containerRowMapping {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex: 1
    }
    .tableRowEnter {
      font-size: 0.85em;
      flex:0.5;
      justify-content: center;
      align-items: center;
      display: flex;
    }
    .tableRowExit {
      font-size: 0.85em;
      flex:0.5;
      justify-content: center;
      align-items: center;
      display: flex;
    }

  </style>
</value-mapping-editor>
