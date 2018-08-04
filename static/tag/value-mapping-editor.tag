<value-mapping-editor class="containerV">
  <div>mapping de valeur</div>
  <div class="commandBar containerH" style="justify-content:flex-end">
    <!--<div class="containerH">
      <div>
        <label>
          valeur du flux
        </label>
        <input if="fieldEditing" type="text" value={flowValue} onkeyup={flowValueChange}>
      </div>
      <div>
        <label>
          valeur de remplacement
        </label>
        <input if="fieldEditing" type="text" value={replacementdValue} onkeyup={replacementValueChange}>
      </div>
    </div>-->

    <image class="commandButtonImage" src="./image/ajout_composant.svg" width="50" height="50" onclick={addRowClick}></image>

  </div>

  <zenTable ref="mappingTable" style="flex:1" drag={true} title="vos changement de valeurs" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
    <yield to="header">
      <div style="width:50%">flux</div>
      <div style="width:20px"></div>
      <div style="width:50%">remplacement</div>
    </yield>
    <yield to="row">
      <input type="text" style="width:50%" value={flowValue} data-field="flowValue"/>
      <div style="width:20px;height:15px;"> -> </div>
      <input type="text" style="width:50%" value={replacementValue} data-field="replacementValue"/>
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
