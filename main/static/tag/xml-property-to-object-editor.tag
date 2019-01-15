<xml-property-to-object-editor>
  <div>propriété xml à transformer en onjet</div>
  <label>propriété</label>
  <input type="text" name="propertyToConvert" value={data.specificData.propertyToConvert}></input>
  <script>

    this.innerData={};
    this.test=function(){
      consol.log('test');
    }

    Object.defineProperty(this, 'data', {
       set: function (data) {
         this.innerData=data;
         this.update();
       }.bind(this),
       get: function () {
        return this.innerData;
      },
      configurable: true
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
    this.on('mount', function () {
      this.propertyToConvert.addEventListener('change',function(e){
        this.innerData.specificData.propertyToConvert=e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed',this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</xml-property-to-object-editor>
