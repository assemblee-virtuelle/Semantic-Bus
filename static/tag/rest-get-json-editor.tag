<rest-get-json-editor>
  <div>description du web service à intéroger</div>
  <label>url</label>
  <input type="text" name="urlInput" ref="urlInput" value={data.specificData.url} onchange={urlInputChange}></input>
  <label>header</label>
  <div class="commandBar containerH" style="justify-content:flex-end">
    <image class="commandButtonImage" src="./image/ajout_composant.svg" width="50" height="50" onclick={addRowClick}></image>
  </div>
  <zenTable ref="headerTable" style="flex:1" title="header de la requete" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
    <yield to="header">
      <div>key</div>
      <div>value</div>
    </yield>
    <yield to="row">
      <input type="text" style="flex-basis:50%" value={key} data-field="key"/>
      <input type="text" style="flex-basis:50%" value={value} data-field="value"/>
    </yield>
  </zenTable>
  <script>

    this.data = {};
    this.urlInputChange = function (e) {
      this.data.specificData.url = e.target.value;
    }

    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.refs.headerTable.data = this.data.specificData.headers|| [];
      this.update();
    }.bind(this);

    this.addRowClick=function(e) {
      this.refs.headerTable.data.push({})
    }
    this.on('mount', function () {
      this.refs.headerTable.on('dataChanged',data=>{
        this.data.specificData.headers=data;
      });
      this.refs.headerTable.on('delRow', row=>{
        this.refs.headerTable.data.splice(row.rowid, 1);
      });
      RiotControl.on('item_current_changed', this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</rest-get-json-editor>
