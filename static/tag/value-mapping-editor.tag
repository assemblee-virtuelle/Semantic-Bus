<value-mapping-editor>
  <div>mapping de valeur</div>
  <div class="containerV">
    <div class="containerH">
      <div>
        <label>
          valeur du flux
        </label>
        <input if="fieldEditing" type="text" value={flowValue} onkeyup={flowValueChange}>
      </div>
    </div>
    <div class="containerH">
      <div>
        <label>
          valeur de remplacement
        </label>
        <input if="fieldEditing" type="text" value={replacementdValue} onkeyup={replacementValueChange}>
      </div>
    </div>
    <zenTable style="flex:1" title="mapping des valeurs">
      <yield to="header">
        <div>flux</div>
        <div>remplacement</div>
      </yield>
      <yield to="row">
        <div style="width:50%">{flowValue}</div>
        <div style="width:50%">{replacementValue}</div>
      </yield>
    </zenTable>
  </div>

  <script>
    this.flowValue = "";
    this.replacementdValue = "";
    this.data = {};
    this.currentRowId=undefined;



    this.on('unmount', function () {
      //RiotControl.off('item_current_changed');
    });
    this.on('mount', function () {
      this.tags.zentable.on('rowSelect', function (data) {
        console.log(data);
        this.currentRowId=data.rowid
        this.flowValue = data.flowValue;
        this.replacementdValue = data.replacementdValue;
        this.update();
      }.bind(this));

      this.tags.zentable.on('addRow', function () {
        //console.log(this.data.specificData.unicityFields)
        this.data.specificData.mappingTable.push({flowValue: this.flowValue,replacementdValue: this.replacementdValue});
        this.tags.zentable.data = this.data.specificData.mappingTable.unicityFields;
        console.log(this.tags.zentable.data)
      }.bind(this));

      this.tags.zentable.on('delRow', function (row) {
        console.log(row);
        this.data.specificData.mappingTable.splice(row.rowid, 1);
        this.tags.zentable.data = this.data.specificData.mappingTable;
      }.bind(this));

    });

    RiotControl.on('item_current_changed', function (data) {
      this.data = data;
      if (this.data.specificData.mappingTable == undefined) {
        this.data.specificData.mappingTable = [];
      }
      console.log(this.data.specificData.unicityFields);
      if (this.tags.zentable != undefined) {
        this.tags.zentable.data = this.data.specificData.mappingTable;
      }
      this.update();
    }.bind(this));

    this.flowValueChange = function (e) {
      //console.log(e.target.value);
      this.flowValue = e.target.value;
      //console.log(this.currentRowId)
      this.data.specificData.mappingTable[this.currentRowId].flowValue=this.flowValue;
      //console.log("value change", this.data.specificData.unicityFields)
      this.tags.zentable.data = this.data.specificData.mappingTable;
    }.bind(this);
    this.replacementValueChange = function (e) {
      //console.log(e.target.value);
      this.replacementValue = e.target.value;
      //console.log(this.currentRowId)
      this.data.specificData.mappingTable[this.currentRowId].replacementValue=this.replacementValue;
      //console.log("value change", this.data.specificData.unicityFields)
      this.tags.zentable.data = this.data.specificData.mappingTable;
    }.bind(this);

  </script>
  <style scoped></style>
</value-mapping-editor>
