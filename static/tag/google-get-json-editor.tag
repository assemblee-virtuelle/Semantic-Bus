<google-get-json-editor>
  <div>information de connection à google calc</div>
  <label>key</label>
  <input type="text" id="keyInput" onKeyup={changeKeyInput} ref="keyInput" value={data?data.specificData.key: null }></input>
  <label>select</label>
  <input type="text" id="selectInput" ref="selectInput" onKeyup={changeSelectInput} value={data?data.specificData.select: null}></input>
  <label>offset</label>
  <input type="text" id="offsetInput" ref="offsetInput"  onKeyup={changeOffsetInput} value={data? data.specificData.offset: null}></input>
  <script>

  //// marche mais à changer je pense
  changeKeyInput(e){
    if(this.data != null && this.data.specificData != null ){
      //console.log('keychange',this.data);
      this.data.specificData.key = e.currentTarget.value;
      RiotControl.trigger('item_current_updateField',{field:'specificData.key',data:e.currentTarget.value});
    }
  };

  changeSelectInput(e){
    if(this.data != null && this.data.specificData != null ){
      this.data.specificData.select= e.currentTarget.value;
    }
  };

  changeOffsetInput(e){
    if(this.data != null && this.data.specificData != null ){
      this.data.specificData.offset = e.currentTarget.value;
    }
  };

  this.updateData=function(dataToUpdate){
    // console.log('ALLO',dataToUpdate);
    this.data = dataToUpdate;
    this.update();
  }.bind(this);

  this.on('mount', function () {
    RiotControl.on('item_current_changed',this.updateData);
  });
  this.on('unmount', function () {
    RiotControl.off('item_current_changed',this.updateData);
  });


  </script>
</google-get-json-editor>
