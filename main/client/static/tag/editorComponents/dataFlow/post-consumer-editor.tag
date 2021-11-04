<post-consumer-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Post-consumer" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <div class="contenaireV title-component">{data.type}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">{data.description}</div>
  <!-- Champ du composant -->
  <div>
    <div class="bar"/>
  </div>

  <label class="labelFormStandard">URL externe où envoyer les données:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" name="urlInput" ref="urlInput" onChange={this.urlInputChanged} value={data.specificData.url}></input>
  </div>
  <label class="labelFormStandard">Content-type:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="application/json" type="text" name="contentTypeInput" ref="contentTypeInput" onChange={this.contentTypeInputChanged} value={data.specificData.contentType}></input>
  </div>
  <label class="labelFormStandard">Methode:</label>
  <div class="cardInput">
    <select class="inputComponents" name="methodInput" ref="methodeInput" onchange={methodInputChanged}>
      <option value="POST" selected={data.specificData.method==='POST' || data.specificData.contentType===undefined}>POST</option>
      <option value="PATCH" selected={data.specificData.method==='PATCH'}>PATCH</option>
      <option value="PUT" selected={data.specificData.method==='PUT'}>PUT</option>
      <option value="DELETE" selected={data.specificData.method==='DELETE'}>DELETE</option>
    </select>
  </div>
  <label class="labelFormStandard">Header</label>
  <div class="cardInput">
    <div onclick={addRowClick} class="btnFil commandButtonImage">
      Ajouter
      <img class="imgFil" src="./image/ajout_composant.svg" title="Importer un Workflow">
      <input onchange={import} ref="import" type="file" style="display:none;"/>
    </div>
  </div>
  <zentable ref="headerTable" title="header de la requete" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
    <yield to="row">
      <input placeholder="Clé" type="text" style="flex-basis:50%; margin: 5px" value={key} data-field="key"/>
      <input placeholder="Valeur" type="text" style="flex-basis:50%; margin: 5px" value={value} data-field="value"/>
    </yield>
  </zentable>
  <script>
    this.data = {};
    this.urlInputChanged = e => {
      this.data.specificData.url = e.currentTarget.value;
    };
    methodInputChanged(e) {
      this.data.specificData.method = e.currentTarget.value;
    }
    this.contentTypeInputChanged = e => {
      this.data.specificData.contentType = e.currentTarget.value;
    };
    this.addRowClick = function (e) {
      this.refs.headerTable.data.push({})
    }
    this.updateData = dataToUpdate => {
      this.data = dataToUpdate;
      this.refs.headerTable.data = this.data.specificData.headers || [];
      this.update();
    };
    this.on('mount', function () {
      this.refs.headerTable.on('dataChanged', data => {
        this.data.specificData.headers = data;
      });
      this.refs.headerTable.on('delRow', row => {
        this.refs.headerTable.data.splice(row.rowid, 1);
      });
      RiotControl.on('item_current_changed', this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</post-consumer-editor>
