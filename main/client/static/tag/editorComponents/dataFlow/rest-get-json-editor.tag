<rest-get-json-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Flow-consumer" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Flow consumer</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
    <div class="title-description-component">Interroger une API REST avec une requête GET qui fournit un flux JSON, XML.</div>
  <!-- Champ du composant -->
  <div>
    <div class="bar"/>
  </div>

  <label class="labelFormStandard">URL du web service à interroger:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" ref="urlInput" value={data.specificData.url} onchange={urlInputChange}></input>
  </div>
  <label class="labelFormStandard">Content-type forcé:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" ref="overidedContentTypeInput" value={data.specificData.overidedContentType} onchange={overidedContentTypeInputChange}></input>
  </div>

  <label class="labelFormStandard">Header</label>
  <div class="cardInput">
    <image src="./image/ajout_composant.svg" class="commandButtonImage btnAddSize" onclick={addRowClick}/>
  </div>
  <zentable ref="headerTable" title="header de la requete" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
    <yield to="row">
      <input placeholder="Clé" type="text" style="flex-basis:50%; margin: 5px" value={key} data-field="key"/>
      <input placeholder="Valeur" type="text" style="flex-basis:50%; margin: 5px" value={value} data-field="value"/>
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
