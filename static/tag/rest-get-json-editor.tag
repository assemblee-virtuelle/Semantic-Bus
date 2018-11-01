<rest-get-json-editor style="justify-content:center; align-items: center;">
  <!-- Titre du composant -->
  <div class="contenaireV title-component">REST GET JSON</div>
  <!-- Description du composant -->
  <label style="padding-top: 10px;">Intéroger une API REST avec une requete Get qui fourni un flux JSON, XML</label>
  <!-- Champ du composant -->
  <label style="padding-top: 10px;">url du web service à intéroger</label>
  <input class="field" style="width:600px;"placeholder="champ libre" type="text" ref="urlInput" value={data.specificData.url} onchange={urlInputChange}></input>
  <label style="padding-top: 10px;">content-type forcé</label>
  <input class="field" style="width:600px;"placeholder="champ libre" type="text" ref="overidedContentTypeInput" value={data.specificData.overidedContentType} onchange={overidedContentTypeInputChange}></input>

  <label style="padding-top: 10px;">header</label>
  <div class="commandBar containerH" style="justify-content:flex-end">
    <image class="commandButtonImage" src="./image/ajout_composant.svg" width="50" height="50" onclick={addRowClick}></image>
  </div>
  <zenTable ref="headerTable" style="flex:1" title="header de la requete" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
    <yield to="row">
      <input class="field" style="width:300px;" placeholder="Clé" type="text" style="flex-basis:50%" value={key} data-field="key"/>
      <input class="field" style="width:300px;" placeholder="Valeur" type="text" style="flex-basis:50%" value={value} data-field="value"/>
    </yield>
  </zenTable>

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
