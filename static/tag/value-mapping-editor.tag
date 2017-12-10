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

    <zenTable style="flex:1" drag={true} title="vos changement de valeurs" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
      <yield to="header">
        <div>flux</div>
        <div>remplacement</div>
      </yield>
      <yield to="row">
        <input type="text" style="flex-basis:50%" value={flowValue} data-field="flowValue"/>
        <input type="text" style="flex-basis:50%" value={replacementValue} data-field="replacementValue"/>
      </yield>
    </yield>
  </zenTable>


<script>
  this.flowValue = "";
  this.replacementdValue = "";
  this.data = {};
  this.currentRowId = undefined;

  this.updateData = function (dataToUpdate) {
    console.log('ALLO');
    this.data = dataToUpdate;
    if (this.data.specificData.mappingTable == undefined) {
      this.data.specificData.mappingTable = [];
    }
    console.log(this.data.specificData);
    if (this.tags.zentable != undefined) {
      this.tags.zentable.data = this.data.specificData.mappingTable;
    }
    this.update();
  }.bind(this);

  addRowClick(e) {
    console.log("add row", e)
    this.data.specificData.mappingTable.push({flowValue: this.flowValue, replacementValue: this.replacementdValue});
    this.tags.zentable.data = this.data.specificData.mappingTable;

    //var index=parseInt(e.currentTarget.dataset.rowid) console.log(index); this.recalculateHeader() this.trigger('addRow')
  }

  // recalculateHeader() {   console.log(this.tags.zentable.refs.tableHeader.children)   var headers = this.tags.zentable.refs.tableHeader.children;   for (var row of this.root.querySelectorAll('.tableRow')) {     for (var headerkey in headers) {
  // var numkey = parseInt(headerkey);       if (!isNaN(numkey)) {         //console.log(row.children[numkey].getBoundingClientRect().width);         var width = row.children[numkey].getBoundingClientRect().width;         var cssWidth = width + 'px';
  //       headers[headerkey].style.width = cssWidth ;         headers[headerkey].style.maxWidth = cssWidth ;         headers[headerkey].style.minWidth = cssWidth ;         headers[headerkey].style.flexBasis = cssWidth ;
  // //console.log(headers[headerkey].style);       }     }     break;   } }

  this.flowValueChange = function (e) {
    //console.log(e.target.value);
    this.flowValue = e.target.value;
    //console.log(this.currentRowId)
    this.data.specificData.mappingTable[this.currentRowId].flowValue = this.flowValue;
    //console.log("value change", this.data.specificData.unicityFields)
    this.tags.zentable.data = this.data.specificData.mappingTable;
  }.bind(this);
  this.replacementValueChange = function (e) {
    //console.log(e.target.value);
    this.replacementValue = e.target.value;
    //console.log(this.currentRowId)
    this.data.specificData.mappingTable[this.currentRowId].replacementValue = this.replacementValue;
    //console.log("value change", this.data.specificData.unicityFields)
    this.tags.zentable.data = this.data.specificData.mappingTable;
  }.bind(this);

  this.on('mount', function () {
    this.tags.zentable.on('rowsSelected', function (data) {
      console.log(data);
      this.currentRowId = data.rowid
      this.flowValue = data.flowValue;
      this.replacementdValue = data.replacementValue;
      this.update();
    }.bind(this));

    // this.on('addRow', function () {   //console.log(this.data.specificData.unicityFields)   this.data.specificData.mappingTable.push({flowValue: this.flowValue, replacementValue: this.replacementdValue});   this.tags.zentable.data =
    // this.data.specificData.mappingTable;   //console.log(this.tags.zentable.data) }.bind(this));

    this.tags.zentable.on('delRow', function (row) {
      //console.log(row);
      this.data.specificData.mappingTable.splice(row.rowid, 1);
      this.tags.zentable.data = this.data.specificData.mappingTable;
    }.bind(this));

    RiotControl.on('item_current_changed', this.updateData);

  });

  this.on('unmount', function () {
    RiotControl.off('item_current_changed', this.updateData);
  });
</script>
<style scoped></style>
</value-mapping-editor>
