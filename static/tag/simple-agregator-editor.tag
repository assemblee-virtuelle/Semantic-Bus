<simple-agregator-editor>
  <div>agrégateur de flux</div>
  <div class="containerV">
    <div class="containerH">
      <div>
        <label>
          edition d'un champ d'unicité
        </label>
        <input if="fieldEditing" type="text" value={fieldValue} onkeyup={fieldValueChange}>
      </div>
    </div>
    <div class="containerH commandBar">
      <div class="commandGroup">
        <image src="./image/ajout_composant.svg" class="commandButtonImage" width="50" height="50" onclick={addRow}></image>
      </div>
    </div>
    <zenTable style="flex:1" title="champs qui determinent l'unicité">
      <yield to="header">
        <div>champ</div>
      </yield>
      <yield to="row">
        <div>{field}</div>
      </yield>
    </zenTable>
  </div>

  <script>
    this.fieldValue = "";
    this.innerData = {};
    this.currentRowId=undefined;
    this.test = function () {
      consol.log('test');
    }

    Object.defineProperty(this, 'data', {
      set: function (data) {
        this.innerData = data;
        this.update();
      }.bind(this),
      get: function () {
        return this.innerData;
      },
      configurable: true
    });
    this.updateData=function(dataToUpdate){
      this.data = dataToUpdate;
      if(this.data.specificData){
        if (this.data.specificData.unicityFields == undefined) {
          this.data.specificData.unicityFields = [];
        }
      }else{
        this.data.specificData = {}
        if (this.data.specificData.unicityFields == undefined) {
          this.data.specificData.unicityFields = [];
        }
      }
      if (this.tags.zentable != undefined) {
        this.tags.zentable.data = this.data.specificData.unicityFields;
      }
      this.update();
    }.bind(this);

    addRow(e){
      this.data.specificData.unicityFields.push({field: this.fieldValue});
      this.tags.zentable.data = this.data.specificData.unicityFields;
      console.log(this.tags.zentable.data)
    }

    this.on('mount', function () {
      this.tags.zentable.on('rowsSelected', function (data) {
        console.log(data);
        this.currentRowId=data.rowid
        this.fieldValue = data.field;
        this.update();
      }.bind(this));

      this.tags.zentable.on('delRow', function (row) {
        console.log(row);
        this.data.specificData.unicityFields.splice(row.rowid, 1);
        this.tags.zentable.data = this.data.specificData.unicityFields;
      }.bind(this));
      RiotControl.on('item_current_changed',this.updateData);

    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });


    this.fieldValueChange = function (e) {
      //console.log(e.target.value);
      this.fieldValue = e.target.value;
      console.log(this.currentRowId)
      this.data.specificData.unicityFields[this.currentRowId]={field:this.fieldValue};
      console.log("value change", this.data.specificData.unicityFields)
      this.tags.zentable.data = this.data.specificData.unicityFields;
    }.bind(this);

  </script>
  <style scoped></style>
</simple-agregator-editor>
