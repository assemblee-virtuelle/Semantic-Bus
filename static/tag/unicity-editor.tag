<unicity-editor class="containerV">
  <div>agrégateur de flux</div>

  <label>
    champ de source
  </label>
  <input type="text" value={data.specificData.source} onkeyup={onSourceChange}>
  <label>
    champs d'unicité
  </label>
  <div class="unicityTable containerV">
    <div class="containerH commandBar" style="justify-content:flex-end">
      <div class="commandGroup">
        <image src="./image/ajout_composant.svg" class="commandButtonImage" width="50" height="50" onclick={addRow}></image>
      </div>
    </div>
    <zenTable ref="unicityTableRef" style="flex:1" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
      <yield to="header">
        <div>champ</div>
      </yield>
      <yield to="row">
        <input type="text" value={field} data-field="field"/>
      </yield>
    </zenTable>
  </div>

  <script>

    this.updateData = function (dataToUpdate) {
      console.log('dataToUpdate',dataToUpdate);
      this.data = dataToUpdate;
      this.data.specificData.unicityFields=this.data.specificData.unicityFields||[];
      this.refs.unicityTableRef.data = this.data.specificData.unicityFields;
      this.update();
    }.bind(this);

    this.addRow=function(e) {
      this.refs.unicityTableRef.data.push({})
      //console.log(this.tags.zentable.data)
    }.bind(this);

    this.onSourceChange=function(e) {
      console.log('ALLO');
      this.data.specificData.source = e.target.value;
    }.bind(this);

    this.on('mount', function () {
      RiotControl.on('item_current_changed', this.updateData);
      this.refs.unicityTableRef.on('dataChanged', data => {
        this.data.specificData.unicityFields = data;
      });
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });

    // this.fieldValueChange = function (e) {   //console.log(e.target.value);   this.fieldValue = e.target.value;   console.log(this.currentRowId)   this.data.specificData.unicityFields[this.currentRowId]={field:this.fieldValue};   console.log("value
    // change", this.data.specificData.unicityFields)   this.tags.zentable.data = this.data.specificData.unicityFields; }.bind(this);
  </script>
  <style scoped>
    .unicityTable {
      border-style: solid;
      border-width: 1px;
    }

  </style>
</unicity-editor>
