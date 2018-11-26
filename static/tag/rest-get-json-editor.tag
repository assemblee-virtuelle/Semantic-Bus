<rest-get-json-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-HTTP-flow-consumer" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">HTTP flow consumer</div>
  <!-- Description du composant -->
  <div>Interroger une API REST avec une requête GET qui fournit un flux JSON, XML.</div>
  <!-- Champ du composant -->
  <label>URL du web service à interroger:</label>
  <input placeholder="" type="text" ref="urlInput" value={data.specificData.url} onchange={urlInputChange}></input>
  <label>Content-type forcé:</label>
  <input placeholder="" type="text" ref="overidedContentTypeInput" value={data.specificData.overidedContentType} onchange={overidedContentTypeInputChange}></input>
  <div class="containerH table-title" style="margin-top: 5px;align-items: center;justify-content:flex-end;" >
    <div>Header</div>
      <image src="./image/ajout_composant.svg" placeholder="Nouveau header" class="commandButtonImage" width="30" height="30" onclick={addRowClick}></image>
  </div>
  <zentable ref="headerTable" style="flex:1" title="header de la requete" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
    <yield to="row">
      <input placeholder="Clé" type="text" style="flex-grow: 1;flex-basis:50%" value={key} data-field="key"/>
      <input placeholder="Valeur" type="text" style="flex-grow: 1;flex-basis:50%" value={value} data-field="value"/>
    </yield>
  </zentable>
  <script>

    this.data = {};
    this.urlInputChange = function (e) {
      this.data.specificData.url = e.target.value;
    }

    this.overidedContentTypeInputChange = function (e) {
      this.data.specificData.overidedContentType = e.target.value;
    }

    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.refs.headerTable.data = this.data.specificData.headers || [];
      this.update();
    }.bind(this);

    this.addRowClick = function (e) {
      this.refs.headerTable.data.push({})
    }
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
</rest-get-json-editor>
